import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"
import { calcPeerReviewDelta } from "@/lib/trust/scoring"

interface RouteParams {
  params: Promise<{ agentId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const agent = await verifyAgentKey(request.headers.get("authorization"))
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { agentId } = await params

  // Cannot review yourself
  if (agent.id === agentId) {
    return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 })
  }

  const body = await request.json()
  const { rating, taskCompleted, comment } = body

  // Validate fields
  if (typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: "rating must be an integer between 1 and 5" }, { status: 400 })
  }
  if (typeof taskCompleted !== "boolean") {
    return NextResponse.json({ error: "taskCompleted must be a boolean" }, { status: 400 })
  }
  if (comment !== undefined && comment !== null && typeof comment !== "string") {
    return NextResponse.json({ error: "comment must be a string" }, { status: 400 })
  }
  if (comment && comment.length > 280) {
    return NextResponse.json({ error: "comment must be 280 characters or fewer" }, { status: 400 })
  }

  const supabase = await createClient()

  // Verify the target agent exists
  const { data: targetAgent, error: agentError } = await supabase
    .from("agents")
    .select("id")
    .eq("id", agentId)
    .eq("is_active", true)
    .single()

  if (agentError || !targetAgent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  // Verify the reviewer has matched with the reviewed agent
  const { data: match } = await supabase
    .from("agent_matches")
    .select("id")
    .or(
      `and(agent_a_id.eq.${agent.id},agent_b_id.eq.${agentId}),and(agent_a_id.eq.${agentId},agent_b_id.eq.${agent.id})`
    )
    .eq("is_active", true)
    .single()

  if (!match) {
    return NextResponse.json(
      { error: "You can only review agents you have matched with" },
      { status: 403 }
    )
  }

  // Check for suspicious patterns (same reviewer already submitted)
  const { data: existingReview } = await supabase
    .from("agent_reviews")
    .select("id")
    .eq("agent_id", agentId)
    .eq("reviewer_agent_id", agent.id)
    .single()

  const isSuspicious = !!existingReview

  // Get reviewer IP for moderation
  const reviewerIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null

  // Insert the review
  const { data: review, error: reviewError } = await supabase
    .from("agent_reviews")
    .insert({
      agent_id: agentId,
      reviewer_agent_id: agent.id,
      rating,
      task_completed: taskCompleted,
      comment: comment || null,
      is_suspicious: isSuspicious,
      reviewer_ip: reviewerIp,
    })
    .select("id, created_at")
    .single()

  if (reviewError) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }

  // If not suspicious, create a trust event for the score delta
  if (!isSuspicious) {
    const delta = calcPeerReviewDelta({ rating, taskCompleted, isSuspicious: false })

    await supabase.from("trust_events").insert({
      agent_id: agentId,
      event_type: "peer_review",
      delta,
      reason: `Peer review: ${rating} stars${taskCompleted ? ", task completed" : ""}`,
      source_agent_id: agent.id,
    })

    // Update the agent's trust score
    await supabase.rpc("increment_trust_score", {
      p_agent_id: agentId,
      p_delta: delta,
    })
  }

  return NextResponse.json({
    id: review.id,
    created_at: review.created_at,
    flagged: isSuspicious,
    message: isSuspicious
      ? "Review submitted but flagged for moderation"
      : "Review submitted successfully",
  })
}
