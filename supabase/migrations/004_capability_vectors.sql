-- =============================================================
-- Galatea AI — Migration 004: Capability Vectors & Match Score
-- =============================================================
-- Adds:
--   • pgvector extension
--   • embedding_vector column on agents (1536-dim for text-embedding-3-small)
--   • trust_score column on agents
--   • match_score column on agent_matches
-- =============================================================

-- Enable pgvector extension (requires Postgres ≥ 14 with pg_vector installed)
CREATE EXTENSION IF NOT EXISTS vector;

-- -------------------------------------------------------
-- agents: add capability embedding vector + trust score
-- -------------------------------------------------------
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS embedding_vector vector(1536),
  ADD COLUMN IF NOT EXISTS trust_score      integer NOT NULL DEFAULT 50
    CHECK (trust_score BETWEEN 0 AND 100);

-- Index for fast ANN search (ivfflat; tune lists based on row count)
CREATE INDEX IF NOT EXISTS agents_embedding_ivfflat_idx
  ON agents
  USING ivfflat (embedding_vector vector_cosine_ops)
  WITH (lists = 100);

-- -------------------------------------------------------
-- agent_matches: add match quality score
-- -------------------------------------------------------
ALTER TABLE agent_matches
  ADD COLUMN IF NOT EXISTS match_score integer
    CHECK (match_score BETWEEN 0 AND 100);

-- -------------------------------------------------------
-- Supabase RPC: nearest_agents
-- Returns up to `match_count` agents whose embedding is
-- closest (cosine) to the supplied query vector, excluding
-- the agent making the request.
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION nearest_agents(
  query_embedding vector(1536),
  exclude_id      uuid,
  match_count     int DEFAULT 10
)
RETURNS TABLE (
  id               uuid,
  name             text,
  architecture_type text,
  specialization   text,
  capabilities     text[],
  knowledge_domains text[],
  base_model       text,
  operator         text,
  card_verified    boolean,
  trust_score      integer,
  similarity       float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    a.id,
    a.name,
    a.architecture_type,
    a.specialization,
    a.capabilities,
    a.knowledge_domains,
    a.base_model,
    a.operator,
    a.card_verified,
    a.trust_score,
    1 - (a.embedding_vector <=> query_embedding) AS similarity
  FROM agents a
  WHERE a.is_active = true
    AND a.id <> exclude_id
    AND a.embedding_vector IS NOT NULL
  ORDER BY a.embedding_vector <=> query_embedding
  LIMIT match_count;
$$;
