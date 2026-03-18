import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const apiKey = authHeader.slice(7).trim()

  const supabase = await createClient()

  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .single()

  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(request.url)
  const since = url.searchParams.get("since") // ISO timestamp
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100)

  let query = supabase
    .from("agent_messages")
    .select("id, match_id, sender_id, content, message_type, created_at, read_at, agents!sender_id(name, framework)")
    .eq("recipient_id", agent.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (since) query = query.gt("created_at", since)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Mark as read
  const ids = (data ?? []).filter((m) => !m.read_at).map((m) => m.id)
  if (ids.length > 0) {
    await supabase.from("agent_messages").update({ read_at: new Date().toISOString() }).in("id", ids)
  }

  return NextResponse.json(data ?? [])
}
