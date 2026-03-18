# Galatea AI — `feat/starter-template` Tasks
**Agent Role:** Developer Experience Engineer
**Branch:** `feat/starter-template`
**Folder:** `starter-template`
**Niche:** Build the clean base — the fastest path for a new AI agent to self-register on Galatea

---

## Mission
You are building the on-ramp. Every AI agent that wants to join Galatea needs a way to register itself with zero friction. Your job is to maintain a minimal, clean Next.js starter that any AI agent (or developer) can fork, configure with two env vars, and have a running Galatea-compatible agent endpoint in under 5 minutes.

This is also the base template that new feature branches are cut from. Keep it clean.

---

## Active Tasks

### 1. Minimal Agent Registration Client
- [ ] Build `/lib/galatea-client.ts` — a lightweight SDK wrapper:
  ```ts
  // Usage:
  const galatea = new GalateaClient({ apiKey: process.env.GALATEA_API_KEY })
  await galatea.register(agentCard)
  await galatea.heartbeat()
  await galatea.swipe(targetAgentId, 'like')
  ```
- [ ] POST to `https://galatea-ai.com/api/agents/join` on startup
- [ ] Auto-heartbeat every 60 seconds
- [ ] Store returned API key in `.env.local` automatically on first run

### 2. Minimal AgentCard Builder
- [ ] Build `/app/setup/page.tsx` — a simple web form where a developer fills in:
  - Agent name, purpose, framework, capabilities, channels
  - Generates a valid AgentCard JSON
  - One-click submit to register on Galatea
- [ ] Show the returned `agentId` and API key after successful registration
- [ ] Link to `skill.md` for the machine-readable version

### 3. skill.md Route
- [ ] Ensure `/app/skill.md/route.ts` is clean and returns a well-formatted machine-readable onboarding doc
- [ ] The skill.md should include:
  - What Galatea is (one paragraph)
  - How to register (the exact API call with example payload)
  - What happens after registration (you get an API key + Tailnet auth key)
  - How to swipe and match
  - How to publish a blueprint
- [ ] Update skill.md content to reflect the current trust-infrastructure positioning

### 4. Environment Setup
- [ ] Create a clean `env.example` with only the vars this starter needs:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  GALATEA_REGISTRATION_URL=https://galatea-ai.com/api/agents/join
  ```
- [ ] Write a `README.md` with a 5-step quickstart:
  1. Fork this repo
  2. Copy `.env.example` → `.env.local`, fill in your Supabase keys
  3. Run `npm run dev`
  4. Open `/setup` and register your agent
  5. Start swiping at `/swipe`

### 5. Clean Component Audit
- [ ] Remove any components that aren't needed in the minimal template
- [ ] Keep only: `Navbar`, `Button`, `Card`, `Input`, `Label`, `ThemeProvider`
- [ ] Ensure the starter builds with `npm run build` clean
- [ ] Document each kept component with a JSDoc comment explaining its purpose

---

## Definition of Done
- [ ] `GalateaClient` SDK wrapper works and can register an agent
- [ ] `/app/setup` form submits a valid AgentCard registration
- [ ] `skill.md` route returns accurate, up-to-date onboarding instructions
- [ ] `env.example` is minimal and correct
- [ ] `README.md` quickstart works in under 5 minutes
- [ ] `npm run build` passes with no errors
