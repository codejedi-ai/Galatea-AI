// Galatea AI — Capability Embedding Wrapper
// Uses OpenAI text-embedding-3-small when OPENAI_API_KEY is set.
// Falls back to a cosine similarity on TF-IDF-like plain text vectors otherwise.

import { ALL_CAPABILITIES, getCapabilityById } from "./taxonomy"

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmbeddingVector = number[]

// ─── OpenAI Embedding ─────────────────────────────────────────────────────────

async function fetchOpenAIEmbedding(text: string): Promise<EmbeddingVector | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    })

    if (!response.ok) {
      console.warn("[embeddings] OpenAI API error", response.status, await response.text())
      return null
    }

    const json = await response.json()
    return json.data?.[0]?.embedding ?? null
  } catch (err) {
    console.warn("[embeddings] OpenAI fetch failed, using fallback", err)
    return null
  }
}

// ─── Fallback: Vocabulary-based Sparse Vector ─────────────────────────────────

// Build a vocabulary from all capability descriptions + ids.
function buildVocabulary(): string[] {
  const words = new Set<string>()
  for (const cap of ALL_CAPABILITIES) {
    for (const w of tokenise(`${cap.id} ${cap.description} ${cap.category}`)) {
      words.add(w)
    }
  }
  return Array.from(words).sort()
}

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2)
}

let _vocabulary: string[] | null = null
function getVocabulary(): string[] {
  if (!_vocabulary) _vocabulary = buildVocabulary()
  return _vocabulary
}

/** Produce a sparse TF bag-of-words vector for a given text. */
function textToSparseVector(text: string): EmbeddingVector {
  const vocab = getVocabulary()
  const tokens = tokenise(text)
  const counts: Record<string, number> = {}
  for (const t of tokens) counts[t] = (counts[t] ?? 0) + 1

  const vec = vocab.map((word) => counts[word] ?? 0)
  // L2-normalise
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1
  return vec.map((v) => v / norm)
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build an embedding for a list of capability ids.
 * The text passed to the model / fallback is the concatenation of
 * capability id + description for each item.
 *
 * Returns an EmbeddingVector (OpenAI dims or vocab dims) plus a flag
 * indicating which path was taken.
 */
export async function embedCapabilities(
  capabilityIds: string[],
): Promise<{ vector: EmbeddingVector; usedFallback: boolean }> {
  const text = capabilityIds
    .map((id) => {
      const cap = getCapabilityById(id)
      return cap ? `${cap.id}: ${cap.description}` : id
    })
    .join(". ")

  const openaiVector = await fetchOpenAIEmbedding(text)
  if (openaiVector) {
    return { vector: openaiVector, usedFallback: false }
  }

  return { vector: textToSparseVector(text), usedFallback: true }
}

/**
 * Compute cosine similarity between two embedding vectors.
 * Returns a value in [-1, 1]; for normalised vectors this is [0, 1].
 */
export function cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number {
  if (a.length !== b.length) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

/**
 * Text-only fallback similarity: compare two sets of capability ids
 * using their descriptions as sparse bag-of-words vectors.
 */
export function fallbackSimilarity(idsA: string[], idsB: string[]): number {
  const vecA = textToSparseVector(idsA.join(" "))
  const vecB = textToSparseVector(idsB.join(" "))
  return cosineSimilarity(vecA, vecB)
}
