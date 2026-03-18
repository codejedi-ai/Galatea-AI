// Galatea AI — Match Quality Scoring
// Produces a 0–100 matchScore for a pair of agents based on four signals:
//   1. Semantic similarity of capabilities (via embeddings / fallback)
//   2. Complementarity score (different categories = higher score)
//   3. Trust score compatibility
//   4. Architecture compatibility

import { categoriesForIds, ALL_CAPABILITIES, type CapabilityCategory } from "./taxonomy"
import { cosineSimilarity, fallbackSimilarity, type EmbeddingVector } from "./embeddings"

// ─── Agent profile shape expected by the scorer ──────────────────────────────

export interface AgentProfile {
  id: string
  capabilities: string[]
  architecture_type: string
  /** 0–100 trust score; undefined treated as 50 (neutral) */
  trustScore?: number
  /** Pre-computed embedding vector; if absent, fallback is used */
  embeddingVector?: EmbeddingVector
}

// ─── Weight configuration ─────────────────────────────────────────────────────

const WEIGHTS = {
  semanticSimilarity: 0.35,
  complementarity: 0.30,
  trustCompatibility: 0.20,
  architectureCompat: 0.15,
}

// ─── Sub-scorers (each returns 0–1) ──────────────────────────────────────────

function semanticScore(a: AgentProfile, b: AgentProfile): number {
  if (a.embeddingVector && b.embeddingVector) {
    // If both have pre-computed vectors, use cosine similarity directly.
    // Note: similar vectors → high similarity → but we want *complementarity*
    // here we still include this as a base signal; complementarity is handled separately.
    return cosineSimilarity(a.embeddingVector, b.embeddingVector)
  }
  // Fallback: text-level similarity on capability ids
  return fallbackSimilarity(a.capabilities, b.capabilities)
}

/**
 * Complementarity: agents score highly if they cover *different* capability categories.
 * A perfect score means zero overlap in categories.
 */
function complementarityScore(a: AgentProfile, b: AgentProfile): number {
  const catsA = categoriesForIds(a.capabilities)
  const catsB = categoriesForIds(b.capabilities)

  if (catsA.size === 0 || catsB.size === 0) return 0

  let overlap = 0
  for (const cat of catsA) {
    if (catsB.has(cat)) overlap++
  }

  const union = new Set([...catsA, ...catsB]).size
  // Jaccard distance = 1 - (intersection / union)
  return 1 - overlap / union
}

/**
 * Trust compatibility: agents with similar trust scores pair well.
 * Penalise large trust score deltas.
 */
function trustCompatibilityScore(a: AgentProfile, b: AgentProfile): number {
  const trustA = a.trustScore ?? 50
  const trustB = b.trustScore ?? 50
  const delta = Math.abs(trustA - trustB)
  // Linear penalty: 0 delta → 1.0; 100 delta → 0.0
  return 1 - delta / 100
}

const KNOWN_ARCHITECTURES = [
  "claude",
  "gpt",
  "gemini",
  "mistral",
  "llama",
  "falcon",
  "phi",
  "cohere",
]

/**
 * Architecture compatibility: same family = highest score.
 * Known different families = moderate score (diversity).
 * Unknown = neutral.
 */
function architectureCompatScore(a: AgentProfile, b: AgentProfile): number {
  const archA = (a.architecture_type || "").toLowerCase()
  const archB = (b.architecture_type || "").toLowerCase()

  if (archA === archB && archA !== "unknown" && archA !== "") return 1.0

  const familyA = KNOWN_ARCHITECTURES.find((f) => archA.includes(f))
  const familyB = KNOWN_ARCHITECTURES.find((f) => archB.includes(f))

  if (familyA && familyB && familyA === familyB) return 0.9
  if (familyA && familyB && familyA !== familyB) return 0.6
  return 0.5 // unknown architecture
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface MatchScoreBreakdown {
  total: number // 0–100
  semantic: number // 0–100
  complementarity: number // 0–100
  trustCompatibility: number // 0–100
  architectureCompat: number // 0–100
}

/**
 * Compute a holistic match quality score (0–100) between two agent profiles.
 * Returns both the aggregate total and individual sub-scores for transparency.
 */
export function computeMatchScore(
  a: AgentProfile,
  b: AgentProfile,
): MatchScoreBreakdown {
  const semantic = semanticScore(a, b)
  const complementarity = complementarityScore(a, b)
  const trust = trustCompatibilityScore(a, b)
  const arch = architectureCompatScore(a, b)

  const total =
    WEIGHTS.semanticSimilarity * semantic +
    WEIGHTS.complementarity * complementarity +
    WEIGHTS.trustCompatibility * trust +
    WEIGHTS.architectureCompat * arch

  return {
    total: Math.round(total * 100),
    semantic: Math.round(semantic * 100),
    complementarity: Math.round(complementarity * 100),
    trustCompatibility: Math.round(trust * 100),
    architectureCompat: Math.round(arch * 100),
  }
}

/**
 * Apply a diversity boost to a ranked list of candidates.
 * Prevents one capability category from dominating the top-N results.
 * Returns the re-ranked list.
 */
export function applyDiversityBoost<T extends { capabilities: string[]; score: number }>(
  candidates: T[],
  maxPerCategory = 4,
): T[] {
  const categoryCounts = new Map<CapabilityCategory, number>()
  const result: T[] = []
  const deferred: T[] = []

  for (const candidate of candidates) {
    const primaryCategories = categoriesForIds(candidate.capabilities)
    const dominantCategory = [...primaryCategories][0] as CapabilityCategory | undefined

    if (!dominantCategory) {
      result.push(candidate)
      continue
    }

    const count = categoryCounts.get(dominantCategory) ?? 0
    if (count < maxPerCategory) {
      categoryCounts.set(dominantCategory, count + 1)
      result.push(candidate)
    } else {
      deferred.push(candidate)
    }
  }

  // Append deferred (over-represented) candidates at the end
  return [...result, ...deferred]
}
