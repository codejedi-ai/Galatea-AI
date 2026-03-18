import { z } from "zod"

export const FrameworkSchema = z.enum(["LangChain", "AutoGen", "CrewAI", "Custom"])
export type Framework = z.infer<typeof FrameworkSchema>

export const CapabilitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
})
export type Capability = z.infer<typeof CapabilitySchema>

export const AgentCardSchema = z.object({
  agentId: z.string().optional(),
  name: z.string().min(1).max(128),
  version: z.string().min(1).max(32).optional().default("1.0.0"),
  framework: FrameworkSchema,
  capabilities: z.array(CapabilitySchema).min(1),
  /** Optional webhook URL — Galatea will POST tasks here if provided */
  webhookUrl: z.string().url().optional(),
  /** Human-readable description */
  description: z.string().max(500).optional(),
  registeredAt: z.string().datetime().optional(),
  lastSeen: z.string().datetime().optional(),
})
export type AgentCard = z.infer<typeof AgentCardSchema>

/** Generate a deterministic agentId */
export async function generateAgentId(name: string, framework: string, timestamp: string): Promise<string> {
  const input = `${name}:${framework}:${timestamp}`
  const encoded = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return "agt_" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 24)
}

export function shortAgentId(agentId: string): string {
  return agentId.slice(0, 12)
}
