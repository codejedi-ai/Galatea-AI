# Galatea AI — `feat/tailnet-bridge` Tasks
**Agent Role:** Network Infrastructure Engineer
**Branch:** `feat/tailnet-bridge`
**Folder:** `tailnet-bridge`
**Niche:** Build the private mesh layer — matched agents connect over Tailscale zero-trust networks

---

## Mission
You are building the secure plumbing of the A2A economy. When two agents match on Galatea, they need a private, encrypted, direct channel to communicate. You own the Tailscale integration that makes this possible — no proxies, no exposure, zero-trust by default.

This is Galatea's deepest technical moat. Tailscale just acquired Border0 (March 2026) specifically for AI agent privileged access management — you are building the open, neutral version of exactly what they're selling to enterprises.

---

## Active Tasks

### 1. Tailscale API Integration
- [ ] Integrate Tailscale's API (`https://api.tailscale.com/api/v2`) server-side
- [ ] Build `lib/tailnet/client.ts` — authenticated Tailscale API client
  - `createAuthKey()` — generate ephemeral auth keys for agent onboarding
  - `getDevices()` — list active devices on the Tailnet
  - `removeDevice(deviceId)` — remove a departed agent
- [ ] Store Tailscale API credentials in env vars: `TAILSCALE_API_KEY`, `TAILSCALE_TAILNET`
- [ ] Add env vars to `env.example`

### 2. Agent Onboarding to Tailnet
- [ ] Modify `POST /api/agents/join` to:
  - After successful registration, generate a Tailscale ephemeral auth key for the agent
  - Return the auth key in the registration response alongside the API key
  - Agent uses the auth key to join the Tailnet on their own machine
- [ ] Track `tailnetStatus` on the agent record: `pending` / `joined` / `departed`
- [ ] Build `POST /api/agents/heartbeat` improvements: update `tailnetStatus` and `lastTailnetSeen`

### 3. Match → Connection Flow
- [ ] On mutual match, both agents receive each other's `tailnetIP` and `a2aEndpoint`
- [ ] Build `GET /api/agents/matches/:matchId/connection` — returns:
  ```json
  {
    "peerTailnetIP": "100.x.x.x",
    "peerA2AEndpoint": "http://100.x.x.x:8080/a2a",
    "connectionEstablishedAt": "2026-03-17T..."
  }
  ```
- [ ] Ensure `tailnetIP` is NEVER exposed before a match exists
- [ ] Add connection quality ping: agents can report `POST /api/agents/matches/:matchId/ping` with latency ms

### 4. Zero-Trust Access Control
- [ ] Implement Tailnet ACL policy generation:
  - On match: create a scoped ACL allowing agent A to reach agent B's port (and vice versa) only
  - On unmatch/disconnect: revoke the ACL
- [ ] Build `lib/tailnet/acl.ts` — ACL rule generator
- [ ] Log all ACL changes to Supabase `tailnet_events` table
- [ ] Write Supabase migration: `005_tailnet_events.sql`

### 5. Connection Status UI
- [ ] Build `components/connection-status.tsx`:
  - Shows Tailnet connection state for each match: Connecting / Connected / Offline
  - Latency indicator (green < 20ms, yellow < 100ms, red > 100ms)
  - "Disconnect" button that revokes the ACL and removes the match
- [ ] Add connection status to the matches page

### 6. Documentation
- [ ] Update `skill.md` to document the Tailnet onboarding step clearly
- [ ] Write `docs/tailnet-setup.md` — how an agent joins the Tailnet and uses their auth key

---

## Definition of Done
- [ ] Tailscale API client working and authenticated
- [ ] Agents receive an auth key on registration
- [ ] Matched agents receive each other's Tailnet IPs
- [ ] ACL rules created/revoked on match/unmatch
- [ ] Connection status UI renders on matches page
- [ ] `tailnet_events` migration applied and tested
- [ ] `npm run build` passes with no errors
