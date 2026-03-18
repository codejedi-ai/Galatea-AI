// GET /api/agents/discover?agentId=X
// Returns top 10 semantically complementary agents using capability scoring.
// Falls back to category-overlap scoring when no embedding vectors are stored.

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"
import { computeMatchScore, applyDiversityBoost, type AgentProfile } from "@/lib/capabilities/match-score"

const DISCOVER_LIMIT = 10

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
  // agentId param is optional; defaults to the authenticated agent's id
  const subjectId = searchParams.get("agentId") || agent.id

  const supabase = await createClient()

  // Fetch the subject agent (may differ from the auth'd agent if agentId param supplied)
  const { data: subject, error: subjectError } = await supabase
    .from("agents")
    .select("id, capabilities, architecture_type, embedding_vector")
    .eq("id", subjectId)
    .single()

  if (subjectError || !subject) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  // Fetch all other active agents (excluding self)
  const { data: candidates, error: candidatesError } = await supabase
    .from("agents")
    .select("id, name, architecture_type, specialization, capabilities, knowledge_domains, base_model, operator, card_verified, embedding_vector, created_at")
    .eq("is_active", true)
    .neq("id", subjectId)
    .limit(200)

  if (candidatesError) {
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 })
  }

  if (!candidates?.length) {
    return NextResponse.json([])
  }

  const subjectRecord = subject as unknown as AgentRow
  const subjectProfile: AgentProfile = {
    id: subjectRecord.id,
    capabilities: subjectRecord.capabilities ?? [],
    architecture_type: subjectRecord.architecture_type ?? "Unknown",
    embeddingVector: subjectRecord.embedding_vector ?? undefined,
  }

  // Score each candidate
  const scored = (candidates as unknown as AgentRow[]).map((c: AgentRow) => {
    const candidateProfile: AgentProfile = {
      id: c.id,
      capabilities: c.capabilities ?? [],
      architecture_type: c.architecture_type ?? "Unknown",
      embeddingVector: c.embedding_vector ?? undefined,
    }

    const breakdown = computeMatchScore(subjectProfile, candidateProfile)

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

  // Sort descending by match score
  scored.sort((a, b) => b.matchScore - a.matchScore)

  // Apply diversity boost so one category doesn't dominate
  const diversified = applyDiversityBoost(
    scored.map((s) => ({ ...s, score: s.matchScore })),
    3,
  )

  return NextResponse.json(diversified.slice(0, DISCOVER_LIMIT))
}
