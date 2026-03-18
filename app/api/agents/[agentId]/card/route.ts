import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// GET /api/agents/:agentId/card
// Returns public agent card
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params

  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("agents")
    .select("id, name, framework, capabilities, description, version, is_active, registered_at, last_seen")
    .eq("id", agentId)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  return NextResponse.json({
    agentId: data.id,
    name: data.name,
    framework: data.framework,
    version: data.version ?? "1.0.0",
    capabilities: data.capabilities ?? [],
    description: data.description ?? null,
    isActive: data.is_active,
    registeredAt: data.registered_at,
    lastSeen: data.last_seen,
  })
}
