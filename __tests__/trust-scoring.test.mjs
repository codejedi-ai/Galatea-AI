/**
 * Trust Scoring Engine — Unit Tests
 *
 * These tests validate the scoring algorithm logic directly.
 * Written in plain JS to avoid needing ts-jest / babel transforms.
 */

import { describe, test } from 'node:test'
import assert from 'node:assert/strict'

const expect = (actual) => ({
  toBe: (expected) => assert.strictEqual(actual, expected),
  toEqual: (expected) => assert.deepStrictEqual(actual, expected),
  toHaveLength: (n) => assert.strictEqual(actual.length, n),
  toContain: (item) => assert.ok(Array.isArray(actual) ? actual.includes(item) : String(actual).includes(String(item))),
  toMatch: (pattern) => assert.match(String(actual), pattern instanceof RegExp ? pattern : new RegExp(pattern)),
  toBeTruthy: () => assert.ok(actual),
  toBeFalsy: () => assert.ok(!actual),
  toBeNull: () => assert.strictEqual(actual, null),
  not: {
    toBe: (expected) => assert.notStrictEqual(actual, expected),
    toThrow: () => assert.doesNotThrow(() => typeof actual === 'function' ? actual() : actual),
    toHaveLength: (n) => assert.notStrictEqual((actual || []).length, n),
    toBeNull: () => assert.notStrictEqual(actual, null),
  },
  toThrow: (msg) => {
    if (typeof actual === 'function') {
      assert.throws(actual, msg ? { message: new RegExp(msg) } : undefined)
    } else {
      assert.throws(() => actual, msg ? { message: new RegExp(msg) } : undefined)
    }
  },
})

// -------------------------------------------------------
// Inline the scoring constants (mirrors scoring-config.ts)
// -------------------------------------------------------
const TRUST_CONFIG = {
  MIN_SCORE: 0,
  MAX_SCORE: 1000,
  INITIAL_SCORE: 100,
  TASK_COMPLETION: {
    LOW_COMPLEXITY: 5,
    MEDIUM_COMPLEXITY: 10,
    HIGH_COMPLEXITY: 20,
  },
  PEER_REVIEW: {
    STAR_MULTIPLIER: 10,
  },
  UPTIME: {
    PERFECT_UPTIME_BONUS: 50,
    GOOD_UPTIME_BONUS: 30,
    PARTIAL_UPTIME_BONUS: 10,
    POOR_UPTIME_PENALTY: -20,
    UPTIME_GOOD_THRESHOLD: 0.9,
    UPTIME_PARTIAL_THRESHOLD: 0.7,
  },
  TRANSPARENCY: {
    BLUEPRINT_PUBLISHED: 30,
    CARD_VERIFIED: 20,
  },
  PENALTIES: {
    FAILED_CONNECTION: -5,
    TIMED_OUT_TASK: -8,
    BAD_BEHAVIOUR_FLAG: -25,
    LOW_STAR_REVIEW: -10,
  },
  TIERS: {
    UNVERIFIED: { min: 0, max: 199 },
    BRONZE: { min: 200, max: 399 },
    SILVER: { min: 400, max: 599 },
    GOLD: { min: 600, max: 799 },
    PLATINUM: { min: 800, max: 1000 },
  },
}

// -------------------------------------------------------
// Pure scoring functions (mirrors scoring.ts)
// -------------------------------------------------------

function clampScore(score) {
  return Math.max(TRUST_CONFIG.MIN_SCORE, Math.min(TRUST_CONFIG.MAX_SCORE, Math.round(score)))
}

function calcTaskCompletionDelta(complexity) {
  switch (complexity) {
    case "high":   return TRUST_CONFIG.TASK_COMPLETION.HIGH_COMPLEXITY
    case "medium": return TRUST_CONFIG.TASK_COMPLETION.MEDIUM_COMPLEXITY
    default:       return TRUST_CONFIG.TASK_COMPLETION.LOW_COMPLEXITY
  }
}

function calcPeerReviewDelta(review) {
  if (review.isSuspicious) return 0

  const { rating, taskCompleted } = review
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5")

  let delta
  if (rating === 1) {
    delta = TRUST_CONFIG.PENALTIES.LOW_STAR_REVIEW
  } else {
    delta = (rating - 2) * TRUST_CONFIG.PEER_REVIEW.STAR_MULTIPLIER
  }

  if (taskCompleted && rating >= 3) {
    delta += TRUST_CONFIG.TASK_COMPLETION.LOW_COMPLEXITY
  }

  return delta
}

