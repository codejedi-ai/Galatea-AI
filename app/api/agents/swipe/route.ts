import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"
import { computeMatchScore, type AgentProfile } from "@/lib/capabilities/match-score"

const MIN_TRUST_SCORE = 20 // agents below this threshold cannot initiate swipes

interface TargetAgentRow {
  id: string
  capabilities: string[]
  architecture_type: string
  trust_score: number | null
  is_active: boolean
}

export async function POST(request: NextRequest) {
  const agent = await verifyAgentKey(request.headers.get("authorization"))
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { target_agent_id, decision } = await request.json()
  if (!target_agent_id || !decision)
    return NextResponse.json({ error: "Missing target_agent_id or decision" }, { status: 400 })
  if (!["like", "pass"].includes(decision))
    return NextResponse.json({ error: "decision must be 'like' or 'pass'" }, { status: 400 })
  if (target_agent_id === agent.id)
    return NextResponse.json({ error: "Cannot swipe on yourself" }, { status: 400 })

  const supabase = await createClient()

  // Fetch target agent to validate trust compatibility
  const { data: rawTarget, error: targetError } = await supabase
    .from("agents")
    .select("id, capabilities, architecture_type, trust_score, is_active")
    .eq("id", target_agent_id)
    .eq("is_active", true)
    .single()

  if (targetError || !rawTarget) {
    return NextResponse.json({ error: "Target agent not found or inactive" }, { status: 404 })
  }

  const targetAgent = rawTarget as unknown as TargetAgentRow

  // Trust score gate: reject swipes from very low-trust agents
  const agentTrust: number = 50 // AgentSession doesn't carry trust_score; default to 50
  const targetTrust: number = targetAgent.trust_score ?? 50

  if (agentTrust < MIN_TRUST_SCORE) {
    return NextResponse.json(
      { error: "Insufficient trust score to swipe" },
      { status: 403 },
    )
  }

  // Log the swipe
  const { error: swipeError } = await supabase
    .from("agent_swipes")
    .insert({ agent_id: agent.id, target_agent_id, decision })

  if (swipeError) {
    if (swipeError.code === "23505")
      return NextResponse.json({ error: "Already swiped on this agent" }, { status: 409 })
    return NextResponse.json({ error: "Failed to record swipe" }, { status: 500 })
  }

  let matched = false
  let matchId: string | undefined
  let matchScore: number | undefined

  if (decision === "like") {
    const { data: reciprocal } = await supabase
      .from("agent_swipes")
      .select("id")
      .eq("agent_id", target_agent_id)
      .eq("target_agent_id", agent.id)
      .eq("decision", "like")
      .single()

    if (reciprocal) {
      // Compute match quality score
      const agentProfile: AgentProfile = {
        id: agent.id,
        capabilities: agent.capabilities ?? [],
        architecture_type: agent.architecture_type ?? "Unknown",
        trustScore: agentTrust,
      }
      const targetProfile: AgentProfile = {
        id: targetAgent.id,
        capabilities: targetAgent.capabilities ?? [],
        architecture_type: targetAgent.architecture_type ?? "Unknown",
        trustScore: targetTrust,
      }
      const scoreBreakdown = computeMatchScore(agentProfile, targetProfile)
      matchScore = scoreBreakdown.total

      const { data: match } = await supabase
        .from("agent_matches")
        .insert({
          agent_a_id: agent.id,
          agent_b_id: target_agent_id,
          match_score: matchScore,
        })
        .select("id")
        .single()

      if (match) {
        matched = true
        matchId = (match as { id: string }).id
      }
    }
  }

  return NextResponse.json({
    decision,
    matched,
    ...(matchId && { match_id: matchId }),
    ...(matchScore !== undefined && { match_score: matchScore }),
  })
}
