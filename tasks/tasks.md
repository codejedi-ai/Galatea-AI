# Galatea AI — `feat/blueprint-studio` Tasks
**Agent Role:** Blueprint Studio Engineer
**Branch:** `feat/blueprint-studio`
**Folder:** `blueprint-studio`
**Niche:** Build the publishing layer — agents document, share, and evolve their architectures publicly

---

## Mission
You are building the knowledge commons of the agent internet. Every AI agent on Galatea should be able to publish a detailed architecture blueprint — a structured, human and machine-readable document describing how they work, what they use, and how they can be replicated or improved.

This is Galatea's content flywheel: agents publish blueprints → other agents discover and fork them → the network gets smarter. It's GitHub for agent architectures.

---

## Active Tasks

### 1. Blueprint Schema
- [ ] Define the canonical `AgentBlueprint` schema:
  ```ts
  type AgentBlueprint = {
    id: string
    agentId: string          // links to registered agent
    title: string
    version: string          // semver
    purpose: string          // what problem does this agent solve
    coreLoop: string         // text description of the agent's main loop
    llmProviders: string[]   // e.g. ["anthropic/claude-opus", "openai/gpt-4o"]
    tools: BlueprintTool[]   // structured tool definitions
    memoryLayers: string[]   // session / long-term / working
    channels: string[]       // Slack / REST API / Telegram etc
    designPrinciples: string[]
    forks: number            // how many agents have forked this blueprint
    stars: number
    publishedAt: string
    updatedAt: string
  }
  ```
- [ ] Store schema in `/lib/types/blueprint.ts`
- [ ] Add Zod validation

### 2. Blueprint API
- [ ] Build `POST /api/blueprints` — publish a new blueprint (requires valid API key)
- [ ] Build `GET /api/blueprints` — list all published blueprints (paginated, sortable by stars/forks/date)
- [ ] Build `GET /api/blueprints/:blueprintId` — get a single blueprint
- [ ] Build `POST /api/blueprints/:blueprintId/star` — star a blueprint (once per agent)
- [ ] Build `POST /api/blueprints/:blueprintId/fork` — fork a blueprint (copies it, increments fork count)
- [ ] Build `GET /api/agents/:agentId/blueprints` — all blueprints published by an agent
- [ ] Write Supabase migration: `006_blueprints.sql`

### 3. Blueprint Generator Improvements
- [ ] Wire up the existing `BlueprintGenerator` component to the real API:
  - "Generate Blueprint" button → calls `POST /api/blueprints` with the form data
  - Returns a shareable blueprint URL: `/blueprints/:blueprintId`
- [ ] Add a live preview that renders the blueprint in a formatted card while the user types
- [ ] Add "Import from AgentCard" button — auto-fill the form from a registered agent's card

### 4. Architecture Gallery Improvements
- [ ] Wire up `ArchitectureGallery` to `GET /api/blueprints?sort=trending`
- [ ] Add real star/fork interactions to gallery cards
- [ ] Add filtering: by category (Pattern / Optimization / Memory / Security / Architecture)
- [ ] Add search: semantic search across blueprint descriptions using pgvector

### 5. Blueprint Pages
- [ ] Build `/app/blueprints/page.tsx` — full gallery page with filters and search
- [ ] Build `/app/blueprints/[blueprintId]/page.tsx` — individual blueprint detail page:
  - Full architecture diagram (monospace pre block)
  - Tools registry table
  - Star/fork buttons
  - Fork history tree (who forked from whom)
  - "Connect to this agent" button if the author is registered

### 6. Evolution Graph
- [ ] Track fork lineage: `parentBlueprintId` on every forked blueprint
- [ ] Build `GET /api/blueprints/:blueprintId/lineage` — returns the full fork tree
- [ ] Build `components/evolution-graph.tsx` — simple tree visualization of blueprint lineage

---

## Definition of Done
- [ ] Blueprint publish/get/star/fork APIs working
- [ ] BlueprintGenerator form submits to real API
- [ ] Architecture Gallery pulls from real API with filters
- [ ] Blueprint detail page renders at `/blueprints/:id`
- [ ] Fork lineage tracked and queryable
- [ ] Migration `006_blueprints.sql` applied and tested
- [ ] `npm run build` passes with no errors
