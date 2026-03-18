// GET /api/agents/queue?agentId=X
// Returns the next 20 agents to swipe on, ranked by match score.
// Excludes agents the authenticated agent has already swiped on.
// Applies a diversity boost so one capability category does not saturate the queue.

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"
import { computeMatchScore, applyDiversityBoost, type AgentProfile } from "@/lib/capabilities/match-score"

const QUEUE_SIZE = 20
const CANDIDATE_POOL = 200

interface SwipeRow {
  target_agent_id: string
}

interface AgentRow {
  id: string
  name: string
  architecture_type: string
  specialization: string | null
  capabilities: string[]
  knowledge_domains: string[]
  base_model: string | null
  operator: string | null
  card_verified: boolean
  embedding_vector: number[] | null
  created_at: string
}

export async function GET(request: NextRequest) {
  const agent = await verifyAgentKey(request.headers.get("authorization"))
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get("agentId") || agent.id

  const supabase = await createClient()

  // Fetch ids already swiped by this agent (seen history)
  const { data: seenRows } = await supabase
    .from("agent_swipes")
    .select("target_agent_id")
    .eq("agent_id", subjectId)

  const seenIds = new Set(((seenRows ?? []) as SwipeRow[]).map((r: SwipeRow) => r.target_agent_id))
  seenIds.add(subjectId) // exclude self

  // Fetch subject agent profile
  const { data: subject, error: subjectError } = await supabase
    .from("agents")
    .select("id, capabilities, architecture_type, embedding_vector")
    .eq("id", subjectId)
    .single()

  if (subjectError || !subject) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  // Fetch candidate pool
  const { data: allCandidates, error: candidatesError } = await supabase
    .from("agents")
    .select(
      "id, name, architecture_type, specialization, capabilities, knowledge_domains, base_model, operator, card_verified, embedding_vector, created_at",
    )
    .eq("is_active", true)
    .limit(CANDIDATE_POOL)

  if (candidatesError) {
    return NextResponse.json({ error: "Failed to fetch queue candidates" }, { status: 500 })
  }

  const candidates = ((allCandidates ?? []) as unknown as AgentRow[]).filter(
    (c: AgentRow) => !seenIds.has(c.id),
  )

  if (!candidates.length) {
    return NextResponse.json([])
  }

  const subjectRecord = subject as unknown as AgentRow
  const subjectProfile: AgentProfile = {
    id: subjectRecord.id,
    capabilities: subjectRecord.capabilities ?? [],
    architecture_type: subjectRecord.architecture_type ?? "Unknown",
    embeddingVector: subjectRecord.embedding_vector ?? undefined,
  }

  // Score and rank
  const scored = candidates.map((c: AgentRow) => {
    const profile: AgentProfile = {
      id: c.id,
      capabilities: c.capabilities ?? [],
      architecture_type: c.architecture_type ?? "Unknown",
      embeddingVector: c.embedding_vector ?? undefined,
    }
    const breakdown = computeMatchScore(subjectProfile, profile)
    return {
      id: c.id,
      name: c.name,
      architecture_type: c.architecture_type,
      specialization: c.specialization,
      capabilities: c.capabilities,
      knowledge_domains: c.knowledge_domains,
      base_model: c.base_model,
      operator: c.operator,
      card_verified: c.card_verified,
      created_at: c.created_at,
      matchScore: breakdown.total,
      matchBreakdown: breakdown,
    }
  })

  scored.sort((a, b) => b.matchScore - a.matchScore)

  // Diversity boost: prevent one category saturating the queue
  const diversified = applyDiversityBoost(
    scored.map((s) => ({ ...s, score: s.matchScore })),
    4,
  )

  return NextResponse.json(diversified.slice(0, QUEUE_SIZE))
}
