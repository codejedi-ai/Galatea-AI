import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// GET /api/agents/:agentId/verify
// Confirms the agent is still alive and identity is valid
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
    .select("id, name, is_active, card_verified, updated_at, attestation, public_key")
    .eq("agent_id", agentId)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { agentId, verified: false, reason: "Agent not found" },
      { status: 404 }
    )
  }

  if (!data.is_active) {
    return NextResponse.json({ agentId, verified: false, reason: "Agent is inactive" })
  }

  // Check lastSeen freshness — consider expired if not updated in 24 hours
  const lastSeen = new Date(data.updated_at).getTime()
  const oneDayMs = 24 * 60 * 60 * 1000
  const isExpired = Date.now() - lastSeen > oneDayMs

  const status = !data.card_verified
    ? "unverified"
    : isExpired
    ? "expired"
    : "verified"

  return NextResponse.json({
    agentId,
    verified: status === "verified",
    status,
    name: data.name,
    lastSeen: data.updated_at,
    hasPublicKey: !!data.public_key,
    hasAttestation: !!data.attestation,
  })
}
