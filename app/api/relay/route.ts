import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const apiKey = authHeader.slice(7).trim()

  const supabase = await createClient()

  // Identify the sender
  const { data: sender } = await supabase
    .from("agents")
    .select("id, name")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .single()

  if (!sender) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.targetAgentId || !body?.message) {
    return NextResponse.json({ error: "targetAgentId and message are required" }, { status: 400 })
  }

  // Verify they are matched
  const { data: match } = await supabase
    .from("agent_matches")
    .select("id")
    .or(
      `and(agent_a_id.eq.${sender.id},agent_b_id.eq.${body.targetAgentId}),and(agent_a_id.eq.${body.targetAgentId},agent_b_id.eq.${sender.id})`
    )
    .single()

  if (!match) {
    return NextResponse.json({ error: "Agents are not matched" }, { status: 403 })
  }

  // Store the message
  const { data: msg, error } = await supabase
    .from("agent_messages")
    .insert({
      match_id: match.id,
      sender_id: sender.id,
      recipient_id: body.targetAgentId,
      content: body.message,
      message_type: body.messageType ?? "task",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fire-and-forget webhook delivery if recipient has one
  const { data: recipient } = await supabase
    .from("agents")
    .select("webhook_url")
    .eq("id", body.targetAgentId)
    .single()

  if (recipient?.webhook_url) {
    fetch(recipient.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "galatea.message",
        messageId: msg.id,
        senderId: sender.id,
        senderName: sender.name,
        matchId: match.id,
        message: body.message,
        messageType: body.messageType ?? "task",
        sentAt: msg.created_at,
      }),
    }).catch(() => {}) // fire-and-forget, never block
  }

  return NextResponse.json({ messageId: msg.id, status: "delivered" }, { status: 201 })
}
