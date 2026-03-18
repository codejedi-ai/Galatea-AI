import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"

interface RouteParams {
  params: Promise<{ agentId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const agent = await verifyAgentKey(request.headers.get("authorization"))
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { agentId } = await params
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200)
  const offset = parseInt(searchParams.get("offset") || "0")
  const eventType = searchParams.get("event_type")

  const supabase = await createClient()

  // Verify the target agent exists
  const { data: targetAgent, error: agentError } = await supabase
    .from("agents")
    .select("id, name")
    .eq("id", agentId)
    .eq("is_active", true)
    .single()

  if (agentError || !targetAgent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  let query = supabase
    .from("trust_events")
    .select(
      "id, agent_id, event_type, delta, reason, source_agent_id, created_at",
      { count: "exact" }
    )
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (eventType) {
    query = query.eq("event_type", eventType)
  }

  const { data: events, error, count } = await query

  if (error) {
    return NextResponse.json({ error: "Failed to fetch trust history" }, { status: 500 })
  }

  // Get current trust score
  const { data: agentScore } = await supabase
    .from("agents")
    .select("trust_score")
    .eq("id", agentId)
    .single()

  // Build cumulative score history from events (oldest first)
  const allEvents = [...(events || [])].reverse()
  let runningScore = (agentScore?.trust_score ?? 100) - allEvents.reduce((s, e) => s + (e.delta || 0), 0)
  const scoreHistory = allEvents.map((event) => {
    runningScore += event.delta || 0
    return {
      timestamp: event.created_at,
      score: Math.max(0, Math.min(1000, Math.round(runningScore))),
      event_type: event.event_type,
      delta: event.delta,
    }
  })

  return NextResponse.json({
    agent_id: agentId,
    current_score: agentScore?.trust_score ?? 100,
    total: count ?? 0,
    offset,
    limit,
    score_history: scoreHistory,
    events: events || [],
  })
}
