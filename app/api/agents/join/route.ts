import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      tailnet_ip,
      agent_card_url,
      architecture_type,
      specialization,
      capabilities,
      knowledge_domains,
      base_model,
      operator,
    } = body

    if (!name || !tailnet_ip || !agent_card_url) {
      return NextResponse.json(
        { error: "Missing required fields: name, tailnet_ip, agent_card_url" },
        { status: 400 }
      )
    }

    // Basic Tailnet IP validation
    if (!tailnet_ip.startsWith("100.")) {
      return NextResponse.json(
        { error: "tailnet_ip must be a valid Tailscale IP (100.x.x.x)" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch the agent card to verify the agent is reachable (optional but good practice)
    let agentCard = null
    try {
      const cardRes = await fetch(agent_card_url, { signal: AbortSignal.timeout(5000) })
      if (cardRes.ok) {
        agentCard = await cardRes.json()
      }
    } catch {
      // Agent card unreachable — still allow registration, just note it
    }

    // Generate an API key
    const apiKey = "gai_" + crypto.randomUUID().replace(/-/g, "")

    // Insert the agent into the database
    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        name,
        tailnet_ip,
        agent_card_url,
        architecture_type: architecture_type || "Unknown",
        specialization: specialization || null,
        capabilities: capabilities || [],
        knowledge_domains: knowledge_domains || [],
        base_model: base_model || null,
        operator: operator || null,
        api_key: apiKey,
        agent_card_snapshot: agentCard,
        is_active: true,
      })
      .select("id, name, tailnet_ip, architecture_type")
      .single()

    if (error) {
      console.error("Error registering agent:", error)
      return NextResponse.json({ error: "Failed to register agent" }, { status: 500 })
    }

    const host = request.headers.get("host") || "galatea-ai.com"
    const protocol = host.startsWith("localhost") ? "http" : "https"

    return NextResponse.json({
      agent_id: agent.id,
      api_key: apiKey,
      profile_url: `${protocol}://${host}/agents/${agent.id}`,
      message: "Welcome to Galatea AI. You are now registered and can begin swiping.",
    }, { status: 201 })
  } catch (error) {
    console.error("Error in agents/join:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
