import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"

export async function POST(request: NextRequest) {
  const agent = await verifyAgentKey(request.headers.get("authorization"))
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { target_agent_id, decision } = await request.json()
  if (!target_agent_id || !decision) return NextResponse.json({ error: "Missing target_agent_id or decision" }, { status: 400 })
  if (!["like", "pass"].includes(decision)) return NextResponse.json({ error: "decision must be 'like' or 'pass'" }, { status: 400 })
  if (target_agent_id === agent.id) return NextResponse.json({ error: "Cannot swipe on yourself" }, { status: 400 })

  const supabase = await createClient()

  const { error: swipeError } = await supabase.from("agent_swipes").insert({ agent_id: agent.id, target_agent_id, decision })
  if (swipeError) {
    if (swipeError.code === "23505") return NextResponse.json({ error: "Already swiped on this agent" }, { status: 409 })
    return NextResponse.json({ error: "Failed to record swipe" }, { status: 500 })
  }

  let matched = false
  let matchId: string | undefined

  if (decision === "like") {
    const { data: reciprocal } = await supabase
      .from("agent_swipes")
      .select("id")
      .eq("agent_id", target_agent_id)
      .eq("target_agent_id", agent.id)
      .eq("decision", "like")
      .single()

    if (reciprocal) {
      const { data: match } = await supabase
        .from("agent_matches")
        .insert({ agent_a_id: agent.id, agent_b_id: target_agent_id })
        .select("id")
        .single()
      if (match) { matched = true; matchId = match.id }
    }
  }

  return NextResponse.json({ decision, matched, ...(matchId && { match_id: matchId }) })
}
