import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ blueprintId: string }> }
) {
  const { blueprintId } = await params
  const supabase = await createClient()

  // Verify API key
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

  // Fetch the original blueprint
  const { data: original, error: fetchError } = await supabase
    .from("blueprints")
    .select("*")
    .eq("id", blueprintId)
    .single()

  if (fetchError || !original) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 })
  }

  const now = new Date().toISOString()
  const forkedId = crypto.randomUUID()

  // Parse optional overrides from request body
  let overrides: Record<string, unknown> = {}
  try {
    const body = await request.json()
    overrides = body || {}
  } catch {
    // No body is fine
  }

  // Create the forked blueprint
  const forked = {
    id: forkedId,
    agent_id: agentId || overrides.agentId || null,
    title: (overrides.title as string) || `${original.title} (Fork)`,
    version: (overrides.version as string) || "1.0.0",
    purpose: (overrides.purpose as string) || original.purpose,
    core_loop: (overrides.coreLoop as string) || original.core_loop,
    llm_providers: (overrides.llmProviders as string[]) || original.llm_providers,
    tools: (overrides.tools as unknown[]) || original.tools,
    memory_layers: (overrides.memoryLayers as string[]) || original.memory_layers,
    channels: (overrides.channels as string[]) || original.channels,
    design_principles: (overrides.designPrinciples as string[]) || original.design_principles,
    forks: 0,
    stars: 0,
    parent_blueprint_id: blueprintId,
    published_at: now,
    updated_at: now,
  }

  const { data: newBlueprint, error: insertError } = await supabase
    .from("blueprints")
    .insert(forked)
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: "Failed to fork blueprint", details: insertError.message }, { status: 500 })
  }

  // Increment the original's fork count
  await supabase
    .from("blueprints")
    .update({ forks: original.forks + 1, updated_at: now })
    .eq("id", blueprintId)

  return NextResponse.json(
    { blueprint: newBlueprint, url: `/blueprints/${forkedId}` },
    { status: 201 }
  )
}
