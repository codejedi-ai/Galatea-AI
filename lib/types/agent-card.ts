import { z } from "zod"

// -------------------------------------------------------
// AgentCard Schema
// -------------------------------------------------------

export const FrameworkSchema = z.enum(["LangChain", "AutoGen", "CrewAI", "Custom"])
export type Framework = z.infer<typeof FrameworkSchema>

export const CapabilitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
})
export type Capability = z.infer<typeof CapabilitySchema>

export const AttestationSchema = z.object({
  /** The agentId this attestation is for */
  agentId: z.string().min(1),
  /** ISO timestamp of when the attestation was created */
  timestamp: z.string().datetime(),
  /** Challenge nonce */
  nonce: z.string().min(1),
  /** SHA-256 hex signature of `${agentId}:${timestamp}:${nonce}` using agent's private key
   *  (self-signed: we verify the agent can produce consistent output) */
  signature: z.string().min(1),
})
export type Attestation = z.infer<typeof AttestationSchema>

export const AgentCardSchema = z.object({
  /** Deterministic hash-derived unique identifier */
  agentId: z.string().optional(), // generated server-side on registration

  name: z.string().min(1).max(128),
  version: z.string().min(1).max(32),
  framework: FrameworkSchema,

  /** Structured list of what the agent can do */
  capabilities: z.array(CapabilitySchema).min(1),

  /** Private Tailscale IP — only revealed on match */
  tailnetIP: z.string().regex(/^100\./, "tailnetIP must be a valid Tailscale IP (100.x.x.x)"),

  /** A2A protocol endpoint URL */
  a2aEndpoint: z.string().url(),

  /** Base64-encoded public key (Ed25519 or RSA-2048) */
  publicKey: z.string().min(1),

  /** Self-signed attestation blob */
  attestation: AttestationSchema,

  registeredAt: z.string().datetime().optional(),
  lastSeen: z.string().datetime().optional(),
})
export type AgentCard = z.infer<typeof AgentCardSchema>

/** Public view of an AgentCard — tailnetIP is excluded */
export type PublicAgentCard = Omit<AgentCard, "tailnetIP">

// -------------------------------------------------------
// Pure helper functions (testable without Next.js context)
// -------------------------------------------------------

/**
 * Generate a deterministic agentId from name + publicKey + framework.
 * Uses Web Crypto (available in Node 18+ and Edge runtime).
 */
export async function generateAgentId(name: string, publicKey: string, framework: string): Promise<string> {
  const input = `${name}:${publicKey}:${framework}`
  const encoded = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return "did:galatea:" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32)
}

/**
 * Generate a short readable display hash from an agentId.
 * Returns something like "did4a2b" for display in UI.
 */
export function shortAgentId(agentId: string): string {
  const hex = agentId.replace("did:galatea:", "")
  return "did" + hex.slice(0, 4)
}

/**
 * Verify the attestation blob.
 * The attestation signature is expected to be a hex-encoded SHA-256 HMAC/hash
 * of `${agentId}:${timestamp}:${nonce}` using the publicKey as key material.
 *
 * Since this is self-attestation (agent signs its own card), we verify that:
 * 1. The agentId in attestation matches the computed agentId
 * 2. The timestamp is within the last 5 minutes (freshness check)
 * 3. The signature is a valid SHA-256 of `${agentId}:${timestamp}:${nonce}:${publicKey}`
 *    (proves the agent knows its own public key)
 */
export async function verifyAttestation(
  attestation: Attestation,
  computedAgentId: string,
  publicKey: string
): Promise<{ valid: boolean; reason?: string }> {
  // 1. agentId must match
  if (attestation.agentId !== computedAgentId) {
    return { valid: false, reason: "Attestation agentId does not match computed agentId" }
  }

  // 2. Freshness check — timestamp within 5 minutes
  const attestationTime = new Date(attestation.timestamp).getTime()
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000
  if (Math.abs(now - attestationTime) > fiveMinutes) {
    return { valid: false, reason: "Attestation timestamp is outside the 5-minute freshness window" }
  }

  // 3. Signature verification
  // Expected: SHA-256 hex of `${agentId}:${timestamp}:${nonce}:${publicKey}`
  const material = `${attestation.agentId}:${attestation.timestamp}:${attestation.nonce}:${publicKey}`
  const encoded = new TextEncoder().encode(material)
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded)
  const expected = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  if (attestation.signature !== expected) {
    return { valid: false, reason: "Attestation signature does not match" }
  }

  return { valid: true }
}
