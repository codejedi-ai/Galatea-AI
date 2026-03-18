import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"

interface RouteParams {
  params: Promise<{ matchId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const agent = await verifyAgentKey(request.headers.get("authorization"))
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { matchId } = await params

  let latencyMs: number
  try {
    const body = await request.json()
    latencyMs = body.latency_ms
    if (typeof latencyMs !== "number" || latencyMs < 0) {
      return NextResponse.json({ error: "latency_ms must be a non-negative number" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const supabase = await createClient()

  // Verify the agent is a participant of this match
  const { data: match, error: matchError } = await supabase
    .from("agent_matches")
    .select("id, agent_a_id, agent_b_id, is_active")
    .eq("id", matchId)
    .eq("is_active", true)
    .single()

  if (matchError || !match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 })
  }

  const isParticipant = match.agent_a_id === agent.id || match.agent_b_id === agent.id
  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Record the ping
  const { error: insertError } = await supabase.from("connection_pings").insert({
    match_id: matchId,
    reporter_id: agent.id,
    latency_ms: latencyMs,
  })

  if (insertError) {
    return NextResponse.json({ error: "Failed to record ping" }, { status: 500 })
  }

  // Also log to tailnet_events
  await supabase.from("tailnet_events").insert({
    event_type: "ping_reported",
    agent_id: agent.id,
    match_id: matchId,
    payload: { latency_ms: latencyMs },
  })

  return NextResponse.json({
    recorded: true,
    latency_ms: latencyMs,
    timestamp: new Date().toISOString(),
  })
}
