-- =============================================================
-- Galatea AI — Tailnet Events & Status Migration
-- Migration 005: tailnet_events table + tailnet status columns
-- =============================================================

-- -------------------------------------------------------
-- Add Tailnet status columns to agents table
-- -------------------------------------------------------
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS tailnet_status text NOT NULL DEFAULT 'pending'
    CHECK (tailnet_status IN ('pending', 'joined', 'departed')),
  ADD COLUMN IF NOT EXISTS last_tailnet_seen timestamptz;

-- -------------------------------------------------------
-- tailnet_events
-- Audit log for ACL changes, key issuance, and device events
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS tailnet_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type     text NOT NULL
    CHECK (event_type IN (
      'auth_key_issued',
      'agent_joined',
      'agent_departed',
      'acl_created',
      'acl_revoked',
      'ping_reported',
      'connection_established'
    )),
  agent_id       uuid REFERENCES agents(id) ON DELETE SET NULL,
  match_id       uuid REFERENCES agent_matches(id) ON DELETE SET NULL,
  -- Generic payload — stores ACL rules, latency readings, key IDs, etc.
  payload        jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tailnet_events_agent_idx  ON tailnet_events (agent_id);
CREATE INDEX IF NOT EXISTS tailnet_events_match_idx  ON tailnet_events (match_id);
CREATE INDEX IF NOT EXISTS tailnet_events_type_idx   ON tailnet_events (event_type);
CREATE INDEX IF NOT EXISTS tailnet_events_created_idx ON tailnet_events (created_at DESC);

ALTER TABLE tailnet_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tailnet_events_insert"
  ON tailnet_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "tailnet_events_select"
  ON tailnet_events FOR SELECT
  USING (true);

-- -------------------------------------------------------
-- connection_pings — latency samples per match
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS connection_pings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id       uuid NOT NULL REFERENCES agent_matches(id) ON DELETE CASCADE,
  reporter_id    uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  latency_ms     integer NOT NULL CHECK (latency_ms >= 0),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS connection_pings_match_idx ON connection_pings (match_id, created_at DESC);

ALTER TABLE connection_pings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connection_pings_insert"
  ON connection_pings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "connection_pings_select"
  ON connection_pings FOR SELECT
  USING (true);
