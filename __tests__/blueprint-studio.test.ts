import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  BlueprintSchema,
  BlueprintNodeSchema,
  BlueprintEdgeSchema,
  countNodesByType,
  validateBlueprintEdges,
  formatVersion,
  incrementPatch,
} from '../lib/types/blueprint.ts'

function expect(actual: unknown) {
  return {
    toBe: (expected: unknown) => assert.strictEqual(actual, expected),
    toEqual: (expected: unknown) => assert.deepStrictEqual(actual, expected),
    toHaveLength: (n: number) => assert.strictEqual((actual as { length: number }).length, n),
    toContain: (item: unknown) => assert.ok(Array.isArray(actual) ? actual.includes(item) : String(actual).includes(String(item))),
    toBeGreaterThan: (n: number) => assert.ok((actual as number) > n),
    toBeTruthy: () => assert.ok(actual),
    toBeFalsy: () => assert.ok(!actual),
    not: { toBe: (expected: unknown) => assert.notStrictEqual(actual, expected) },
  }
}

const validBlueprint = {
  agentId: "agent-123",
  name: "Test Blueprint",
  version: "1.0.0",
  nodes: [
    { id: "n1", type: "input" as const, label: "Start" },
    { id: "n2", type: "process" as const, label: "Process" },
    { id: "n3", type: "output" as const, label: "End" },
  ],
  edges: [
    { from: "n1", to: "n2" },
    { from: "n2", to: "n3" },
  ],
}

describe("countNodesByType", () => {
  it("counts nodes by type correctly", () => {
    const bp = BlueprintSchema.parse(validBlueprint)
    const counts = countNodesByType(bp)
    expect(counts["input"]).toBe(1)
    expect(counts["process"]).toBe(1)
    expect(counts["output"]).toBe(1)
  })

  it("returns zero for absent types", () => {
    const bp = BlueprintSchema.parse(validBlueprint)
    const counts = countNodesByType(bp)
    expect(counts["decision"]).toBe(undefined)
  })

  it("counts multiple nodes of same type", () => {
    const bp = BlueprintSchema.parse({
      ...validBlueprint,
      nodes: [
        { id: "n1", type: "process" as const, label: "Step 1" },
        { id: "n2", type: "process" as const, label: "Step 2" },
        { id: "n3", type: "output" as const, label: "Done" },
      ],
      edges: [],
    })
    const counts = countNodesByType(bp)
    expect(counts["process"]).toBe(2)
    expect(counts["output"]).toBe(1)
  })
})

describe("validateBlueprintEdges", () => {
  it("returns valid=true when all edges reference existing nodes", () => {
    const bp = BlueprintSchema.parse(validBlueprint)
    const result = validateBlueprintEdges(bp)
    expect(result.valid).toBe(true)
    expect(result.brokenEdges).toHaveLength(0)
  })

  it("detects broken edges where 'from' node is missing", () => {
    const bp = BlueprintSchema.parse({
      ...validBlueprint,
      edges: [{ from: "nonexistent", to: "n1" }],
    })
    const result = validateBlueprintEdges(bp)
    expect(result.valid).toBe(false)
    expect(result.brokenEdges).toHaveLength(1)
  })

  it("detects broken edges where 'to' node is missing", () => {
    const bp = BlueprintSchema.parse({
      ...validBlueprint,
      edges: [{ from: "n1", to: "ghost" }],
    })
    const result = validateBlueprintEdges(bp)
    expect(result.valid).toBe(false)
    expect(result.brokenEdges).toHaveLength(1)
  })

  it("returns valid=true when there are no edges", () => {
    const bp = BlueprintSchema.parse({ ...validBlueprint, edges: [] })
    const result = validateBlueprintEdges(bp)
    expect(result.valid).toBe(true)
  })
})

