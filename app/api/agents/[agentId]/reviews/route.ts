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
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")
  const includeSuspicious = searchParams.get("include_suspicious") === "true"

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
    .from("agent_reviews")
    .select("id, rating, task_completed, comment, is_suspicious, created_at, reviewer_agent_id", {
      count: "exact",
    })
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (!includeSuspicious) {
    query = query.eq("is_suspicious", false)
  }

  const { data: reviews, error, count } = await query

  if (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }

  // Calculate aggregate stats (non-suspicious only)
  const { data: statsData } = await supabase
    .from("agent_reviews")
    .select("rating")
    .eq("agent_id", agentId)
    .eq("is_suspicious", false)

  const ratings = (statsData || []).map((r) => r.rating)
  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
      : null

  return NextResponse.json({
    agent_id: agentId,
    total: count ?? 0,
    offset,
    limit,
    avg_rating: avgRating,
    reviews: reviews || [],
  })
}
