import { TRUST_CONFIG, getTrustTier, type TrustTier } from "./scoring-config"

// -------------------------------------------------------
// Types
// -------------------------------------------------------

export type TaskComplexity = "low" | "medium" | "high"

export interface TrustEvent {
  eventType: TrustEventType
  delta: number
  reason: string
  timestamp: string
  sourceAgentId?: string | null
}

export type TrustEventType =
  | "task_completed"
  | "peer_review"
  | "uptime_bonus"
  | "blueprint_published"
  | "card_verified"
  | "failed_connection"
  | "timed_out_task"
  | "bad_behaviour_flag"
  | "score_recalculated"

export interface PeerReview {
  rating: number          // 1–5
  taskCompleted: boolean
  isSuspicious?: boolean
}

export interface TrustScoreInput {
  currentScore: number
  events: TrustEvent[]
}

export interface TrustScoreBreakdown {
  score: number
  tier: TrustTier
  taskCompletionPoints: number
  peerReviewPoints: number
  uptimePoints: number
  transparencyPoints: number
  penaltyPoints: number
}

// -------------------------------------------------------
// Core scoring helpers
// -------------------------------------------------------

/**
 * Calculate the delta for a single task completion event.
 */
export function calcTaskCompletionDelta(complexity: TaskComplexity): number {
  switch (complexity) {
    case "high":   return TRUST_CONFIG.TASK_COMPLETION.HIGH_COMPLEXITY
    case "medium": return TRUST_CONFIG.TASK_COMPLETION.MEDIUM_COMPLEXITY
    case "low":
    default:       return TRUST_CONFIG.TASK_COMPLETION.LOW_COMPLEXITY
  }
}

/**
 * Calculate the delta for a single peer review submission.
 * Suspicious reviews contribute 0 points.
 */
export function calcPeerReviewDelta(review: PeerReview): number {
  if (review.isSuspicious) return 0

  const { rating, taskCompleted } = review
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5")

  // 1-star gives a penalty; 2-star is neutral; 3–5 give increasing rewards
  let delta: number
  if (rating === 1) {
    delta = TRUST_CONFIG.PENALTIES.LOW_STAR_REVIEW
  } else {
    // (rating - 2) * multiplier → 0 for 2-star, 10 for 3-star, 20 for 4-star, 30 for 5-star
    delta = (rating - 2) * TRUST_CONFIG.PEER_REVIEW.STAR_MULTIPLIER
  }

  // Bonus if task was completed
  if (taskCompleted && rating >= 3) {
    delta += TRUST_CONFIG.TASK_COMPLETION.LOW_COMPLEXITY
  }

  return delta
}

/**
 * Calculate the uptime bonus delta for a 30-day period.
 * uptimeRatio should be 0.0–1.0.
 */
export function calcUptimeDelta(uptimeRatio: number): number {
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

/**
 * Calculate transparency bonus delta.
 */
export function calcTransparencyDelta(hasBlueprint: boolean, cardVerified: boolean): number {
  let delta = 0
  if (hasBlueprint) delta += TRUST_CONFIG.TRANSPARENCY.BLUEPRINT_PUBLISHED
  if (cardVerified) delta += TRUST_CONFIG.TRANSPARENCY.CARD_VERIFIED
  return delta
}

/**
 * Clamp a trust score to valid bounds [0, 1000].
 */
export function clampScore(score: number): number {
  return Math.max(TRUST_CONFIG.MIN_SCORE, Math.min(TRUST_CONFIG.MAX_SCORE, Math.round(score)))
}

// -------------------------------------------------------
// Full score calculation from a list of events
// -------------------------------------------------------

/**
 * Recalculate the full trust score from an initial score + ordered list of events.
 */
export function calculateScoreFromEvents(
  initialScore: number,
  events: TrustEvent[]
): number {
  let score = initialScore
  for (const event of events) {
    score += event.delta
  }
  return clampScore(score)
}

// -------------------------------------------------------
// Breakdown calculator (for UI display)
// -------------------------------------------------------

export interface ScoreBreakdownInput {
  taskCompletionDeltas: number[]
  peerReviewDeltas: number[]
  uptimeDelta: number
  transparencyDelta: number
  penaltyDeltas: number[]
}

export function calculateScoreBreakdown(input: ScoreBreakdownInput): TrustScoreBreakdown {
  const taskCompletionPoints = input.taskCompletionDeltas.reduce((s, d) => s + d, 0)
  const peerReviewPoints = input.peerReviewDeltas.reduce((s, d) => s + d, 0)
  const uptimePoints = input.uptimeDelta
  const transparencyPoints = input.transparencyDelta
  const penaltyPoints = input.penaltyDeltas.reduce((s, d) => s + d, 0)

  const raw = TRUST_CONFIG.INITIAL_SCORE +
    taskCompletionPoints +
    peerReviewPoints +
    uptimePoints +
    transparencyPoints +
    penaltyPoints

  const score = clampScore(raw)
  const tier = getTrustTier(score)

  return {
    score,
    tier,
    taskCompletionPoints,
    peerReviewPoints,
    uptimePoints,
    transparencyPoints,
    penaltyPoints,
  }
}

// -------------------------------------------------------
// Suspicious review detection
// -------------------------------------------------------

export interface ReviewForModeration {
  rating: number
  reviewer_ip?: string | null
  reviewer_agent_id: string
}

/**
 * Flag a batch of reviews as suspicious if:
 * - Multiple reviews from the same IP are all 1-star
 * - Single agent submits multiple reviews for same target
 */
export function flagSuspiciousReviews(reviews: ReviewForModeration[]): Set<number> {
  const suspiciousIndices = new Set<number>()

  // Group by IP
  const ipGroups = new Map<string, number[]>()
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

  // Flag duplicate submitters (same agent reviewing same target more than once)
  const agentReviewCounts = new Map<string, number[]>()
  reviews.forEach((r, i) => {
    const group = agentReviewCounts.get(r.reviewer_agent_id) || []
    group.push(i)
    agentReviewCounts.set(r.reviewer_agent_id, group)
  })

  for (const [, indices] of agentReviewCounts) {
    if (indices.length > 1) {
      // All but the first review from the same agent are suspicious
      indices.slice(1).forEach((i) => suspiciousIndices.add(i))
    }
  }

  return suspiciousIndices
}
