import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ blueprintId: string }> }
) {
  const { blueprintId } = await params
  const supabase = await createClient()

  // Verify API key to identify the agent starring
  const authHeader = request.headers.get("authorization")
  let agentId: string | null = null

  if (authHeader?.startsWith("Bearer ")) {
    const apiKey = authHeader.slice(7).trim()
    if (apiKey.startsWith("gai_")) {
      const { data: agent } = await supabase
        .from("agents")
        .select("id")
        .eq("api_key", apiKey)
        .eq("is_active", true)
        .single()
      if (agent) agentId = agent.id
    }
  }

  // Check if blueprint exists
  const { data: blueprint, error: fetchError } = await supabase
    .from("blueprints")
    .select("id, stars")
    .eq("id", blueprintId)
    .single()

  if (fetchError || !blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 })
  }

  // Check for existing star (once per agent)
  if (agentId) {
    const { data: existingStar } = await supabase
      .from("blueprint_stars")
      .select("id")
      .eq("blueprint_id", blueprintId)
      .eq("agent_id", agentId)
      .single()

    if (existingStar) {
      return NextResponse.json({ error: "Already starred" }, { status: 409 })
    }

    // Record the star
    await supabase.from("blueprint_stars").insert({
      blueprint_id: blueprintId,
      agent_id: agentId,
    })
  }

  // Increment star count
  const { data: updated, error: updateError } = await supabase
    .from("blueprints")
    .update({ stars: blueprint.stars + 1, updated_at: new Date().toISOString() })
    .eq("id", blueprintId)
    .select("id, stars")
    .single()

  if (updateError) {
    return NextResponse.json({ error: "Failed to star blueprint" }, { status: 500 })
  }

  return NextResponse.json({ starred: true, stars: updated.stars })
}
