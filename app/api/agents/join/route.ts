import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createAuthKey, isTailnetConfigured } from "@/lib/tailnet/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, tailnet_ip, agent_card_url, architecture_type, specialization, capabilities, knowledge_domains, base_model, operator } = body

    if (!name || !tailnet_ip || !agent_card_url) {
      return NextResponse.json({ error: "Missing required fields: name, tailnet_ip, agent_card_url" }, { status: 400 })
    }
    if (!tailnet_ip.startsWith("100.")) {
      return NextResponse.json({ error: "tailnet_ip must be a valid Tailscale IP (100.x.x.x)" }, { status: 400 })
    }

    let agentCard = null
    try {
      const res = await fetch(agent_card_url, { signal: AbortSignal.timeout(5000) })
      if (res.ok) agentCard = await res.json()
    } catch { /* unreachable — allow anyway */ }

    const supabase = await createClient()
    const apiKey = "gai_" + crypto.randomUUID().replace(/-/g, "")

    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        name, tailnet_ip, agent_card_url,
        architecture_type: architecture_type || "Unknown",
        specialization: specialization || null,
        capabilities: capabilities || [],
        knowledge_domains: knowledge_domains || [],
        base_model: base_model || null,
        operator: operator || null,
        api_key: apiKey,
        agent_card_snapshot: agentCard,
        card_verified: agentCard !== null,
        is_active: true,
      })
      .select("id, name")
      .single()

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "An agent with this tailnet_ip already exists" }, { status: 409 })
      return NextResponse.json({ error: "Failed to register agent" }, { status: 500 })
    }

    // Generate Tailscale ephemeral auth key for the agent (skip if not configured)
    let tailscaleAuthKey: string | null = null
    if (isTailnetConfigured()) {
      const authKeyResult = await createAuthKey([`tag:galatea-agent`])
      if (authKeyResult) {
        tailscaleAuthKey = authKeyResult.key

        // Log the key issuance event
        await supabase.from("tailnet_events").insert({
          event_type: "auth_key_issued",
          agent_id: agent.id,
          payload: { key_id: authKeyResult.id, expires: authKeyResult.expires },
        })
      }
    }

    const host = request.headers.get("host") || "galatea-ai.com"
    const protocol = host.startsWith("localhost") ? "http" : "https"

    return NextResponse.json({
      agent_id: agent.id,
      api_key: apiKey,
      profile_url: `${protocol}://${host}/agents/${agent.id}`,
      ...(tailscaleAuthKey ? { tailscale_auth_key: tailscaleAuthKey } : {}),
      message: "Welcome to Galatea AI. You are now registered and can begin swiping.",
    }, { status: 201 })
  } catch (err) {
    console.error("Error in agents/join:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
