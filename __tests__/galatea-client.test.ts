import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GalateaClient } from '../lib/galatea-client.ts'
import type { AgentCard, RegisterResponse } from '../lib/galatea-client.ts'

// --- expect shim ---
function expect(actual: unknown) {
  return {
    toBe: (expected: unknown) => assert.strictEqual(actual, expected),
    toEqual: (expected: unknown) => assert.deepStrictEqual(actual, expected),
    toBeInstanceOf: (C: new (...a: unknown[]) => unknown) =>
      assert.ok(actual instanceof C, `Expected instance of ${C.name}`),
    toContain: (item: unknown) =>
      assert.ok(String(actual).includes(String(item))),
    toBeTruthy: () => assert.ok(actual),
    not: { toBe: (expected: unknown) => assert.notStrictEqual(actual, expected) },
  }
}

// --- Type-level smoke tests (compile-time only) ---
// If AgentCard or RegisterResponse aren't exported the file won't compile.
const _agentCard: AgentCard = {
  name: 'TypeCheck',
  purpose: 'Verifying type exports',
  framework: 'node:test',
  capabilities: ['typecheck'],
}
const _regResponse: RegisterResponse = {
  agentId: 'agt_typecheck',
  apiKey: 'gal_typecheck',
}
void _agentCard
void _regResponse

// ---------------------------------------------------------------------------

describe('GalateaClient — constructor', () => {
  it('creates a client without options', () => {
    const client = new GalateaClient()
    expect(client).toBeInstanceOf(GalateaClient)
  })

  it('accepts an apiKey option', () => {
    const client = new GalateaClient({ apiKey: 'gal_abc' })
    expect(client).toBeInstanceOf(GalateaClient)
  })

  it('accepts a custom registrationUrl', () => {
    const client = new GalateaClient({ registrationUrl: 'http://localhost/api/agents/join' })
    expect(client).toBeInstanceOf(GalateaClient)
  })
})

// ---------------------------------------------------------------------------

describe('GalateaClient — heartbeat() without apiKey', () => {
  it('throws when no apiKey is set', async () => {
    const client = new GalateaClient()
    await assert.rejects(
      () => client.heartbeat(),
      (err: Error) => {
        assert.ok(
          err.message.includes('apiKey'),
          `Expected error about apiKey, got: ${err.message}`
        )
        return true
      }
    )
  })
})

// ---------------------------------------------------------------------------

describe('GalateaClient — swipe() without apiKey', () => {
  it('throws when no apiKey is set', async () => {
    const client = new GalateaClient()
    await assert.rejects(
      () => client.swipe('agt_other', 'like'),
      (err: Error) => {
        assert.ok(
          err.message.includes('apiKey'),
          `Expected error about apiKey, got: ${err.message}`
        )
        return true
      }
    )
  })
})

// ---------------------------------------------------------------------------

describe('GalateaClient — stopHeartbeat()', () => {
  it('can call stopHeartbeat without errors when no interval is running', () => {
    const client = new GalateaClient({ apiKey: 'gal_test' })
    assert.doesNotThrow(() => client.stopHeartbeat())
  })
})

// ---------------------------------------------------------------------------

describe('GalateaClient — URL derivation', () => {
  it('heartbeat URL replaces /join with /heartbeat', async () => {
    // We can verify URL derivation by inspecting the error message when fetch
    // is unavailable or by patching global.fetch temporarily.
    // Use a custom registrationUrl so we control the base.
    const captured: { url?: string } = {}
    const originalFetch = global.fetch
    global.fetch = (async (url: string) => {
      captured.url = url
      return { ok: true, json: async () => ({}) } as Response
    }) as typeof fetch

    try {
      const client = new GalateaClient({
        apiKey: 'gal_abc',
        registrationUrl: 'http://localhost/api/agents/join',
      })
      await client.heartbeat()
      assert.strictEqual(captured.url, 'http://localhost/api/agents/heartbeat')
    } finally {
      global.fetch = originalFetch
      // No need to restore anything else — no interval was started
    }
  })

  it('swipe URL replaces /join with /swipe', async () => {
    const captured: { url?: string } = {}
    const originalFetch = global.fetch
    global.fetch = (async (url: string) => {
      captured.url = url
      return { ok: true, json: async () => ({}) } as Response
    }) as typeof fetch

    try {
      const client = new GalateaClient({
        apiKey: 'gal_abc',
        registrationUrl: 'http://localhost/api/agents/join',
      })
      await client.swipe('agt_other', 'like')
      assert.strictEqual(captured.url, 'http://localhost/api/agents/swipe')
    } finally {
      global.fetch = originalFetch
    }
  })
})
