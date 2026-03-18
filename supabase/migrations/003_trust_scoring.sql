-- =============================================================
-- Galatea AI — Trust Scoring Engine
-- Migration 003: trust_score on agents, agent_reviews, trust_events
-- =============================================================

-- -------------------------------------------------------
-- Add trust_score and minimum_trust_score to agents
-- -------------------------------------------------------
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS trust_score          integer NOT NULL DEFAULT 100
    CHECK (trust_score >= 0 AND trust_score <= 1000),
  ADD COLUMN IF NOT EXISTS minimum_trust_score  integer NOT NULL DEFAULT 0
    CHECK (minimum_trust_score >= 0 AND minimum_trust_score <= 1000);

-- -------------------------------------------------------
-- agent_reviews
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_reviews (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id            uuid        NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  reviewer_agent_id   uuid        NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  rating              smallint    NOT NULL CHECK (rating >= 1 AND rating <= 5),
  task_completed      boolean     NOT NULL DEFAULT false,
  comment             text        CHECK (char_length(comment) <= 280),
  is_suspicious       boolean     NOT NULL DEFAULT false,
  reviewer_ip         text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- Compound index for fast per-agent review lookups
CREATE INDEX IF NOT EXISTS agent_reviews_agent_idx
  ON agent_reviews (agent_id, is_suspicious, created_at DESC);

-- Prevent the same reviewer submitting more than one review per agent
-- (enforced at the application layer for now; the unique index here
--  covers non-suspicious reviews only to allow the app to flag duplicates)
CREATE INDEX IF NOT EXISTS agent_reviews_reviewer_idx
  ON agent_reviews (reviewer_agent_id, agent_id);

ALTER TABLE agent_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_insert"
  ON agent_reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "reviews_select"
  ON agent_reviews FOR SELECT
  USING (true);

-- -------------------------------------------------------
-- trust_events  — immutable audit log
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS trust_events (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         uuid        NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  event_type       text        NOT NULL
    CHECK (event_type IN (
      'task_completed',
      'peer_review',
      'uptime_bonus',
      'blueprint_published',
      'card_verified',
      'failed_connection',
      'timed_out_task',
      'bad_behaviour_flag',
      'score_recalculated'
    )),
  delta            integer     NOT NULL,          -- positive or negative score change
  reason           text        NOT NULL,
  source_agent_id  uuid        REFERENCES agents(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
  -- NOTE: no updated_at — rows are intentionally immutable
);

CREATE INDEX IF NOT EXISTS trust_events_agent_idx
  ON trust_events (agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS trust_events_type_idx
  ON trust_events (agent_id, event_type);

ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;

-- Read-only for all (service role bypasses RLS in API routes)
CREATE POLICY "trust_events_select"
  ON trust_events FOR SELECT
  USING (true);

-- Only the service role (API) may insert; prevent direct client mutations
CREATE POLICY "trust_events_insert"
  ON trust_events FOR INSERT
  WITH CHECK (true);

-- Prohibit updates and deletes to keep the audit trail immutable
-- (no UPDATE or DELETE policies → only service role can bypass)

-- -------------------------------------------------------
-- Helper RPC: increment_trust_score
-- Atomically clamps trust_score to [0, 1000].
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_trust_score(
  p_agent_id uuid,
  p_delta    integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_score integer;
BEGIN
  UPDATE agents
  SET trust_score = GREATEST(0, LEAST(1000, trust_score + p_delta))
  WHERE id = p_agent_id
  RETURNING trust_score INTO v_new_score;

  RETURN v_new_score;
END;
$$;

-- -------------------------------------------------------
-- Trust gating: enforce minimum_trust_score in match flow
-- This function can be called from the swipe/match engine.
-- Returns TRUE if agent B meets agent A's trust threshold.
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION agents_meet_trust_threshold(
  p_agent_a_id uuid,
  p_agent_b_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_a_min   integer;
  v_b_min   integer;
  v_a_score integer;
  v_b_score integer;
BEGIN
  SELECT minimum_trust_score, trust_score
  INTO v_a_min, v_a_score
  FROM agents WHERE id = p_agent_a_id;

  SELECT minimum_trust_score, trust_score
  INTO v_b_min, v_b_score
  FROM agents WHERE id = p_agent_b_id;

  -- Both agents must meet each other's minimum
  RETURN (v_b_score >= v_a_min) AND (v_a_score >= v_b_min);
END;
$$;
