"use client"

import { useState, useEffect } from "react"
import { GitBranch, Star } from "lucide-react"
import Link from "next/link"

interface LineageNode {
  id: string
  title: string
  version: string
  agentId: string | null
  forks: number
  stars: number
  publishedAt: string
  children: LineageNode[]
}

interface EvolutionGraphProps {
  blueprintId: string
}

function TreeNode({ node, depth = 0, currentId }: { node: LineageNode; depth?: number; currentId: string }) {
  const isCurrent = node.id === currentId

  return (
    <div className={`relative ${depth > 0 ? "ml-6 mt-2" : ""}`}>
      {depth > 0 && (
        <div className="absolute left-[-16px] top-[14px] w-4 border-t border-white/20" />
      )}
      <Link href={`/blueprints/${node.id}`}>
        <div
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
            isCurrent
              ? "bg-aura-blue/10 border-aura-blue/40 text-aura-blue font-semibold"
              : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <GitBranch size={12} className={isCurrent ? "text-aura-blue" : "text-gray-500"} />
          <span>{node.title}</span>
          <span className="text-gray-500">v{node.version}</span>
          <span className="flex items-center gap-0.5 text-gray-500">
            <Star size={10} />
            {node.stars}
          </span>
        </div>
      </Link>
      {node.children.length > 0 && (
        <div className={`relative ${depth > 0 ? "ml-4" : "ml-4"} mt-1`}>
          <div className="absolute left-0 top-0 bottom-0 border-l border-white/20" />
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} currentId={currentId} />
          ))}
        </div>
      )}
    </div>
  )
}

export function EvolutionGraph({ blueprintId }: EvolutionGraphProps) {
  const [tree, setTree] = useState<LineageNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!blueprintId) return
    fetch(`/api/blueprints/${blueprintId}/lineage`)
      .then((r) => r.json())
      .then((json) => {
        if (json.tree) {
          setTree(json.tree)
        } else {
          setError(json.error || "Failed to load lineage")
        }
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load lineage")
        setLoading(false)
      })
  }, [blueprintId])

  if (loading) {
    return <div className="text-xs text-gray-500 py-2">Loading lineage...</div>
  }

  if (error || !tree) {
    return <div className="text-xs text-gray-500 py-2">Lineage unavailable.</div>
  }

  const totalNodes = countNodes(tree)

  return (
    <div>
      <div className="text-xs text-gray-500 mb-3">
        {totalNodes === 1
          ? "This is the original blueprint — no forks yet."
          : `${totalNodes} blueprints in this lineage`}
      </div>
      <div className="overflow-x-auto">
        <TreeNode node={tree} depth={0} currentId={blueprintId} />
      </div>
    </div>
  )
}

function countNodes(node: LineageNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0)
}
