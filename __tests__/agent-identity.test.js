/**
 * Unit tests for agent-identity pure logic functions.
 * Written in CommonJS JS to avoid TypeScript/ESM transform dependencies.
 * Tests: schema validation (Zod), agentId generation, attestation helpers.
 */

// zod is a CJS-compatible package
const { z } = require("zod")

// -----------------------------------------------------------------------
// Inline schema definitions (mirrored from lib/types/agent-card.ts)
// -----------------------------------------------------------------------

const FrameworkSchema = z.enum(["LangChain", "AutoGen", "CrewAI", "Custom"])

const CapabilitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
})

const AttestationSchema = z.object({
  agentId: z.string().min(1),
  timestamp: z.string().datetime(),
  nonce: z.string().min(1),
  signature: z.string().min(1),
})

const AgentCardSchema = z.object({
  agentId: z.string().optional(),
  name: z.string().min(1).max(128),
  version: z.string().min(1).max(32),
  framework: FrameworkSchema,
  capabilities: z.array(CapabilitySchema).min(1),
  tailnetIP: z.string().regex(/^100\./, "tailnetIP must be a valid Tailscale IP (100.x.x.x)"),
  a2aEndpoint: z.string().url(),
  publicKey: z.string().min(1),
  attestation: AttestationSchema,
  registeredAt: z.string().datetime().optional(),
  lastSeen: z.string().datetime().optional(),
})

// -----------------------------------------------------------------------
// Pure helper functions (mirrored from lib/types/agent-card.ts)
// -----------------------------------------------------------------------

async function generateAgentId(name, publicKey, framework) {
  const input = `${name}:${publicKey}:${framework}`
  const encoded = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return "did:galatea:" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32)
}

function shortAgentId(agentId) {
  const hex = agentId.replace("did:galatea:", "")
  return "did" + hex.slice(0, 4)
}