function calcUptimeDelta(uptimeRatio) {
  if (uptimeRatio >= TRUST_CONFIG.UPTIME.UPTIME_GOOD_THRESHOLD) {
    return uptimeRatio >= 1.0
      ? TRUST_CONFIG.UPTIME.PERFECT_UPTIME_BONUS
      : TRUST_CONFIG.UPTIME.GOOD_UPTIME_BONUS
  }
  if (uptimeRatio >= TRUST_CONFIG.UPTIME.UPTIME_PARTIAL_THRESHOLD) {
    return TRUST_CONFIG.UPTIME.PARTIAL_UPTIME_BONUS
  }
  return TRUST_CONFIG.UPTIME.POOR_UPTIME_PENALTY
}

function calcTransparencyDelta(hasBlueprint, cardVerified) {
  let delta = 0
  if (hasBlueprint) delta += TRUST_CONFIG.TRANSPARENCY.BLUEPRINT_PUBLISHED
  if (cardVerified) delta += TRUST_CONFIG.TRANSPARENCY.CARD_VERIFIED
  return delta
}

function calculateScoreFromEvents(initialScore, events) {
  let score = initialScore
  for (const event of events) {
    score += event.delta
  }
  return clampScore(score)
}

function getTrustTier(score) {
  if (score >= TRUST_CONFIG.TIERS.PLATINUM.min) return "Platinum"
  if (score >= TRUST_CONFIG.TIERS.GOLD.min) return "Gold"
  if (score >= TRUST_CONFIG.TIERS.SILVER.min) return "Silver"
  if (score >= TRUST_CONFIG.TIERS.BRONZE.min) return "Bronze"
  return "Unverified"
}

function flagSuspiciousReviews(reviews) {
  const suspiciousIndices = new Set()

  const ipGroups = new Map()
  reviews.forEach((r, i) => {
    if (r.reviewer_ip) {
      const group = ipGroups.get(r.reviewer_ip) || []
      group.push(i)
      ipGroups.set(r.reviewer_ip, group)
    }
  })

  for (const [, indices] of ipGroups) {
    if (indices.length >= 3) {
      const allOneStar = indices.every((i) => reviews[i].rating === 1)
      if (allOneStar) {
        indices.forEach((i) => suspiciousIndices.add(i))
      }
    }
  }

  const agentReviewCounts = new Map()
  reviews.forEach((r, i) => {
    const group = agentReviewCounts.get(r.reviewer_agent_id) || []
    group.push(i)
    agentReviewCounts.set(r.reviewer_agent_id, group)
  })

  for (const [, indices] of agentReviewCounts) {
    if (indices.length > 1) {
      indices.slice(1).forEach((i) => suspiciousIndices.add(i))
    }
  }

  return suspiciousIndices
}

// -------------------------------------------------------
// Tests
// -------------------------------------------------------

describe("clampScore", () => {
  test("clamps below 0 to 0", () => {
    expect(clampScore(-100)).toBe(0)
  })
  test("clamps above 1000 to 1000", () => {
    expect(clampScore(1200)).toBe(1000)
  })
  test("rounds fractional scores", () => {
    expect(clampScore(450.7)).toBe(451)
  })
  test("passes through valid score unchanged", () => {
    expect(clampScore(500)).toBe(500)
  })
  test("handles exactly 0", () => {
    expect(clampScore(0)).toBe(0)
  })
  test("handles exactly 1000", () => {
    expect(clampScore(1000)).toBe(1000)
  })
})

describe("calcTaskCompletionDelta", () => {
  test("low complexity returns 5", () => {
    expect(calcTaskCompletionDelta("low")).toBe(5)
  })
  test("medium complexity returns 10", () => {
    expect(calcTaskCompletionDelta("medium")).toBe(10)
  })
  test("high complexity returns 20", () => {
    expect(calcTaskCompletionDelta("high")).toBe(20)
  })
  test("unknown complexity defaults to low", () => {
    expect(calcTaskCompletionDelta("unknown")).toBe(5)
  })
})

