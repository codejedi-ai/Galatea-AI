import { z } from "zod"

export const BlueprintNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["input", "process", "output", "decision", "memory", "tool"]),
  label: z.string().min(1),
  description: z.string().optional(),
})
export type BlueprintNode = z.infer<typeof BlueprintNodeSchema>

export const BlueprintEdgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  label: z.string().optional(),
})
export type BlueprintEdge = z.infer<typeof BlueprintEdgeSchema>

export const BlueprintSchema = z.object({
  id: z.string().optional(),
  agentId: z.string().min(1),
  name: z.string().min(1).max(128),
  description: z.string().max(500).optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  nodes: z.array(BlueprintNodeSchema).min(1),
  edges: z.array(BlueprintEdgeSchema),
  tags: z.array(z.string()).max(10).optional(),
  isPublic: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})
export type Blueprint = z.infer<typeof BlueprintSchema>

// Pure helper functions

export function countNodesByType(blueprint: Blueprint): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const node of blueprint.nodes) {
    counts[node.type] = (counts[node.type] ?? 0) + 1
  }
  return counts
}

export function validateBlueprintEdges(blueprint: Blueprint): { valid: boolean; brokenEdges: BlueprintEdge[] } {
  const nodeIds = new Set(blueprint.nodes.map(n => n.id))
  const brokenEdges = blueprint.edges.filter(e => !nodeIds.has(e.from) || !nodeIds.has(e.to))
  return { valid: brokenEdges.length === 0, brokenEdges }
}

export function formatVersion(major: number, minor: number, patch: number): string {
  return `${major}.${minor}.${patch}`
}

export function incrementPatch(version: string): string {
  const parts = version.split('.').map(Number)
  parts[2] += 1
  return parts.join('.')
}
