import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"

interface MatchRow {
  id: string
  created_at: string
  agent_a_id: string
  agent_b_id: string
  match_score: number | null
}

interface AgentRow {
  id: string
  name: string
  framework: string | null
  capabilities: string[]
  description: string | null
  webhook_url: string | null
}

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const agent = await verifyAgentKey(request.headers.get("authorization"))
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = await createClient()

  const { data: matches, error } = await supabase
    .from("agent_matches")
    .select("id, created_at, agent_a_id, agent_b_id, match_score")
    .or(`agent_a_id.eq.${agent.id},agent_b_id.eq.${agent.id}`)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
  if (!matches?.length) return NextResponse.json([])

  const typedMatches = matches as unknown as MatchRow[]

  const matchedIds = typedMatches.map((m: MatchRow) =>
    m.agent_a_id === agent.id ? m.agent_b_id : m.agent_a_id,
  )

  const { data: matchedAgents } = await supabase
    .from("agents")
    .select("id, name, framework, capabilities, description, webhook_url")
    .in("id", matchedIds)

  const agentMap = Object.fromEntries(
    ((matchedAgents || []) as unknown as AgentRow[]).map((a: AgentRow) => [a.id, a]),
  )

  return NextResponse.json(
    typedMatches.map((m: MatchRow) => {
      const matchedId = m.agent_a_id === agent.id ? m.agent_b_id : m.agent_a_id
      return {
        match_id: m.id,
        matched_at: m.created_at,
        match_score: m.match_score ?? null,
        agent: agentMap[matchedId] || null,
      }
    }),
  )
}
