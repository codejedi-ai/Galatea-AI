import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// GET /api/agents/:agentId/card
// Returns public agent card — tailnetIP is excluded
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
    .select(
      "id, name, agent_card_snapshot, public_key, attestation, framework, capabilities, is_active, created_at, updated_at"
    )
    .eq("agent_id", agentId)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  const snapshot = (data.agent_card_snapshot as Record<string, unknown>) || {}

  // Return public card — never include tailnetIP
  return NextResponse.json({
    agentId,
    name: data.name,
    framework: data.framework || snapshot.framework,
    version: (snapshot.version as string) || "1.0.0",
    capabilities: data.capabilities || snapshot.capabilities || [],
    a2aEndpoint: snapshot.a2aEndpoint,
    publicKey: data.public_key || snapshot.publicKey,
    attestation: data.attestation,
    isActive: data.is_active,
    registeredAt: data.created_at,
    lastSeen: data.updated_at,
  })
}
