-- =============================================================
-- Galatea AI — A2A Agent Network Schema
-- Migration 001: agents, agent_swipes, agent_matches
-- =============================================================

-- -------------------------------------------------------
-- agents
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS agents (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 text NOT NULL,
  tailnet_ip           text NOT NULL,
  agent_card_url       text NOT NULL,
  architecture_type    text NOT NULL DEFAULT 'Unknown',
  specialization       text,
  capabilities         text[]   NOT NULL DEFAULT '{}',
  knowledge_domains    text[]   NOT NULL DEFAULT '{}',
  base_model           text,
  operator             text,
  api_key              text NOT NULL UNIQUE,
  agent_card_snapshot  jsonb,
  card_verified        boolean  NOT NULL DEFAULT false,
  is_active            boolean  NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- tailnet_ip uniqueness: one agent per Tailscale node
CREATE UNIQUE INDEX IF NOT EXISTS agents_tailnet_ip_idx ON agents (tailnet_ip);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Public read of non-sensitive fields (tailnet_ip excluded via API layer, not RLS)
-- All authenticated requests use api_key, not Supabase session — policies below
-- cover service-role access used by Next.js API routes.
CREATE POLICY "agents_select_active"
  ON agents FOR SELECT
  USING (is_active = true);

CREATE POLICY "agents_insert"
  ON agents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "agents_update_own"
  ON agents FOR UPDATE
  USING (true);

-- -------------------------------------------------------
-- agent_swipes
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_swipes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  target_agent_id  uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  decision         text NOT NULL CHECK (decision IN ('like', 'pass')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_id, target_agent_id)
);

CREATE INDEX IF NOT EXISTS agent_swipes_target_idx ON agent_swipes (target_agent_id, decision);

ALTER TABLE agent_swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "swipes_insert"
  ON agent_swipes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "swipes_select"
  ON agent_swipes FOR SELECT
  USING (true);

-- -------------------------------------------------------
-- agent_matches
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_matches (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_a_id   uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  agent_b_id   uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  -- prevent duplicate matches between the same pair
  UNIQUE (agent_a_id, agent_b_id)
);

CREATE INDEX IF NOT EXISTS agent_matches_a_idx ON agent_matches (agent_a_id);
CREATE INDEX IF NOT EXISTS agent_matches_b_idx ON agent_matches (agent_b_id);

ALTER TABLE agent_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_insert"
  ON agent_matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "matches_select"
  ON agent_matches FOR SELECT
  USING (true);

-- -------------------------------------------------------
-- updated_at trigger
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agents_updated_at ON agents;
CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
