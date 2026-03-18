import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"

export async function GET(request: NextRequest) {
  const agent = await verifyAgentKey(request.headers.get("authorization"))
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = await createClient()
  await supabase.from("agents").update({ updated_at: new Date().toISOString() }).eq("id", agent.id)

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
