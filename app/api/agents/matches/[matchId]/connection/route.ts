import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"
import { generateMatchACLRules } from "@/lib/tailnet/acl"

interface RouteParams {
  params: Promise<{ matchId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const agent = await verifyAgentKey(request.headers.get("authorization"))
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { matchId } = await params
  const supabase = await createClient()

  // Fetch the match — ensure the requesting agent is a participant
  const { data: match, error: matchError } = await supabase
    .from("agent_matches")
    .select("id, created_at, agent_a_id, agent_b_id, is_active")
    .eq("id", matchId)
    .eq("is_active", true)
    .single()

  if (matchError || !match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 })
  }

  const isParticipant = match.agent_a_id === agent.id || match.agent_b_id === agent.id
  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const peerId = match.agent_a_id === agent.id ? match.agent_b_id : match.agent_a_id

  // Fetch the peer's tailnet_ip — only expose after match is confirmed
  const { data: peer, error: peerError } = await supabase
    .from("agents")
    .select("id, name, tailnet_ip")
    .eq("id", peerId)
    .eq("is_active", true)
    .single()

  if (peerError || !peer) {
    return NextResponse.json({ error: "Peer agent not found" }, { status: 404 })
  }

  // Generate scoped ACL rules for this match pair
  const aclRules = generateMatchACLRules({
    matchId,
    agentAIp: agent.tailnet_ip,
    agentBIp: peer.tailnet_ip,
  })

  // Log connection establishment event (idempotent — best effort)
  await supabase.from("tailnet_events").insert({
    event_type: "connection_established",
    agent_id: agent.id,
    match_id: matchId,
    payload: {
      peer_id: peer.id,
      acl_rules: aclRules,
    },
  })

  // Get latest ping latency for this match
  const { data: latestPing } = await supabase
    .from("connection_pings")
    .select("latency_ms, created_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    peerTailnetIP: peer.tailnet_ip,
    peerA2AEndpoint: `http://${peer.tailnet_ip}:8080/a2a`,
    connectionEstablishedAt: match.created_at,
    aclRules,
    latency: latestPing ?? null,
  })
}