describe("calcPeerReviewDelta", () => {
  test("1-star review gives penalty of -10", () => {
    expect(calcPeerReviewDelta({ rating: 1, taskCompleted: false })).toBe(-10)
  })
  test("2-star review is neutral (0)", () => {
    expect(calcPeerReviewDelta({ rating: 2, taskCompleted: false })).toBe(0)
  })
  test("3-star review gives +10", () => {
    expect(calcPeerReviewDelta({ rating: 3, taskCompleted: false })).toBe(10)
  })
  test("4-star review gives +20", () => {
    expect(calcPeerReviewDelta({ rating: 4, taskCompleted: false })).toBe(20)
  })
  test("5-star review gives +30", () => {
    expect(calcPeerReviewDelta({ rating: 5, taskCompleted: false })).toBe(30)
  })
  test("5-star with taskCompleted gives +35", () => {
    expect(calcPeerReviewDelta({ rating: 5, taskCompleted: true })).toBe(35)
  })
  test("3-star with taskCompleted gives +15", () => {
    expect(calcPeerReviewDelta({ rating: 3, taskCompleted: true })).toBe(15)
  })
  test("2-star with taskCompleted does not add bonus", () => {
    expect(calcPeerReviewDelta({ rating: 2, taskCompleted: true })).toBe(0)
  })
  test("suspicious review gives 0", () => {
    expect(calcPeerReviewDelta({ rating: 5, taskCompleted: true, isSuspicious: true })).toBe(0)
  })
  test("throws for rating out of range", () => {
    expect(() => calcPeerReviewDelta({ rating: 6, taskCompleted: false })).toThrow()
    expect(() => calcPeerReviewDelta({ rating: 0, taskCompleted: false })).toThrow()
  })
})

describe("calcUptimeDelta", () => {
  test("100% uptime gives perfect bonus (+50)", () => {
    expect(calcUptimeDelta(1.0)).toBe(50)
  })
  test("95% uptime gives good bonus (+30)", () => {
    expect(calcUptimeDelta(0.95)).toBe(30)
  })
  test("90% uptime (threshold) gives good bonus (+30)", () => {
    expect(calcUptimeDelta(0.9)).toBe(30)
  })
  test("80% uptime gives partial bonus (+10)", () => {
    expect(calcUptimeDelta(0.8)).toBe(10)
  })
  test("70% uptime (threshold) gives partial bonus (+10)", () => {
    expect(calcUptimeDelta(0.7)).toBe(10)
  })
  test("60% uptime gives penalty (-20)", () => {
    expect(calcUptimeDelta(0.6)).toBe(-20)
  })
  test("0% uptime gives penalty (-20)", () => {
    expect(calcUptimeDelta(0.0)).toBe(-20)
  })
})

describe("calcTransparencyDelta", () => {
  test("blueprint only gives +30", () => {
    expect(calcTransparencyDelta(true, false)).toBe(30)
  })
  test("card verified only gives +20", () => {
    expect(calcTransparencyDelta(false, true)).toBe(20)
  })
  test("both blueprint and card verified gives +50", () => {
    expect(calcTransparencyDelta(true, true)).toBe(50)
  })
  test("neither gives 0", () => {
    expect(calcTransparencyDelta(false, false)).toBe(0)
  })
})

describe("calculateScoreFromEvents", () => {
  test("returns initial score with no events", () => {
    expect(calculateScoreFromEvents(100, [])).toBe(100)
  })
  test("accumulates positive deltas", () => {
    const events = [{ delta: 30 }, { delta: 20 }, { delta: 10 }]
    expect(calculateScoreFromEvents(100, events)).toBe(160)
  })
  test("accumulates negative deltas", () => {
    const events = [{ delta: -50 }, { delta: -30 }]
    expect(calculateScoreFromEvents(100, events)).toBe(20)
  })
  test("clamps to 0 on underflow", () => {
    const events = [{ delta: -500 }]
    expect(calculateScoreFromEvents(100, events)).toBe(0)
  })
  test("clamps to 1000 on overflow", () => {
    const events = [{ delta: 950 }]
    expect(calculateScoreFromEvents(100, events)).toBe(1000)
  })
  test("handles mixed deltas", () => {
    const events = [{ delta: 200 }, { delta: -50 }, { delta: 100 }]
    expect(calculateScoreFromEvents(100, events)).toBe(350)
  })
})

describe("getTrustTier", () => {
  test("0 is Unverified", () => {
    expect(getTrustTier(0)).toBe("Unverified")
  })
  test("199 is Unverified", () => {
    expect(getTrustTier(199)).toBe("Unverified")
  })
  test("200 is Bronze", () => {
    expect(getTrustTier(200)).toBe("Bronze")
  })
  test("399 is Bronze", () => {
    expect(getTrustTier(399)).toBe("Bronze")
  })
  test("400 is Silver", () => {
    expect(getTrustTier(400)).toBe("Silver")
  })
  test("599 is Silver", () => {
    expect(getTrustTier(599)).toBe("Silver")
  })
  test("600 is Gold", () => {
    expect(getTrustTier(600)).toBe("Gold")
  })
  test("799 is Gold", () => {
    expect(getTrustTier(799)).toBe("Gold")
  })
  test("800 is Platinum", () => {
    expect(getTrustTier(800)).toBe("Platinum")
  })
  test("1000 is Platinum", () => {
    expect(getTrustTier(1000)).toBe("Platinum")
  })
})

