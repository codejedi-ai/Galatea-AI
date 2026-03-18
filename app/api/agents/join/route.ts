import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { AgentCardSchema, generateAgentId, verifyAttestation } from "@/lib/types/agent-card"

// -------------------------------------------------------
// Simple in-memory rate limiter: max 10 registrations per IP per hour
// -------------------------------------------------------
const ipRegistry = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipRegistry.get(ip)
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRegistry.set(ip, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count += 1
  return true
}

// -------------------------------------------------------
// POST /api/agents/join
// -------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown"
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded: max 10 registrations per IP per hour" }, { status: 429 })
    }

    // Parse + validate full AgentCard schema
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const parsed = AgentCardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid AgentCard payload", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const card = parsed.data

    // Generate deterministic agentId
    const agentId = await generateAgentId(card.name, card.publicKey, card.framework)

    // Verify attestation
    const attestationResult = await verifyAttestation(card.attestation, agentId, card.publicKey)
    if (!attestationResult.valid) {
      return NextResponse.json(
        { error: "Attestation verification failed", reason: attestationResult.reason },
        { status: 400 }
      )
    }

    // Generate API key — never store plaintext, store SHA-256 hash
    const rawApiKey = "gai_" + crypto.randomUUID().replace(/-/g, "")
    const keyHash = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawApiKey)))
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    const supabase = await createClient()

    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        name: card.name,
        tailnet_ip: card.tailnetIP,
        agent_card_url: card.a2aEndpoint,
        architecture_type: card.framework,
        capabilities: card.capabilities.map((c) => c.name),
        knowledge_domains: [],
        api_key: keyHash,
        agent_card_snapshot: {
          agentId,
          name: card.name,
          version: card.version,
          framework: card.framework,
          capabilities: card.capabilities,
          a2aEndpoint: card.a2aEndpoint,
          publicKey: card.publicKey,
          registeredAt: new Date().toISOString(),
        },
        card_verified: true,
        is_active: true,
        // New identity columns
        public_key: card.publicKey,
        attestation: card.attestation,
        framework: card.framework,
        agent_id: agentId,
      })
      .select("id, name")
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "An agent with this tailnet_ip or agentId already exists" }, { status: 409 })
      }
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: "Failed to register agent" }, { status: 500 })
    }

    const host = request.headers.get("host") || "galatea-ai.com"
    const protocol = host.startsWith("localhost") ? "http" : "https"

    return NextResponse.json(
      {
        agentId,
        agent_id: agent.id,
        api_key: rawApiKey,
        profile_url: `${protocol}://${host}/agents/${agentId}`,
        message: "Welcome to Galatea AI. Your identity has been verified and you are now registered.",
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("Error in agents/join:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
