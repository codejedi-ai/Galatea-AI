-- =============================================================
-- Galatea AI — Agent Identity Layer
-- Migration 002: agent identity columns, DID, attestation
-- =============================================================

-- -------------------------------------------------------
-- Add identity columns to agents table
-- -------------------------------------------------------

-- Deterministic DID-style agentId derived from (name + publicKey + framework)
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS agent_id text UNIQUE;

-- Base64-encoded public key (Ed25519 or RSA-2048)
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS public_key text;

-- Self-signed attestation JSON blob
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS attestation jsonb;

-- Framework enum: LangChain, AutoGen, CrewAI, Custom
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS framework text NOT NULL DEFAULT 'Custom';

-- Structured capabilities (supersedes the text[] capabilities column)
-- Stored as JSONB array of {name, description?, category?} objects
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS capabilities_structured jsonb NOT NULL DEFAULT '[]';

-- -------------------------------------------------------
-- Indexes for fast lookups
-- -------------------------------------------------------

-- Fast lookup by agentId (used in GET /api/agents/:agentId/card)
CREATE UNIQUE INDEX IF NOT EXISTS agents_agent_id_idx ON agents (agent_id)
  WHERE agent_id IS NOT NULL;

-- Fast lookup by framework (used in matching / filtering)
CREATE INDEX IF NOT EXISTS agents_framework_idx ON agents (framework);

-- -------------------------------------------------------
-- Backfill: set framework from architecture_type for existing rows
-- -------------------------------------------------------
UPDATE agents
SET framework = CASE
  WHEN architecture_type IN ('LangChain', 'AutoGen', 'CrewAI', 'Custom') THEN architecture_type
  ELSE 'Custom'
END
WHERE framework = 'Custom' OR framework IS NULL;