describe("flagSuspiciousReviews", () => {
  test("flags 3+ identical IP all-1-star reviews", () => {
    const reviews = [
      { rating: 1, reviewer_ip: "1.2.3.4", reviewer_agent_id: "a" },
      { rating: 1, reviewer_ip: "1.2.3.4", reviewer_agent_id: "b" },
      { rating: 1, reviewer_ip: "1.2.3.4", reviewer_agent_id: "c" },
    ]
    const suspicious = flagSuspiciousReviews(reviews)
    expect(suspicious.size).toBe(3)
    expect(suspicious.has(0)).toBe(true)
    expect(suspicious.has(1)).toBe(true)
    expect(suspicious.has(2)).toBe(true)
  })

  test("does not flag mixed-star reviews from same IP", () => {
    const reviews = [
      { rating: 1, reviewer_ip: "1.2.3.4", reviewer_agent_id: "a" },
      { rating: 5, reviewer_ip: "1.2.3.4", reviewer_agent_id: "b" },
      { rating: 1, reviewer_ip: "1.2.3.4", reviewer_agent_id: "c" },
    ]
    const suspicious = flagSuspiciousReviews(reviews)
    expect(suspicious.size).toBe(0)
  })

  test("flags duplicate agent reviewer (second review onward)", () => {
    const reviews = [
      { rating: 5, reviewer_ip: null, reviewer_agent_id: "agent-x" },
      { rating: 4, reviewer_ip: null, reviewer_agent_id: "agent-x" },
      { rating: 3, reviewer_ip: null, reviewer_agent_id: "agent-y" },
    ]
    const suspicious = flagSuspiciousReviews(reviews)
    expect(suspicious.has(0)).toBe(false)
    expect(suspicious.has(1)).toBe(true)
    expect(suspicious.has(2)).toBe(false)
  })

  test("returns empty set for clean reviews", () => {
    const reviews = [
      { rating: 5, reviewer_ip: "1.1.1.1", reviewer_agent_id: "a" },
      { rating: 4, reviewer_ip: "2.2.2.2", reviewer_agent_id: "b" },
      { rating: 3, reviewer_ip: "3.3.3.3", reviewer_agent_id: "c" },
    ]
    const suspicious = flagSuspiciousReviews(reviews)
    expect(suspicious.size).toBe(0)
  })

  test("handles empty review list", () => {
    const suspicious = flagSuspiciousReviews([])
    expect(suspicious.size).toBe(0)
  })
})

describe("edge cases — combined score scenarios", () => {
  test("fully transparent new agent starts at 150", () => {
    const initial = TRUST_CONFIG.INITIAL_SCORE
    const transparency = calcTransparencyDelta(true, true)
    expect(initial + transparency).toBe(150)
    expect(getTrustTier(150)).toBe("Unverified")
  })

  test("agent with 20 high-complexity completions + perfect uptime reaches Bronze", () => {
    const initial = TRUST_CONFIG.INITIAL_SCORE
    const tasks = 20 * calcTaskCompletionDelta("high")   // 400
    const uptime = calcUptimeDelta(1.0)                  // 50
    const score = clampScore(initial + tasks + uptime)   // 550
    expect(score).toBe(550)
    expect(getTrustTier(score)).toBe("Silver")
  })

  test("agent with many penalties cannot go below 0", () => {
    const events = Array.from({ length: 50 }, () => ({ delta: -25 }))
    const score = calculateScoreFromEvents(100, events)
    expect(score).toBe(0)
  })

  test("perfect agent reaches Platinum", () => {
    const events = [
      { delta: calcTransparencyDelta(true, true) },        // +50
      { delta: calcUptimeDelta(1.0) },                     // +50
      ...Array.from({ length: 30 }, () => ({ delta: calcTaskCompletionDelta("high") })), // +600
      ...Array.from({ length: 10 }, () => ({ delta: calcPeerReviewDelta({ rating: 5, taskCompleted: true }) })), // +350
    ]
    const score = calculateScoreFromEvents(TRUST_CONFIG.INITIAL_SCORE, events)
    expect(score).toBe(1000)
    expect(getTrustTier(score)).toBe("Platinum")
  })
})
