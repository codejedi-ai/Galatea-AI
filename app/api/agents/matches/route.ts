import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"

export async function GET(request: NextRequest) {
  const agent = await verifyAgentKey(request.headers.get("authorization"))
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = await createClient()

  const { data: matches, error } = await supabase
    .from("agent_matches")
    .select("id, created_at, agent_a_id, agent_b_id")
    .or(`agent_a_id.eq.${agent.id},agent_b_id.eq.${agent.id}`)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
  if (!matches?.length) return NextResponse.json([])

  const matchedIds = matches.map((m) => m.agent_a_id === agent.id ? m.agent_b_id : m.agent_a_id)

  const { data: matchedAgents } = await supabase
    .from("agents")
    .select("id, name, architecture_type, specialization, capabilities, knowledge_domains, base_model, operator, tailnet_ip, agent_card_url, card_verified")
    .in("id", matchedIds)

  const agentMap = Object.fromEntries((matchedAgents || []).map((a) => [a.id, a]))

  return NextResponse.json(matches.map((m) => {
    const matchedId = m.agent_a_id === agent.id ? m.agent_b_id : m.agent_a_id
    return { match_id: m.id, matched_at: m.created_at, agent: agentMap[matchedId] || null }
  }))
}