async function buildAttestationSignature(agentId, timestamp, nonce, publicKey) {
  const material = `${agentId}:${timestamp}:${nonce}:${publicKey}`
  const encoded = new TextEncoder().encode(material)
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe("FrameworkSchema", () => {
  it("accepts valid frameworks", () => {
    for (const framework of ["LangChain", "AutoGen", "CrewAI", "Custom"]) {
      expect(FrameworkSchema.safeParse(framework).success).toBe(true)
    }
  })

  it("rejects invalid frameworks", () => {
    expect(FrameworkSchema.safeParse("Invalid").success).toBe(false)
    expect(FrameworkSchema.safeParse("").success).toBe(false)
    expect(FrameworkSchema.safeParse(null).success).toBe(false)
  })
})

describe("CapabilitySchema", () => {
  it("accepts a minimal capability", () => {
    expect(CapabilitySchema.safeParse({ name: "text-generation" }).success).toBe(true)
  })

  it("accepts a full capability", () => {
    expect(
      CapabilitySchema.safeParse({ name: "code-review", description: "Reviews code", category: "engineering" }).success
    ).toBe(true)
  })

  it("rejects empty name", () => {
    expect(CapabilitySchema.safeParse({ name: "" }).success).toBe(false)
  })
})

describe("AttestationSchema", () => {
  const valid = {
    agentId: "did:galatea:abc123",
    timestamp: new Date().toISOString(),
    nonce: crypto.randomUUID(),
    signature: "deadbeef1234",
  }

  it("accepts a valid attestation", () => {
    expect(AttestationSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects missing agentId", () => {
    const { agentId: _a, ...rest } = valid
    expect(AttestationSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects invalid timestamp", () => {
    expect(AttestationSchema.safeParse({ ...valid, timestamp: "not-a-date" }).success).toBe(false)
  })
})

describe("AgentCardSchema", () => {
  function makeValidCard(overrides = {}) {
    return {
      name: "TestAgent",
      version: "1.0.0",
      framework: "LangChain",
      capabilities: [{ name: "text-generation" }],
      tailnetIP: "100.64.0.1",
      a2aEndpoint: "https://agent.example.com/a2a",
      publicKey: "base64pubkey==",
      attestation: {
        agentId: "did:galatea:abc123",
        timestamp: new Date().toISOString(),
        nonce: "randomnonce",
        signature: "deadsig",
      },
      ...overrides,
    }
  }

  it("accepts a valid full AgentCard", () => {
    expect(AgentCardSchema.safeParse(makeValidCard()).success).toBe(true)
  })

  it("rejects missing name", () => {
    const { name: _n, ...rest } = makeValidCard()
    expect(AgentCardSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects invalid tailnetIP", () => {
    expect(AgentCardSchema.safeParse(makeValidCard({ tailnetIP: "192.168.1.1" })).success).toBe(false)
    expect(AgentCardSchema.safeParse(makeValidCard({ tailnetIP: "10.0.0.1" })).success).toBe(false)
  })

  it("accepts tailnetIP starting with 100.", () => {
    expect(AgentCardSchema.safeParse(makeValidCard({ tailnetIP: "100.64.0.42" })).success).toBe(true)
  })

  it("rejects empty capabilities array", () => {
    expect(AgentCardSchema.safeParse(makeValidCard({ capabilities: [] })).success).toBe(false)
  })

  it("rejects invalid a2aEndpoint URL", () => {
    expect(AgentCardSchema.safeParse(makeValidCard({ a2aEndpoint: "not-a-url" })).success).toBe(false)
  })

  it("rejects invalid framework", () => {
    expect(AgentCardSchema.safeParse(makeValidCard({ framework: "OpenAI" })).success).toBe(false)
  })
})

describe("generateAgentId", () => {
  it("generates a did:galatea: prefixed string", async () => {
    const id = await generateAgentId("MyAgent", "mypublickey", "LangChain")
    expect(id).toMatch(/^did:galatea:[0-9a-f]{32}$/)
  })

  it("is deterministic — same inputs produce same id", async () => {
    const id1 = await generateAgentId("Alice", "pk1", "AutoGen")
    const id2 = await generateAgentId("Alice", "pk1", "AutoGen")
    expect(id1).toBe(id2)
  })

  it("produces different ids for different inputs", async () => {
    const id1 = await generateAgentId("Alice", "pk1", "AutoGen")
    const id2 = await generateAgentId("Bob", "pk1", "AutoGen")
    expect(id1).not.toBe(id2)
  })
})

describe("shortAgentId", () => {
  it("returns a string starting with did", () => {
    const short = shortAgentId("did:galatea:abcdef1234")
    expect(short).toBe("didabcd")
  })

  it("handles short hex portion gracefully", () => {
    const short = shortAgentId("did:galatea:0000")
    expect(short).toBe("did0000")
  })
})

describe("attestation signature", () => {
  it("produces consistent hex signature for same inputs", async () => {
    const sig1 = await buildAttestationSignature("did:galatea:abc", "2024-01-01T00:00:00.000Z", "nonce1", "pubkey1")
    const sig2 = await buildAttestationSignature("did:galatea:abc", "2024-01-01T00:00:00.000Z", "nonce1", "pubkey1")
    expect(sig1).toBe(sig2)
  })

  it("produces different signatures for different nonces", async () => {
    const sig1 = await buildAttestationSignature("did:galatea:abc", "2024-01-01T00:00:00.000Z", "nonce1", "pubkey1")
    const sig2 = await buildAttestationSignature("did:galatea:abc", "2024-01-01T00:00:00.000Z", "nonce2", "pubkey1")
    expect(sig1).not.toBe(sig2)
  })

  it("returns a 64-char hex string (SHA-256)", async () => {
    const sig = await buildAttestationSignature("a", "2024-01-01T00:00:00.000Z", "n", "pk")
    expect(sig).toMatch(/^[0-9a-f]{64}$/)
  })
})
