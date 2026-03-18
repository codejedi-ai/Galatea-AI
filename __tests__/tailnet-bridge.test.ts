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
    { action: "accept", src: [ctx.agentAIp], dst: [ctx.agentBIp + ":" + port] },
    { action: "accept", src: [ctx.agentBIp], dst: [ctx.agentAIp + ":" + port] },
  ]
}

function revokeMatchACLRules(existingRules, ctx) {
  return existingRules.filter(function(rule) {
    var involvesBothAgents =
      (rule.src.indexOf(ctx.agentAIp) !== -1 || rule.src.indexOf(ctx.agentBIp) !== -1) &&
      rule.dst.some(function(d) { return d.indexOf(ctx.agentAIp) === 0 || d.indexOf(ctx.agentBIp) === 0 })
    return !involvesBothAgents
  })
}

// ---- Auth Key Format Validation ----

function isValidTailscaleAuthKeyFormat(key) {
  return typeof key === "string" && key.indexOf("tskey-auth-") === 0 && key.length > 20
}

function isValidGalateaApiKeyFormat(apiKey) {
  return typeof apiKey === "string" && apiKey.indexOf("gai_") === 0 && apiKey.length === 36
}

// ---- Event Logging Logic ----

var VALID_EVENT_TYPES = [
  "auth_key_issued",
  "agent_joined",
  "agent_departed",
  "acl_created",
  "acl_revoked",
  "ping_reported",
  "connection_established",
]

function isValidEventType(type) {
  return VALID_EVENT_TYPES.indexOf(type) !== -1
}

function buildTailnetEvent(eventType, agentId, payload) {
  return {
    event_type: eventType,
    agent_id: agentId,
    payload: payload,
    created_at: new Date().toISOString(),
  }
}

function getLatencyColor(ms) {
  if (ms < 20) return "green"
  if (ms < 100) return "yellow"
  return "red"
}

// ---- Test Suites ----

describe("ACL Rule Generation", function() {
  var ctx = {
    matchId: "match-abc-123",
    agentAIp: "100.64.1.1",
    agentBIp: "100.64.1.2",
  }

  test("generates exactly 2 rules for a matched pair", function() {
    var rules = generateMatchACLRules(ctx)
    expect(rules).toHaveLength(2)
  })

  test("rules use default A2A port 8080", function() {
    var rules = generateMatchACLRules(ctx)
    expect(rules[0].dst[0]).toBe("100.64.1.2:8080")
    expect(rules[1].dst[0]).toBe("100.64.1.1:8080")
  })

  test("rules use custom port when specified", function() {
    var rules = generateMatchACLRules(Object.assign({}, ctx, { a2aPort: 9090 }))
    expect(rules[0].dst[0]).toBe("100.64.1.2:9090")
    expect(rules[1].dst[0]).toBe("100.64.1.1:9090")
  })

  test("all rules have action: accept", function() {
    var rules = generateMatchACLRules(ctx)
    rules.forEach(function(rule) { expect(rule.action).toBe("accept") })
  })

  test("agent A can reach agent B (first rule)", function() {
    var rules = generateMatchACLRules(ctx)
    expect(rules[0].src).toContain(ctx.agentAIp)
    expect(rules[0].dst[0]).toContain(ctx.agentBIp)
  })

  test("agent B can reach agent A (second rule)", function() {
    var rules = generateMatchACLRules(ctx)
    expect(rules[1].src).toContain(ctx.agentBIp)
    expect(rules[1].dst[0]).toContain(ctx.agentAIp)
  })

  test("revokes only rules involving matched pair", function() {
    var otherRule = {
      action: "accept",
      src: ["100.64.2.1"],
      dst: ["100.64.2.2:8080"],
    }
    var allRules = generateMatchACLRules(ctx).concat([otherRule])
    var remaining = revokeMatchACLRules(allRules, ctx)
    expect(remaining).toHaveLength(1)
    expect(remaining[0]).toBe(otherRule)
  })

  test("revoke on empty rules returns empty array", function() {
    var remaining = revokeMatchACLRules([], ctx)
    expect(remaining).toHaveLength(0)
  })
})

describe("Auth Key Format Validation", function() {
  test("valid Tailscale auth key format is accepted", function() {
    expect(isValidTailscaleAuthKeyFormat("tskey-auth-kQfGBNLDaFVKcjcn1234567890")).toBe(true)
  })

  test("non-prefixed string is rejected", function() {
    expect(isValidTailscaleAuthKeyFormat("some-random-key")).toBe(false)
  })

  test("empty string is rejected", function() {
    expect(isValidTailscaleAuthKeyFormat("")).toBe(false)
  })

  test("valid Galatea API key format starts with gai_ and has correct length", function() {
    var key = "gai_" + new Array(33).join("a")
    expect(isValidGalateaApiKeyFormat(key)).toBe(true)
  })

  test("Galatea API key without gai_ prefix is invalid", function() {
    expect(isValidGalateaApiKeyFormat("sk_" + new Array(34).join("a"))).toBe(false)
  })

  test("short Galatea API key is invalid", function() {
    expect(isValidGalateaApiKeyFormat("gai_short")).toBe(false)
  })
})

describe("Tailnet Event Logging Logic", function() {
  test("all valid event types are recognized", function() {
    VALID_EVENT_TYPES.forEach(function(type) {
      expect(isValidEventType(type)).toBe(true)
    })
  })

  test("invalid event type is rejected", function() {
    expect(isValidEventType("unknown_event")).toBe(false)
  })

  test("built event contains required fields", function() {
    var event = buildTailnetEvent("auth_key_issued", "agent-uuid-123", { key_id: "k123" })
    expect(event.event_type).toBe("auth_key_issued")
    expect(event.agent_id).toBe("agent-uuid-123")
    expect(event.payload).toEqual({ key_id: "k123" })
    expect(typeof event.created_at).toBe("string")
    expect(new Date(event.created_at).toISOString()).toBe(event.created_at)
  })

  test("event created_at is a valid ISO timestamp", function() {
    var event = buildTailnetEvent("agent_joined", "agent-uuid-456", {})
    expect(isNaN(new Date(event.created_at).getTime())).toBe(false)
  })

  test("ping_reported event captures latency payload", function() {
    var event = buildTailnetEvent("ping_reported", "agent-uuid-789", { latency_ms: 15 })
    expect(event.payload.latency_ms).toBe(15)
  })
})

describe("Latency Color Thresholds", function() {
  test("latency < 20ms is green (excellent)", function() {
    expect(getLatencyColor(5)).toBe("green")
    expect(getLatencyColor(19)).toBe("green")
  })

  test("latency 20-99ms is yellow (good)", function() {
    expect(getLatencyColor(20)).toBe("yellow")
    expect(getLatencyColor(99)).toBe("yellow")
  })

  test("latency >= 100ms is red (poor)", function() {
    expect(getLatencyColor(100)).toBe("red")
    expect(getLatencyColor(500)).toBe("red")
  })
})
