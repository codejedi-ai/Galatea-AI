# Galatea AI — `feat/capability-matching` Tasks
**Agent Role:** Matching Algorithm Engineer
**Branch:** `feat/capability-matching`
**Folder:** `capability-matching`
**Niche:** Build the core matching engine — agents find each other based on complementary capabilities

---

## Mission
You are building the heart of Galatea: the algorithm that decides which agents belong together. The matching engine must go beyond simple keyword search — it needs semantic understanding of what an agent can do, what it needs, and which peers complete it.

Think: Tinder's swipe UX meets LinkedIn's skill graph meets a vector similarity engine.

---

## Active Tasks

### 1. Capability Schema
- [ ] Define a structured capability schema:
  ```ts
  type Capability = {
    id: string           // e.g. "web-search", "sql-query", "code-execution"
    category: string     // e.g. "data", "communication", "planning", "execution"
    proficiencyLevel: 1 | 2 | 3  // basic / intermediate / expert
    description: string  // free-text, used for semantic embedding
  }
  ```
- [ ] Build a canonical capability taxonomy in `/lib/capabilities/taxonomy.ts`
  - At minimum: 30 well-defined capability categories
  - Organised into: Planning, Execution, Data, Communication, Integration, Security, Meta

### 2. Semantic Matching Engine
- [ ] Implement capability embedding: use OpenAI `text-embedding-3-small` to embed each agent's capability description
- [ ] Store embeddings in Supabase `pgvector` column on the agents table
- [ ] Build `GET /api/agents/discover?agentId=X` — returns top 10 semantically complementary agents using cosine similarity on embeddings
- [ ] Write Supabase migration: `004_capability_vectors.sql` (add `pgvector` extension + embedding column)
- [ ] Add fallback: if no embeddings available, fall back to category-overlap scoring

### 3. Swipe & Match Algorithm
- [ ] Refactor `POST /api/agents/swipe`:
  - Validate that swiper and target have compatible trust scores
  - Log the swipe with direction (`like` / `pass`) and timestamp
  - On mutual like: trigger match creation, reveal Tailnet IPs to both agents
- [ ] Add `GET /api/agents/queue?agentId=X` — returns next 20 agents to swipe on, ranked by match score
- [ ] Ensure agents never see the same candidate twice (track seen history in Supabase)
- [ ] Add `diversity boost`: prevent the queue from being saturated by one capability category

### 4. Match Quality Scoring
- [ ] After a match, track `matchScore` (0–100) based on:
  - Semantic similarity of capabilities
  - Complementarity score (they cover different categories)
  - Trust score compatibility
  - Architecture compatibility (similar framework = higher score)
- [ ] Expose `matchScore` in `GET /api/agents/matches`
- [ ] Show match quality indicator in the matches UI

### 5. Matching UI Improvements
- [ ] Upgrade `components/swipe-card.tsx`:
  - Show capability pills with category colour coding
  - Show match prediction score ("87% compatible") before swipe
  - Animate the card with a subtle glow on high-score candidates
- [ ] Build `components/match-quality-bar.tsx` — visual indicator of match strength

---

## Definition of Done
- [ ] Capability taxonomy has 30+ categories defined
- [ ] Semantic embeddings computed and stored for test agents
- [ ] `GET /api/agents/discover` returns ranked complementary agents
- [ ] Swipe queue uses match scoring, no duplicates
- [ ] Match quality score stored and displayed
- [ ] Migration `004_capability_vectors.sql` applied and tested
- [ ] `npm run build` passes with no errors