describe("formatVersion", () => {
  it("formats version correctly", () => {
    expect(formatVersion(1, 0, 0)).toBe("1.0.0")
    expect(formatVersion(2, 3, 4)).toBe("2.3.4")
    expect(formatVersion(0, 0, 1)).toBe("0.0.1")
  })

  it("handles large version numbers", () => {
    expect(formatVersion(10, 20, 30)).toBe("10.20.30")
  })
})

describe("incrementPatch", () => {
  it("increments the patch version", () => {
    expect(incrementPatch("1.0.0")).toBe("1.0.1")
    expect(incrementPatch("2.3.4")).toBe("2.3.5")
    expect(incrementPatch("0.0.0")).toBe("0.0.1")
  })

  it("does not affect major or minor", () => {
    expect(incrementPatch("5.7.9")).toBe("5.7.10")
  })
})

describe("BlueprintSchema validation", () => {
  it("accepts a valid blueprint", () => {
    const result = BlueprintSchema.safeParse(validBlueprint)
    expect(result.success).toBe(true)
  })

  it("rejects a blueprint with empty agentId", () => {
    const result = BlueprintSchema.safeParse({ ...validBlueprint, agentId: "" })
    expect(result.success).toBe(false)
  })

  it("rejects a blueprint with no nodes", () => {
    const result = BlueprintSchema.safeParse({ ...validBlueprint, nodes: [] })
    expect(result.success).toBe(false)
  })

  it("rejects a blueprint with invalid version format", () => {
    const result = BlueprintSchema.safeParse({ ...validBlueprint, version: "v1.2" })
    expect(result.success).toBe(false)
  })

  it("rejects a blueprint with name longer than 128 chars", () => {
    const result = BlueprintSchema.safeParse({ ...validBlueprint, name: "x".repeat(129) })
    expect(result.success).toBe(false)
  })

  it("rejects a blueprint with description longer than 500 chars", () => {
    const result = BlueprintSchema.safeParse({ ...validBlueprint, description: "x".repeat(501) })
    expect(result.success).toBe(false)
  })

  it("rejects a blueprint with more than 10 tags", () => {
    const result = BlueprintSchema.safeParse({
      ...validBlueprint,
      tags: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"],
    })
    expect(result.success).toBe(false)
  })

  it("defaults isPublic to true", () => {
    const result = BlueprintSchema.safeParse(validBlueprint)
    if (result.success) {
      expect(result.data.isPublic).toBe(true)
    }
  })

  it("accepts a blueprint with optional fields", () => {
    const result = BlueprintSchema.safeParse({
      ...validBlueprint,
      id: "some-id",
      description: "A test blueprint",
      tags: ["ai", "agent"],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })
})

describe("BlueprintNodeSchema validation", () => {
  it("accepts all valid node types", () => {
    const types = ["input", "process", "output", "decision", "memory", "tool"] as const
    for (const type of types) {
      const result = BlueprintNodeSchema.safeParse({ id: "n1", type, label: "Node" })
      expect(result.success).toBe(true)
    }
  })

  it("rejects unknown node type", () => {
    const result = BlueprintNodeSchema.safeParse({ id: "n1", type: "unknown", label: "Node" })
    expect(result.success).toBe(false)
  })

  it("rejects empty id", () => {
    const result = BlueprintNodeSchema.safeParse({ id: "", type: "input", label: "Node" })
    expect(result.success).toBe(false)
  })
})

describe("BlueprintEdgeSchema validation", () => {
  it("accepts a valid edge", () => {
    const result = BlueprintEdgeSchema.safeParse({ from: "n1", to: "n2" })
    expect(result.success).toBe(true)
  })

  it("accepts an edge with label", () => {
    const result = BlueprintEdgeSchema.safeParse({ from: "n1", to: "n2", label: "yes" })
    expect(result.success).toBe(true)
  })

  it("rejects edge with empty from", () => {
    const result = BlueprintEdgeSchema.safeParse({ from: "", to: "n2" })
    expect(result.success).toBe(false)
  })
})
