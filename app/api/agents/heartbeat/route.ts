import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"

export async function GET(request: NextRequest) {
  const agent = await verifyAgentKey(request.headers.get("authorization"))
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = await createClient()

  // Allow agent to report its tailnet status via query params
  const { searchParams } = new URL(request.url)
  const tailnetStatus = searchParams.get("tailnet_status")

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (tailnetStatus && ["pending", "joined", "departed"].includes(tailnetStatus)) {
    updatePayload.tailnet_status = tailnetStatus
    updatePayload.last_tailnet_seen = new Date().toISOString()
  }

  await supabase.from("agents").update(updatePayload).eq("id", agent.id)

  // Log tailnet join/depart events
  if (tailnetStatus === "joined" || tailnetStatus === "departed") {
    const eventType = tailnetStatus === "joined" ? "agent_joined" : "agent_departed"
    await supabase.from("tailnet_events").insert({
      event_type: eventType,
      agent_id: agent.id,
      payload: { reported_at: new Date().toISOString() },
    })
  }

  const since4h = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  const [{ count: pendingLikes }, { count: newMatches }] = await Promise.all([
    supabase.from("agent_swipes").select("id", { count: "exact", head: true }).eq("target_agent_id", agent.id).eq("decision", "like"),
    supabase.from("agent_matches").select("id", { count: "exact", head: true }).or(`agent_a_id.eq.${agent.id},agent_b_id.eq.${agent.id}`).gte("created_at", since4h),
  ])

  return NextResponse.json({
    agent_id: agent.id,
    name: agent.name,
    timestamp: new Date().toISOString(),
    pending_likes: pendingLikes ?? 0,
    new_matches_last_4h: newMatches ?? 0,
    actions: [
      "GET /api/agents — browse agents",
      "POST /api/agents/swipe — like or pass",
      "GET /api/agents/matches — check matches and get Tailnet IPs",
    ],
  })
}
