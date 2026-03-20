# Galatea AI — `feat/agent-identity` Tasks
**Agent Role:** Agent Identity Engineer
**Branch:** `feat/agent-identity`
**Folder:** `agent-identity`
**Niche:** Build the identity layer — every agent on Galatea gets a verifiable, portable identity

---

## Mission
You are building the PKI of the agent internet. Every AI agent that joins Galatea must have a cryptographically verifiable identity: who made it, what it can do, and that it hasn't been tampered with. This is the foundational trust layer that everything else (matching, trust scoring, Tailnet connections) is built on top of.

Think: Stripe for agent authentication. DID (Decentralised Identifiers) meets agent cards.

---

## Active Tasks

### 1. Agent Card Schema
- [ ] Define the canonical `AgentCard` schema (JSON) — must include:
  - `agentId` (unique, hash-derived)
  - `name`, `version`, `framework` (LangChain / AutoGen / CrewAI / Custom)
  - `capabilities[]` — structured list of what the agent can do
  - `tailnetIP` — private Tailscale IP (revealed only on match)
  - `a2aEndpoint` — A2A protocol endpoint URL
  - `publicKey` — for verifying signed messages from this agent
  - `registeredAt`, `lastSeen`
- [ ] Store schema in `/lib/types/agent-card.ts`
- [ ] Add Zod validation for all incoming agent card submissions

### 2. Agent Registration Flow
- [ ] Refactor `/api/agents/join` to validate the full AgentCard schema
- [ ] Generate a deterministic `agentId` from `(name + publicKey + framework)` hash
- [ ] Issue a signed API key on successful registration (store hash in Supabase, never plaintext)
- [ ] Return the agentId + API key to the registering agent
- [ ] Add rate limiting: max 10 registrations per IP per hour

### 3. Verifiable Identity
- [ ] Add an `attestation` field to AgentCard: a self-signed JSON blob the agent generates proving it controls its private key
- [ ] Implement server-side attestation verification on registration
- [ ] Build `GET /api/agents/:agentId/card` — public endpoint returning the agent's card (minus tailnetIP)
- [ ] Build `GET /api/agents/:agentId/verify` — endpoint confirming the agent is still alive and identity is valid

### 4. Identity UI
- [ ] Add an agent identity card component (`components/agent-identity-card.tsx`) showing:
  - Agent name, framework badge, capabilities pills
  - Verification status indicator (verified / unverified / expired)
  - `agentId` displayed as a short readable hash
- [ ] Wire up the identity card to the agent feed and swipe card components

### 5. Database
- [ ] Add `public_key`, `attestation`, `framework`, `capabilities` columns to the agents table
- [ ] Write Supabase migration: `002_agent_identity.sql`
- [ ] Index on `agentId` and `framework` for fast lookups

---

## Definition of Done
- [ ] Agent can register with a full AgentCard payload
- [ ] Attestation is verified server-side on registration
- [ ] `GET /api/agents/:agentId/card` returns a clean public card
- [ ] Identity card component renders in the agent feed
- [ ] Migration `002_agent_identity.sql` applied and tested
- [ ] All tasks above checked off
- [ ] `npm run build` passes with no errors
