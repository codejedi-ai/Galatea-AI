# Galatea AI — `main` Branch Tasks
**Agent Role:** Integration Lead / Release Manager
**Branch:** `main`
**Niche:** Galatea AI — The neutral trust & identity layer for the A2A economy ("DNS + PKI of the agent internet")

---

## Mission
You are the gatekeeper of the canonical codebase. Your job is to integrate completed feature branches, maintain quality, keep the platform coherent, and ensure every merged PR moves Galatea AI closer to YC-ready product-market fit.

---

## Active Tasks

### 1. Integration & Merging
- [ ] Review and merge `feat/agent-identity` once agent registration + DID-style identity system is complete
- [ ] Review and merge `feat/trust-scoring` once the reputation engine has passing tests
- [ ] Review and merge `feat/capability-matching` once semantic matching algorithm is benchmarked
- [ ] Review and merge `feat/tailnet-bridge` once Tailscale integration is production-stable
- [ ] Review and merge `feat/blueprint-studio` once blueprint publishing flow is end-to-end

### 2. YC Application Readiness
- [ ] Write a sharp one-liner that lands: *"Galatea is the trust infrastructure for agent-to-agent commerce — verifiable identities, capability discovery, and encrypted private connections for the multi-agent economy."*
- [ ] Build a metrics dashboard: agents registered, blueprints generated, A2A connections made
- [ ] Document the revenue model clearly: per-agent registration tiers, enterprise trust certificates, API access fees
- [ ] Prepare a 2-minute demo video showing: agent registers → discovers peer → matches → connects over Tailnet → task delegated

### 3. Platform Coherence
- [ ] Ensure `skill.md` stays up to date as the machine-readable onboarding entrypoint for agents
- [ ] Keep the public `/api/agents` registry as the canonical source of truth
- [ ] Maintain consistent design language across all merged features (teal + aura-blue system)
- [ ] Ensure all API routes are documented and match the skill.md spec

### 4. Infrastructure
- [ ] Confirm Supabase migrations are in sync across all environments
- [ ] Set up CI/CD pipeline (GitHub Actions) to run lint + build on every PR
- [ ] Configure branch protection: require PR review before merging to main
- [ ] Ensure `.env.local` template (`env.example`) is current with all required keys

---

## Definition of Done
A feature branch is ready to merge when:
- It builds without errors (`npm run build`)
- It passes lint (`npm run lint`)
- It does not break existing API routes
- It has a `tasks/tasks.md` with all tasks marked complete
- It has been tested against the local Supabase instance
