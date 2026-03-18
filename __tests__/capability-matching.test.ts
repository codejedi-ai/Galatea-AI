import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  ALL_CAPABILITIES,
  PLANNING_CAPABILITIES,
  EXECUTION_CAPABILITIES,
  getCapabilityById,
  getCapabilitiesByCategory,
  categoriesForIds,
  CATEGORY_COLOURS,
  type CapabilityCategory,
} from '../lib/capabilities/taxonomy.ts'

import {
  cosineSimilarity,
  fallbackSimilarity,
} from '../lib/capabilities/embeddings.ts'

import {
  computeMatchScore,
  applyDiversityBoost,
  type AgentProfile,
} from '../lib/capabilities/match-score.ts'

function expect(actual: unknown) {
  return {
    toBe: (expected: unknown) => assert.strictEqual(actual, expected),
    toEqual: (expected: unknown) => assert.deepStrictEqual(actual, expected),
    toMatch: (pattern: RegExp | string) =>
      assert.match(String(actual), pattern instanceof RegExp ? pattern : new RegExp(pattern)),
    toBeGreaterThan: (n: number) =>
      assert.ok((actual as number) > n, `Expected ${actual} > ${n}`),
    toBeLessThan: (n: number) =>
      assert.ok((actual as number) < n, `Expected ${actual} < ${n}`),
    toBeGreaterThanOrEqual: (n: number) =>
      assert.ok((actual as number) >= n, `Expected ${actual} >= ${n}`),
    toBeLessThanOrEqual: (n: number) =>
      assert.ok((actual as number) <= n, `Expected ${actual} <= ${n}`),
    toHaveLength: (n: number) =>
      assert.strictEqual((actual as { length: number }).length, n),
    toContain: (item: unknown) =>
      assert.ok(
        Array.isArray(actual)
          ? actual.includes(item)
          : String(actual).includes(String(item)),
      ),
    toBeInstanceOf: (C: new (...a: unknown[]) => unknown) =>
      assert.ok(actual instanceof C),
    toBeTruthy: () => assert.ok(actual),
    toBeFalsy: () => assert.ok(!actual),
    not: {
      toBe: (expected: unknown) => assert.notStrictEqual(actual, expected),
      toEqual: (expected: unknown) => {
        try {
          assert.deepStrictEqual(actual, expected)
          throw new Error('Expected not equal')
        } catch (e: unknown) {
          if ((e as Error).message === 'Expected not equal') throw e
        }
      },
    },
  }
}

// ─── Taxonomy tests ───────────────────────────────────────────────────────────

