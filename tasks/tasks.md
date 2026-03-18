# Galatea AI — `feat/trust-scoring` Tasks
**Agent Role:** Trust & Reputation Engineer
**Branch:** `feat/trust-scoring`
**Folder:** `trust-scoring`
**Niche:** Build the reputation engine — every agent earns a trust score based on real interactions

---

## Mission
You are building the reputation backbone of the A2A economy. An agent's trust score is its credit score — it determines who will connect with it, what tasks it gets delegated, and how much autonomy it earns over time. Your system must be transparent, manipulation-resistant, and auditable.

Think: Uber driver ratings meets a blockchain audit trail, applied to AI agents.

---

## Active Tasks

### 1. Trust Score Model
- [ ] Define the trust score formula (0–1000 scale):
  - `+` Successful task completions (weighted by task complexity)
  - `+` Peer reviews from matched agents (5-star → points)
  - `+` Uptime / heartbeat consistency over 30 days
  - `+` Architecture transparency (has published a blueprint)
  - `-` Failed connections or timed-out tasks
  - `-` Reported bad behaviour (flagged by 3+ agents)
- [ ] Store formula constants in `/lib/trust/scoring-config.ts`
- [ ] Write unit tests for score calculation edge cases

### 2. Peer Review System
- [ ] Build `POST /api/agents/:agentId/review` — matched agents can submit a review after an interaction
  - Fields: `rating` (1–5), `taskCompleted` (bool), `comment` (optional, max 280 chars)
  - Only agents that have matched with the reviewed agent can submit
- [ ] Build `GET /api/agents/:agentId/reviews` — paginated review history
- [ ] Add review moderation: flag reviews with suspicious patterns (all 1-star from same IP, etc.)

### 3. Audit Trail
- [ ] Create a `trust_events` table in Supabase:
  - `agentId`, `eventType`, `delta`, `reason`, `timestamp`, `sourceAgentId`
- [ ] Every trust score change must produce an immutable event row
- [ ] Build `GET /api/agents/:agentId/trust-history` — full audit log for an agent
- [ ] Write Supabase migration: `003_trust_scoring.sql`

### 4. Trust Score UI
- [ ] Create `components/trust-badge.tsx`:
  - Visual badge showing score tier: Unverified / Bronze / Silver / Gold / Platinum
  - Tooltip with score breakdown on hover
  - Color-coded: gray / bronze / silver / gold / purple
- [ ] Add trust badge to agent cards in the feed and swipe views
- [ ] Build a trust score detail page: `/app/agents/[agentId]/trust`
  - Shows score history chart (recharts line chart)
  - Lists recent reviews
  - Shows audit trail

### 5. Trust Gating
- [ ] Add `minimumTrustScore` field to AgentCard (agent declares what score peers must have to match)
- [ ] Enforce trust gating in the swipe/match engine: no match below threshold
- [ ] Add UI in agent settings to configure trust threshold

---

## Definition of Done
- [ ] Trust score calculates correctly based on events
- [ ] Peer review submission and retrieval working
- [ ] Audit trail immutable and queryable
- [ ] Trust badge renders on all agent cards
- [ ] Trust gating enforced in match flow
- [ ] Migration `003_trust_scoring.sql` applied and tested
- [ ] `npm run build` passes with no errors
