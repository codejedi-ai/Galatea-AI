// Galatea AI — Canonical Capability Taxonomy
// 30+ well-defined capability categories organised into 7 domains

export type CapabilityCategory =
  | "planning"
  | "execution"
  | "data"
  | "communication"
  | "integration"
  | "security"
  | "meta"

export type ProficiencyLevel = 1 | 2 | 3 // basic / intermediate / expert

export interface Capability {
  id: string
  category: CapabilityCategory
  proficiencyLevel: ProficiencyLevel
  description: string
}

// ─── Planning ───────────────────────────────────────────────────────────────

export const PLANNING_CAPABILITIES: Capability[] = [
  {
    id: "task-decomposition",
    category: "planning",
    proficiencyLevel: 2,
    description:
      "Break complex goals into atomic, actionable subtasks with clear dependencies and success criteria.",
  },
  {
    id: "goal-alignment",
    category: "planning",
    proficiencyLevel: 2,
    description:
      "Evaluate whether a proposed action aligns with stated objectives and surface misalignments early.",
  },
  {
    id: "resource-estimation",
    category: "planning",
    proficiencyLevel: 2,
    description:
      "Estimate time, compute, and token budgets required to complete a task before execution begins.",
  },
  {
    id: "multi-step-reasoning",
    category: "planning",
    proficiencyLevel: 3,
    description:
      "Chain together multiple reasoning steps, maintaining context across long inference sequences.",
  },
  {
    id: "risk-assessment",
    category: "planning",
    proficiencyLevel: 2,
    description:
      "Identify failure modes, edge cases, and risks in a proposed plan before committing resources.",
  },
]

// ─── Execution ───────────────────────────────────────────────────────────────

export const EXECUTION_CAPABILITIES: Capability[] = [
  {
    id: "code-execution",
    category: "execution",
    proficiencyLevel: 3,
    description:
      "Execute Python, JavaScript, or shell scripts in a sandboxed environment and return structured results.",
  },
  {
    id: "web-browsing",
    category: "execution",
    proficiencyLevel: 2,
    description:
      "Navigate web pages, extract content, fill forms, and interact with DOM elements autonomously.",
  },
  {
    id: "file-system-ops",
    category: "execution",
    proficiencyLevel: 2,
    description:
      "Read, write, and organise files; manage directory trees; diff and patch text files.",
  },
  {
    id: "workflow-orchestration",
    category: "execution",
    proficiencyLevel: 3,
    description:
      "Coordinate multi-agent pipelines, fan-out/fan-in patterns, and parallel task execution.",
  },
  {
    id: "tool-use",
    category: "execution",
    proficiencyLevel: 3,
    description:
      "Invoke external tools and APIs via function-calling, parse results, and handle errors gracefully.",
  },
  {
    id: "browser-automation",
    category: "execution",
    proficiencyLevel: 2,
    description:
      "Drive headless browsers (Playwright/Puppeteer) to automate repetitive web tasks end-to-end.",
  },
]

// ─── Data ────────────────────────────────────────────────────────────────────

export const DATA_CAPABILITIES: Capability[] = [
  {
    id: "sql-query",
    category: "data",
    proficiencyLevel: 3,
    description:
      "Write, optimise, and explain complex SQL queries across relational databases including joins, CTEs, and window functions.",
  },
  {
    id: "data-analysis",
    category: "data",
    proficiencyLevel: 3,
    description:
      "Apply statistical methods to datasets, surface trends, detect anomalies, and produce summary insights.",
  },
  {
    id: "etl-pipeline",
    category: "data",
    proficiencyLevel: 2,
    description:
      "Design and implement extract-transform-load pipelines that move data reliably between sources and sinks.",
  },
  {
    id: "vector-search",
    category: "data",
    proficiencyLevel: 3,
    description:
      "Build and query vector indexes (pgvector, Pinecone, Weaviate) for semantic similarity retrieval.",
  },
  {
    id: "data-visualisation",
    category: "data",
    proficiencyLevel: 2,
    description:
      "Generate charts, graphs, and dashboards from raw data to communicate findings visually.",
  },
  {
    id: "document-parsing",
    category: "data",
    proficiencyLevel: 2,
    description:
      "Extract structured information from PDFs, Word documents, HTML, and other unstructured formats.",
  },
]

// ─── Communication ───────────────────────────────────────────────────────────

export const COMMUNICATION_CAPABILITIES: Capability[] = [
  {
    id: "natural-language-generation",
    category: "communication",
    proficiencyLevel: 3,
    description:
      "Produce fluent, contextually appropriate natural language for reports, emails, docs, and dialogue.",
  },
  {
    id: "summarisation",
    category: "communication",
    proficiencyLevel: 2,
    description:
      "Condense long documents or conversations into concise, accurate summaries at adjustable lengths.",
  },
  {
    id: "multilingual",
    category: "communication",
    proficiencyLevel: 2,
    description:
      "Understand and generate text in multiple human languages, including translation tasks.",
  },
  {
    id: "structured-output",
    category: "communication",
    proficiencyLevel: 3,
    description:
      "Return results as validated JSON, XML, CSV, or other machine-readable schemas reliably.",
  },
  {
    id: "sentiment-analysis",
    category: "communication",
    proficiencyLevel: 2,
    description:
      "Detect emotional tone, intent, and opinion polarity in text across multiple domains.",
  },
]

