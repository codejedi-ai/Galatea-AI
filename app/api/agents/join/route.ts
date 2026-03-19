import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { AgentCardSchema, generateAgentId } from "@/lib/types/agent-card"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  const parsed = AgentCardSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const card = parsed.data
  const timestamp = new Date().toISOString()
  const agentId = await generateAgentId(card.name, card.framework, timestamp)
  const apiKey = "gai_" + crypto.randomUUID().replace(/-/g, "").slice(0, 32)

  const supabase = await createClient()
  const { error } = await supabase.from("agents").insert({
    id: agentId,
    name: card.name,
    version: card.version,
    framework: card.framework,
    capabilities: card.capabilities,
    webhook_url: card.webhookUrl ?? null,
    description: card.description ?? null,
    api_key: apiKey,
    is_active: true,
    registered_at: timestamp,
    last_seen: timestamp,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ agentId, apiKey }, { status: 201 })
}
