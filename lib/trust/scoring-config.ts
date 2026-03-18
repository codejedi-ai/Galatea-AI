// Trust Score Configuration
// Formula constants for the trust scoring engine (0–1000 scale)

export const TRUST_CONFIG = {
  // Score bounds
  MIN_SCORE: 0,
  MAX_SCORE: 1000,

  // Starting score for new agents
  INITIAL_SCORE: 100,

  // Task completion rewards (weighted by complexity)
  TASK_COMPLETION: {
    LOW_COMPLEXITY: 5,
    MEDIUM_COMPLEXITY: 10,
    HIGH_COMPLEXITY: 20,
  },

  // Peer review rewards (5-star → points mapping)
  PEER_REVIEW: {
    STAR_MULTIPLIER: 10, // 5 stars = +50 points
    REVIEW_BASE: -20,    // offset: each star above 2 adds value
    // Effective: Math.max(0, (rating - 2) * STAR_MULTIPLIER)
    // 1 star → -10 (penalty below)
    // 2 star → 0
    // 3 star → 10
    // 4 star → 20
    // 5 star → 30
  },

  // Uptime / heartbeat consistency bonus (per 30-day period)
  UPTIME: {
    PERFECT_UPTIME_BONUS: 50,       // 100% heartbeat consistency
    GOOD_UPTIME_BONUS: 30,          // ≥90% heartbeat consistency
    PARTIAL_UPTIME_BONUS: 10,       // ≥70% heartbeat consistency
    POOR_UPTIME_PENALTY: -20,       // <70% heartbeat consistency
    UPTIME_GOOD_THRESHOLD: 0.9,
    UPTIME_PARTIAL_THRESHOLD: 0.7,
  },

  // Architecture transparency bonus
  TRANSPARENCY: {
    BLUEPRINT_PUBLISHED: 30,        // agent has published a blueprint
    CARD_VERIFIED: 20,              // agent card is verified
  },

  // Negative events
  PENALTIES: {
    FAILED_CONNECTION: -5,
    TIMED_OUT_TASK: -8,
    BAD_BEHAVIOUR_FLAG: -25,        // per flag
    BAD_BEHAVIOUR_THRESHOLD: 3,    // number of flags needed to apply penalty
    LOW_STAR_REVIEW: -10,           // 1-star review penalty
    SUSPICIOUS_REVIEW_IGNORED: 0,  // flagged reviews do not count
  },

  // Tier thresholds
  TIERS: {
    UNVERIFIED: { min: 0, max: 199, label: "Unverified", color: "gray" },
    BRONZE: { min: 200, max: 399, label: "Bronze", color: "bronze" },
    SILVER: { min: 400, max: 599, label: "Silver", color: "silver" },
    GOLD: { min: 600, max: 799, label: "Gold", color: "gold" },
    PLATINUM: { min: 800, max: 1000, label: "Platinum", color: "purple" },
  },
} as const

export type TrustTier = "Unverified" | "Bronze" | "Silver" | "Gold" | "Platinum"

export function getTrustTier(score: number): TrustTier {
  if (score >= TRUST_CONFIG.TIERS.PLATINUM.min) return "Platinum"
  if (score >= TRUST_CONFIG.TIERS.GOLD.min) return "Gold"
  if (score >= TRUST_CONFIG.TIERS.SILVER.min) return "Silver"
  if (score >= TRUST_CONFIG.TIERS.BRONZE.min) return "Bronze"
  return "Unverified"
}

export function getTierColor(tier: TrustTier): string {
  const colorMap: Record<TrustTier, string> = {
    Unverified: "gray",
    Bronze: "bronze",
    Silver: "silver",
    Gold: "gold",
    Platinum: "purple",
  }
  return colorMap[tier]
}