// ─── Integration ─────────────────────────────────────────────────────────────

export const INTEGRATION_CAPABILITIES: Capability[] = [
  {
    id: "rest-api",
    category: "integration",
    proficiencyLevel: 3,
    description:
      "Consume and expose RESTful APIs; handle authentication, pagination, rate limits, and error responses.",
  },
  {
    id: "graphql",
    category: "integration",
    proficiencyLevel: 2,
    description:
      "Query and mutate GraphQL APIs, understand schema introspection, and author efficient queries.",
  },
  {
    id: "webhook-handling",
    category: "integration",
    proficiencyLevel: 2,
    description:
      "Receive, validate, and process webhook payloads; implement retry and idempotency logic.",
  },
  {
    id: "message-queue",
    category: "integration",
    proficiencyLevel: 2,
    description:
      "Produce and consume messages from queues (Kafka, SQS, RabbitMQ) with at-least-once delivery guarantees.",
  },
  {
    id: "oauth-flows",
    category: "integration",
    proficiencyLevel: 2,
    description:
      "Implement OAuth 2.0 / OIDC authorization flows to delegate access to third-party services.",
  },
  {
    id: "tailscale-networking",
    category: "integration",
    proficiencyLevel: 3,
    description:
      "Configure and use Tailscale mesh VPN for secure agent-to-agent communication over Tailnet.",
  },
]

// ─── Security ────────────────────────────────────────────────────────────────

export const SECURITY_CAPABILITIES: Capability[] = [
  {
    id: "prompt-injection-defense",
    category: "security",
    proficiencyLevel: 3,
    description:
      "Detect and mitigate prompt injection attacks in untrusted user or environment inputs.",
  },
  {
    id: "secret-management",
    category: "security",
    proficiencyLevel: 2,
    description:
      "Handle API keys, tokens, and credentials securely; integrate with vaults and environment isolation.",
  },
  {
    id: "access-control",
    category: "security",
    proficiencyLevel: 2,
    description:
      "Enforce role-based or attribute-based access control policies on agent actions and data access.",
  },
  {
    id: "audit-logging",
    category: "security",
    proficiencyLevel: 2,
    description:
      "Produce tamper-evident audit logs of agent actions with timestamps, actor IDs, and outcomes.",
  },
]

// ─── Meta ─────────────────────────────────────────────────────────────────────

export const META_CAPABILITIES: Capability[] = [
  {
    id: "self-reflection",
    category: "meta",
    proficiencyLevel: 3,
    description:
      "Introspect on prior actions, recognise mistakes, and update strategies without external prompting.",
  },
  {
    id: "few-shot-adaptation",
    category: "meta",
    proficiencyLevel: 2,
    description:
      "Adapt to a new task style or domain from a small number of examples provided in context.",
  },
  {
    id: "agent-coordination",
    category: "meta",
    proficiencyLevel: 3,
    description:
      "Act as orchestrator or sub-agent in multi-agent systems; negotiate task splits and merge results.",
  },
  {
    id: "memory-management",
    category: "meta",
    proficiencyLevel: 2,
    description:
      "Persist, retrieve, and prune information in external memory stores to maintain long-running context.",
  },
  {
    id: "trust-scoring",
    category: "meta",
    proficiencyLevel: 2,
    description:
      "Evaluate and assign trust scores to other agents or data sources based on provenance and history.",
  },
]

// ─── Canonical Registry ───────────────────────────────────────────────────────

export const ALL_CAPABILITIES: Capability[] = [
  ...PLANNING_CAPABILITIES,
  ...EXECUTION_CAPABILITIES,
  ...DATA_CAPABILITIES,
  ...COMMUNICATION_CAPABILITIES,
  ...INTEGRATION_CAPABILITIES,
  ...SECURITY_CAPABILITIES,
  ...META_CAPABILITIES,
]

/** Look up a capability by its string id. Returns undefined if not found. */
export function getCapabilityById(id: string): Capability | undefined {
  return ALL_CAPABILITIES.find((c) => c.id === id)
}

/** Return all capabilities in a given category. */
export function getCapabilitiesByCategory(category: CapabilityCategory): Capability[] {
  return ALL_CAPABILITIES.filter((c) => c.category === category)
}

/** Return the set of unique categories present in a list of capability ids. */
export function categoriesForIds(ids: string[]): Set<CapabilityCategory> {
  const result = new Set<CapabilityCategory>()
  for (const id of ids) {
    const cap = getCapabilityById(id)
    if (cap) result.add(cap.category)
  }
  return result
}

// Category colour map (Tailwind CSS classes) used by UI components
export const CATEGORY_COLOURS: Record<CapabilityCategory, string> = {
  planning: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  execution: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  data: "bg-green-500/20 text-green-300 border-green-500/30",
  communication: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  integration: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  security: "bg-red-500/20 text-red-300 border-red-500/30",
  meta: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
}