describe('taxonomy', () => {
  it('ALL_CAPABILITIES is non-empty', () => {
    expect(ALL_CAPABILITIES.length).toBeGreaterThan(0)
  })

  it('every capability has a non-empty id, category, description, and valid proficiency', () => {
    for (const cap of ALL_CAPABILITIES) {
      assert.ok(cap.id.length > 0, `empty id: ${JSON.stringify(cap)}`)
      assert.ok(cap.description.length > 0, `empty description for ${cap.id}`)
      assert.ok([1, 2, 3].includes(cap.proficiencyLevel), `bad proficiency for ${cap.id}`)
    }
  })

  it('getCapabilityById returns the correct capability for a known id', () => {
    const cap = getCapabilityById('task-decomposition')
    expect(cap?.id).toBe('task-decomposition')
    expect(cap?.category).toBe('planning')
  })

  it('getCapabilityById returns undefined for an unknown id', () => {
    const cap = getCapabilityById('not-a-real-capability')
    expect(cap).toBe(undefined)
  })

  it('getCapabilitiesByCategory returns only capabilities of that category', () => {
    const planningCaps = getCapabilitiesByCategory('planning')
    assert.ok(planningCaps.length > 0)
    for (const cap of planningCaps) {
      expect(cap.category).toBe('planning')
    }
  })

  it('getCapabilitiesByCategory planning matches PLANNING_CAPABILITIES export', () => {
    const planningCaps = getCapabilitiesByCategory('planning')
    expect(planningCaps.length).toBe(PLANNING_CAPABILITIES.length)
  })

  it('getCapabilitiesByCategory execution matches EXECUTION_CAPABILITIES export', () => {
    const execCaps = getCapabilitiesByCategory('execution')
    expect(execCaps.length).toBe(EXECUTION_CAPABILITIES.length)
  })

  it('categoriesForIds returns correct categories for known ids', () => {
    const cats = categoriesForIds(['task-decomposition', 'code-execution'])
    expect(cats.has('planning')).toBe(true)
    expect(cats.has('execution')).toBe(true)
    expect(cats.size).toBe(2)
  })

  it('categoriesForIds ignores unknown ids', () => {
    const cats = categoriesForIds(['task-decomposition', 'not-a-real-id'])
    expect(cats.size).toBe(1)
    expect(cats.has('planning')).toBe(true)
  })

  it('categoriesForIds returns empty set for empty input', () => {
    const cats = categoriesForIds([])
    expect(cats.size).toBe(0)
  })

  it('CATEGORY_COLOURS has an entry for every valid category', () => {
    const validCategories: CapabilityCategory[] = [
      'planning', 'execution', 'data', 'communication',
      'integration', 'security', 'meta',
    ]
    for (const cat of validCategories) {
      assert.ok(CATEGORY_COLOURS[cat], `missing colour for ${cat}`)
    }
  })

  it('all capability ids are unique', () => {
    const ids = ALL_CAPABILITIES.map((c) => c.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})

// ─── Embedding / vector tests ─────────────────────────────────────────────────

describe('embeddings', () => {
  it('cosineSimilarity of identical unit vectors is 1', () => {
    const a = [1, 0, 0]
    const b = [1, 0, 0]
    const sim = cosineSimilarity(a, b)
    expect(Math.round(sim * 1000) / 1000).toBe(1)
  })

  it('cosineSimilarity of orthogonal vectors is 0', () => {
    const a = [1, 0, 0]
    const b = [0, 1, 0]
    expect(cosineSimilarity(a, b)).toBe(0)
  })

  it('cosineSimilarity of opposite vectors is -1', () => {
    const a = [1, 0, 0]
    const b = [-1, 0, 0]
    expect(cosineSimilarity(a, b)).toBe(-1)
  })

  it('cosineSimilarity returns 0 for mismatched lengths', () => {
    const a = [1, 2, 3]
    const b = [1, 2]
    expect(cosineSimilarity(a, b)).toBe(0)
  })

  it('cosineSimilarity returns 0 for zero vectors', () => {
    const a = [0, 0, 0]
    const b = [0, 0, 0]
    expect(cosineSimilarity(a, b)).toBe(0)
  })

  it('fallbackSimilarity: same capability ids give similarity close to 1', () => {
    const ids = ['task-decomposition', 'code-execution']
    const sim = fallbackSimilarity(ids, ids)
    expect(sim).toBeGreaterThanOrEqual(0.99)
  })

  it('fallbackSimilarity: completely different ids give lower similarity than identical ids', () => {
    const planningIds = ['task-decomposition', 'goal-alignment']
    const securityIds = ['prompt-injection-defense', 'secret-management']
    const sameSim = fallbackSimilarity(planningIds, planningIds)
    const diffSim = fallbackSimilarity(planningIds, securityIds)
    expect(sameSim).toBeGreaterThan(diffSim)
  })

  it('fallbackSimilarity is symmetric', () => {
    const a = ['task-decomposition', 'sql-query']
    const b = ['code-execution', 'sentiment-analysis']
    const simAB = fallbackSimilarity(a, b)
    const simBA = fallbackSimilarity(b, a)
    // Allow tiny floating point difference
    assert.ok(Math.abs(simAB - simBA) < 1e-10, `asymmetric: ${simAB} vs ${simBA}`)
  })

  it('fallbackSimilarity: overlapping ids produce higher score than no overlap', () => {
    const a = ['task-decomposition', 'code-execution', 'sql-query']
    const bOverlap = ['task-decomposition', 'code-execution', 'sentiment-analysis']
    const bNoOverlap = ['prompt-injection-defense', 'secret-management', 'rest-api']
    const simOverlap = fallbackSimilarity(a, bOverlap)
    const simNoOverlap = fallbackSimilarity(a, bNoOverlap)
    expect(simOverlap).toBeGreaterThan(simNoOverlap)
  })
})

// ─── Match score tests ─────────────────────────────────────────────────────────

describe('computeMatchScore', () => {
  const plannerAgent: AgentProfile = {
    id: 'agent-planner',
    capabilities: ['task-decomposition', 'goal-alignment', 'resource-estimation'],
    architecture_type: 'claude',
    trustScore: 80,
  }

  const executorAgent: AgentProfile = {
    id: 'agent-executor',
    capabilities: ['code-execution', 'web-browsing', 'tool-use'],
    architecture_type: 'gpt',
    trustScore: 75,
  }

  const identicalAgent: AgentProfile = {
    id: 'agent-identical',
    capabilities: ['task-decomposition', 'goal-alignment', 'resource-estimation'],
    architecture_type: 'claude',
    trustScore: 80,
  }

  const lowTrustAgent: AgentProfile = {
    id: 'agent-low-trust',
    capabilities: ['code-execution', 'tool-use'],
    architecture_type: 'llama',
    trustScore: 10,
  }

  it('returns an object with total, semantic, complementarity, trustCompatibility, architectureCompat', () => {
    const result = computeMatchScore(plannerAgent, executorAgent)
    assert.ok('total' in result)
    assert.ok('semantic' in result)
    assert.ok('complementarity' in result)
    assert.ok('trustCompatibility' in result)
    assert.ok('architectureCompat' in result)
  })

  it('total score is in range 0–100', () => {
    const result = computeMatchScore(plannerAgent, executorAgent)
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.total).toBeLessThanOrEqual(100)
  })

  it('all sub-scores are in range 0–100', () => {
    const result = computeMatchScore(plannerAgent, executorAgent)
    for (const key of ['semantic', 'complementarity', 'trustCompatibility', 'architectureCompat'] as const) {
      assert.ok(result[key] >= 0 && result[key] <= 100, `${key} out of range: ${result[key]}`)
    }
  })

  it('complementarity score is high when agents cover different categories', () => {
    const result = computeMatchScore(plannerAgent, executorAgent)
    // planner covers planning, executor covers execution — should have high complementarity
    expect(result.complementarity).toBeGreaterThan(50)
  })

  it('complementarity score is 0 for identical agents', () => {
    // Same capabilities → same categories → Jaccard distance = 0
    const result = computeMatchScore(plannerAgent, identicalAgent)
    expect(result.complementarity).toBe(0)
  })

  it('trust compatibility is high for agents with similar trust scores', () => {
    const result = computeMatchScore(plannerAgent, executorAgent)
    // plannerAgent=80, executorAgent=75 → delta=5 → score=0.95 → 95
    expect(result.trustCompatibility).toBeGreaterThanOrEqual(90)
  })

  it('trust compatibility is lower when trust scores differ significantly', () => {
    const highTrustLow = computeMatchScore(plannerAgent, lowTrustAgent)
    const highTrustSimilar = computeMatchScore(plannerAgent, executorAgent)
    // plannerAgent(80) vs lowTrustAgent(10) should be lower than plannerAgent(80) vs executorAgent(75)
    expect(highTrustLow.trustCompatibility).toBeLessThan(highTrustSimilar.trustCompatibility)
  })

  it('architectureCompat is 100 for same architecture', () => {
    // plannerAgent and identicalAgent are both claude
    const result = computeMatchScore(plannerAgent, identicalAgent)
    expect(result.architectureCompat).toBe(100)
  })

  it('architectureCompat is 90 for same family (both claude variants)', () => {
    const agentA: AgentProfile = {
      id: 'a', capabilities: ['task-decomposition'], architecture_type: 'claude-3', trustScore: 50,
    }
    const agentB: AgentProfile = {
      id: 'b', capabilities: ['task-decomposition'], architecture_type: 'claude-opus', trustScore: 50,
    }
    const result = computeMatchScore(agentA, agentB)
    expect(result.architectureCompat).toBe(90)
  })

  it('architectureCompat is 60 for different known families', () => {
    // plannerAgent=claude, executorAgent=gpt → familyA != familyB → 0.6 → 60
    const result = computeMatchScore(plannerAgent, executorAgent)
    expect(result.architectureCompat).toBe(60)
  })

  it('is symmetric — score(A,B) == score(B,A)', () => {
    const ab = computeMatchScore(plannerAgent, executorAgent)
    const ba = computeMatchScore(executorAgent, plannerAgent)
    expect(ab.total).toBe(ba.total)
    expect(ab.complementarity).toBe(ba.complementarity)
    expect(ab.trustCompatibility).toBe(ba.trustCompatibility)
  })

  it('agents with no capabilities produce complementarity of 0', () => {
    const noCapA: AgentProfile = { id: 'x', capabilities: [], architecture_type: 'claude', trustScore: 50 }
    const noCapB: AgentProfile = { id: 'y', capabilities: [], architecture_type: 'claude', trustScore: 50 }
    const result = computeMatchScore(noCapA, noCapB)
    expect(result.complementarity).toBe(0)
  })

  it('using pre-computed embedding vectors routes through cosine similarity', () => {
    const vecA: AgentProfile = {
      id: 'vec-a',
      capabilities: ['task-decomposition'],
      architecture_type: 'claude',
      trustScore: 50,
      embeddingVector: [1, 0, 0],
    }
    const vecB: AgentProfile = {
      id: 'vec-b',
      capabilities: ['code-execution'],
      architecture_type: 'claude',
      trustScore: 50,
      embeddingVector: [1, 0, 0],
    }
    const result = computeMatchScore(vecA, vecB)
    // cosine([1,0,0],[1,0,0]) = 1 → semantic score = 100
    expect(result.semantic).toBe(100)
  })
})

// ─── applyDiversityBoost tests ────────────────────────────────────────────────

describe('applyDiversityBoost', () => {
  type Candidate = { capabilities: string[]; score: number }

  it('returns same number of items when under the per-category limit', () => {
    const candidates: Candidate[] = [
      { capabilities: ['task-decomposition'], score: 90 },
      { capabilities: ['goal-alignment'], score: 85 },
      { capabilities: ['code-execution'], score: 80 },
    ]
    const result = applyDiversityBoost(candidates, 4)
    expect(result.length).toBe(3)
  })

  it('defers candidates that exceed maxPerCategory', () => {
    // 5 planning candidates with maxPerCategory=2 → first 2 in result, rest at end
    const planningCaps = PLANNING_CAPABILITIES.map((c) => c.id)
    const candidates: Candidate[] = planningCaps.map((id, i) => ({
      capabilities: [id],
      score: 100 - i,
    }))

    const result = applyDiversityBoost(candidates, 2)
    expect(result.length).toBe(candidates.length)

    // First 2 should be the ones that fit within the limit
    const first2Cats = result.slice(0, 2).flatMap((c) =>
      [...categoriesForIds(c.capabilities)],
    )
    for (const cat of first2Cats) {
      expect(cat).toBe('planning')
    }
  })

  it('preserves all items regardless of over-representation', () => {
    const candidates: Candidate[] = Array.from({ length: 10 }, (_, i) => ({
      capabilities: ['task-decomposition'],
      score: 100 - i,
    }))
    const result = applyDiversityBoost(candidates, 2)
    expect(result.length).toBe(10)
  })

  it('items with no capabilities are included directly without deferral', () => {
    const candidates: Candidate[] = [
      { capabilities: [], score: 90 },
      { capabilities: [], score: 80 },
      { capabilities: [], score: 70 },
    ]
    const result = applyDiversityBoost(candidates, 1)
    expect(result.length).toBe(3)
  })

  it('mixed categories: items within limit come before deferred', () => {
    const candidates: Candidate[] = [
      { capabilities: ['task-decomposition'], score: 100 },   // planning #1 — kept
      { capabilities: ['code-execution'], score: 99 },         // execution #1 — kept
      { capabilities: ['goal-alignment'], score: 98 },         // planning #2 — deferred (maxPerCategory=1)
      { capabilities: ['web-browsing'], score: 97 },           // execution #2 — deferred
    ]
    const result = applyDiversityBoost(candidates, 1)
    // First 2 items should be one planning and one execution (no duplicates in first half)
    const firstTwo = result.slice(0, 2)
    const catsInFirstTwo = new Set(firstTwo.flatMap((c) => [...categoriesForIds(c.capabilities)]))
    expect(catsInFirstTwo.has('planning')).toBe(true)
    expect(catsInFirstTwo.has('execution')).toBe(true)
  })
})
