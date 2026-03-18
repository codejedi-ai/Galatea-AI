/**
 * Tailnet Bridge Tests
 * Tests ACL rule generation, auth key format validation, and event logging logic.
 * Pure logic tests — no Next.js or Supabase dependencies.
 */

import { describe, test } from 'node:test'
import assert from 'node:assert/strict'

function expect(actual: unknown) {
  return {
    toBe: (expected: unknown) => assert.strictEqual(actual, expected),
    toEqual: (expected: unknown) => assert.deepStrictEqual(actual, expected),
    toHaveLength: (n: number) => assert.strictEqual((actual as { length: number }).length, n),
    toContain: (item: unknown) => assert.ok(Array.isArray(actual) ? actual.includes(item) : String(actual).includes(String(item)), `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`),
    toMatch: (pattern: RegExp | string) => assert.match(String(actual), pattern instanceof RegExp ? pattern : new RegExp(pattern)),
    toBeTruthy: () => assert.ok(actual),
    toBeFalsy: () => assert.ok(!actual),
    not: {
      toBe: (expected: unknown) => assert.notStrictEqual(actual, expected),
      toThrow: () => assert.doesNotThrow(() => (actual as () => unknown)()),
      toBeNaN: () => assert.ok(!isNaN(actual as number)),
    },
    toBeNaN: () => assert.ok(isNaN(actual as number)),
    toThrow: (msg?: string | RegExp) => assert.throws(() => (actual as () => unknown)(), msg ? (msg instanceof RegExp ? { message: msg } : { message: new RegExp(String(msg)) }) : undefined),
  }
}

// ---- ACL Rule Generation ----

function generateMatchACLRules(ctx) {
  const port = ctx.a2aPort != null ? ctx.a2aPort : 8080
  return [
    { action: "accept", src: [ctx.agentAIp], dst: [`${ctx.agentBIp}:${port}`] },
    { action: "accept", src: [ctx.agentBIp], dst: [`${ctx.agentAIp}:${port}`] },
  ]
}

function revokeMatchACLRules(existingRules, ctx) {
  return existingRules.filter((rule) => {
    const involvesBothAgents =
      (rule.src.includes(ctx.agentAIp) || rule.src.includes(ctx.agentBIp)) &&
      rule.dst.some((d) => d.startsWith(ctx.agentAIp) || d.startsWith(ctx.agentBIp))
    return !involvesBothAgents
  })
}

// ---- Auth Key Format Validation ----

function isValidTailscaleAuthKeyFormat(key) {
  return typeof key === "string" && key.startsWith("tskey-auth-") && key.length > 20
}

function isValidGalateaApiKeyFormat(apiKey) {
  // gai_ prefix + 32 hex chars (total 36)
  return typeof apiKey === "string" && apiKey.startsWith("gai_") && apiKey.length === 36
}

// ---- Event Logging Logic ----

const VALID_EVENT_TYPES = [
  "auth_key_issued",
  "agent_joined",
  "agent_departed",
  "acl_created",
  "acl_revoked",
  "ping_reported",
  "connection_established",
]

function isValidEventType(type) {
  return VALID_EVENT_TYPES.includes(type)
}

function buildTailnetEvent(eventType, agentId, payload) {
  return {
    event_type: eventType,
    agent_id: agentId,
    payload,
    created_at: new Date().toISOString(),
  }
}

function getLatencyColor(ms) {
  if (ms < 20) return "green"
  if (ms < 100) return "yellow"
  return "red"
}

// ---- Test Suites ----

describe("ACL Rule Generation", () => {
  const ctx = {
    matchId: "match-abc-123",
    agentAIp: "100.64.1.1",
    agentBIp: "100.64.1.2",
  }

  test("generates exactly 2 rules for a matched pair", () => {
    const rules = generateMatchACLRules(ctx)
    expect(rules).toHaveLength(2)
  })

  test("rules use default A2A port 8080", () => {
    const rules = generateMatchACLRules(ctx)
    expect(rules[0].dst[0]).toBe("100.64.1.2:8080")
    expect(rules[1].dst[0]).toBe("100.64.1.1:8080")
  })

  test("rules use custom port when specified", () => {
    const rules = generateMatchACLRules({ ...ctx, a2aPort: 9090 })
    expect(rules[0].dst[0]).toBe("100.64.1.2:9090")
    expect(rules[1].dst[0]).toBe("100.64.1.1:9090")
  })

  test("all rules have action: accept", () => {
    const rules = generateMatchACLRules(ctx)
    rules.forEach((rule) => expect(rule.action).toBe("accept"))
  })

  test("agent A can reach agent B (first rule)", () => {
    const rules = generateMatchACLRules(ctx)
    expect(rules[0].src).toContain(ctx.agentAIp)
    expect(rules[0].dst[0]).toContain(ctx.agentBIp)
  })

  test("agent B can reach agent A (second rule)", () => {
    const rules = generateMatchACLRules(ctx)
    expect(rules[1].src).toContain(ctx.agentBIp)
    expect(rules[1].dst[0]).toContain(ctx.agentAIp)
  })

  test("revokes only rules involving matched pair", () => {
    const otherRule = {
      action: "accept",
      src: ["100.64.2.1"],
      dst: ["100.64.2.2:8080"],
    }
    const allRules = [...generateMatchACLRules(ctx), otherRule]
    const remaining = revokeMatchACLRules(allRules, ctx)
    expect(remaining).toHaveLength(1)
    expect(remaining[0]).toBe(otherRule)
  })

  test("revoke on empty rules returns empty array", () => {
    const remaining = revokeMatchACLRules([], ctx)
    expect(remaining).toHaveLength(0)
  })
})

describe("Auth Key Format Validation", () => {
  test("valid Tailscale auth key format is accepted", () => {
    expect(isValidTailscaleAuthKeyFormat("tskey-auth-kQfGBNLDaFVKcjcn1234567890")).toBe(true)
  })

  test("non-prefixed string is rejected", () => {
    expect(isValidTailscaleAuthKeyFormat("some-random-key")).toBe(false)
  })

  test("empty string is rejected", () => {
    expect(isValidTailscaleAuthKeyFormat("")).toBe(false)
  })

  test("valid Galatea API key format starts with gai_ and has correct length", () => {
    const key = "gai_" + "a".repeat(32)
    expect(isValidGalateaApiKeyFormat(key)).toBe(true)
  })

  test("Galatea API key without gai_ prefix is invalid", () => {
    expect(isValidGalateaApiKeyFormat("sk_" + "a".repeat(33))).toBe(false)
  })

  test("short Galatea API key is invalid", () => {
    expect(isValidGalateaApiKeyFormat("gai_short")).toBe(false)
  })
})

describe("Tailnet Event Logging Logic", () => {
  test("all valid event types are recognized", () => {
    VALID_EVENT_TYPES.forEach((type) => {
      expect(isValidEventType(type)).toBe(true)
    })
  })

  test("invalid event type is rejected", () => {
    expect(isValidEventType("unknown_event")).toBe(false)
  })

  test("built event contains required fields", () => {
    const event = buildTailnetEvent("auth_key_issued", "agent-uuid-123", { key_id: "k123" })
    expect(event.event_type).toBe("auth_key_issued")
    expect(event.agent_id).toBe("agent-uuid-123")
    expect(event.payload).toEqual({ key_id: "k123" })
    expect(typeof event.created_at).toBe("string")
    expect(new Date(event.created_at).toISOString()).toBe(event.created_at)
  })

  test("event created_at is a valid ISO timestamp", () => {
    const event = buildTailnetEvent("agent_joined", "agent-uuid-456", {})
    expect(() => new Date(event.created_at)).not.toThrow()
    expect(new Date(event.created_at).getTime()).not.toBeNaN()
  })

  test("ping_reported event captures latency payload", () => {
    const event = buildTailnetEvent("ping_reported", "agent-uuid-789", { latency_ms: 15 })
    expect(event.payload.latency_ms).toBe(15)
  })
})

describe("Latency Color Thresholds", () => {
  test("latency < 20ms is green (excellent)", () => {
    expect(getLatencyColor(5)).toBe("green")
    expect(getLatencyColor(19)).toBe("green")
  })

  test("latency 20-99ms is yellow (good)", () => {
    expect(getLatencyColor(20)).toBe("yellow")
    expect(getLatencyColor(99)).toBe("yellow")
  })

  test("latency >= 100ms is red (poor)", () => {
    expect(getLatencyColor(100)).toBe("red")
    expect(getLatencyColor(500)).toBe("red")
  })
})
