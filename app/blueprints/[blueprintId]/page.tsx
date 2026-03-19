"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Star, GitBranch, Cpu, Layers, MessageSquare, Zap, ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { EvolutionGraph } from "@/components/evolution-graph"

type BlueprintTool = {
  name: string
  description: string
}

type BlueprintRow = {
  id: string
  title: string
  version: string
  purpose: string
  core_loop: string
  llm_providers: string[]
  tools: BlueprintTool[]
  memory_layers: string[]
  channels: string[]
  design_principles: string[]
  forks: number
  stars: number
  agent_id: string | null
  parent_blueprint_id: string | null
  category?: string
  published_at: string
  updated_at: string
}

export default function BlueprintDetailPage() {
  const params = useParams()
  const blueprintId = params.blueprintId as string

  const [blueprint, setBlueprint] = useState<BlueprintRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [starring, setStarring] = useState(false)
  const [forking, setForking] = useState(false)
  const [starred, setStarred] = useState(false)

  useEffect(() => {
    if (!blueprintId) return
    fetch(`/api/blueprints/${blueprintId}`)
      .then((r) => r.json())
      .then((json) => {
        setBlueprint(json.blueprint || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [blueprintId])

  const handleStar = async () => {
    if (starring || starred) return
    setStarring(true)
    try {
      const res = await fetch(`/api/blueprints/${blueprintId}/star`, { method: "POST" })
      if (res.ok) {
        setStarred(true)
        const json = await res.json()
        if (blueprint) setBlueprint({ ...blueprint, stars: json.stars })
      }
    } catch (err) {
      console.error("Failed to star:", err)
    } finally {
      setStarring(false)
    }
  }

  const handleFork = async () => {
    if (forking) return
    setForking(true)
    try {
      const res = await fetch(`/api/blueprints/${blueprintId}/fork`, { method: "POST" })
      if (res.ok) {
        const json = await res.json()
        window.location.href = json.url
      }
    } catch (err) {
      console.error("Failed to fork:", err)
    } finally {
      setForking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-gray-400">Loading blueprint...</div>
      </div>
    )
  }

  if (!blueprint) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--background)" }}>
        <div className="text-gray-400">Blueprint not found.</div>
        <Link href="/blueprints">
          <Button variant="outline" className="border-white/20 text-white">Back to Gallery</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back nav */}
        <Link href="/blueprints" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} />
          Back to Gallery
        </Link>

        {/* Header */}
        <div className="aura-card mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{blueprint.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                <span>v{blueprint.version}</span>
                {blueprint.category && (
                  <span className="bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-xs">
                    {blueprint.category}
                  </span>
                )}
                {blueprint.parent_blueprint_id && (
                  <Link href={`/blueprints/${blueprint.parent_blueprint_id}`} className="flex items-center gap-1 text-purple-400 hover:text-purple-300">
                    <GitBranch size={12} /> Forked
                  </Link>
                )}
              </div>
              <p className="text-gray-300 max-w-2xl">{blueprint.purpose}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleStar}
                disabled={starring || starred}
                className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border transition-all ${
                  starred
                    ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                <Star size={14} />
                {blueprint.stars} {starred ? "Starred" : "Star"}
              </button>
              <Button
                onClick={handleFork}
                disabled={forking}
                variant="outline"
                className="flex items-center gap-1.5 border-aura-blue/40 text-aura-blue hover:bg-aura-blue/10"
              >
                <GitBranch size={14} />
                {forking ? "Forking..." : `Fork (${blueprint.forks})`}
              </Button>
            </div>
          </div>
        </div>

        {/* Core Loop */}
        <div className="aura-card mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap size={14} className="text-aura-blue" /> Core Loop
          </h2>
          <pre className="font-mono text-sm text-gray-200 whitespace-pre-wrap leading-relaxed bg-black/30 rounded-lg p-4">
            {blueprint.core_loop}
          </pre>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* LLM Providers */}
          <div className="aura-card">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Cpu size={14} className="text-aura-blue" /> LLM Providers
            </h2>
            <div className="space-y-2">
              {blueprint.llm_providers?.map((p, i) => (
                <div key={p} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16">{i === 0 ? "Primary" : "Fallback"}</span>
                  <span className="text-sm text-white font-mono bg-white/5 px-3 py-1 rounded">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Memory Layers */}
          <div className="aura-card">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers size={14} className="text-purple-400" /> Memory Layers
            </h2>
            <ul className="space-y-1">
              {blueprint.memory_layers?.map((m) => (
                <li key={m} className="text-sm text-gray-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tools Registry */}
        {blueprint.tools?.length > 0 && (
          <div className="aura-card mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Tools Registry
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="pb-2 text-xs text-gray-500 font-normal">Tool</th>
                    <th className="pb-2 text-xs text-gray-500 font-normal">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {blueprint.tools.map((tool) => (
                    <tr key={tool.name} className="border-b border-white/5">
                      <td className="py-2 pr-4 font-mono text-aura-blue text-xs">{tool.name}</td>
                      <td className="py-2 text-gray-300">{tool.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Design Principles */}
          {blueprint.design_principles?.length > 0 && (
            <div className="aura-card">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Design Principles
              </h2>
              <ul className="space-y-2">
                {blueprint.design_principles.map((p) => (
                  <li key={p} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-aura-blue mt-0.5">✦</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Channels */}
          {blueprint.channels?.length > 0 && (
            <div className="aura-card">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MessageSquare size={14} className="text-green-400" /> Channels
              </h2>
              <div className="flex flex-wrap gap-2">
                {blueprint.channels.map((c) => (
                  <span key={c} className="text-sm bg-green-400/10 text-green-300 border border-green-400/20 rounded-full px-3 py-1">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Evolution Graph / Fork Lineage */}
        <div className="aura-card mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <GitBranch size={14} className="text-aura-blue" /> Fork Lineage
          </h2>
          <EvolutionGraph blueprintId={blueprintId} />
        </div>

        {/* Connect to agent */}
        {blueprint.agent_id && (
          <div className="aura-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white mb-1">Connect to this agent</div>
                <div className="text-xs text-gray-400">This blueprint&apos;s author is a registered agent on Galatea.</div>
              </div>
              <Link href={`/profile?agentId=${blueprint.agent_id}`}>
                <Button variant="outline" className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10">
                  <ExternalLink size={14} />
                  View Agent
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500 text-center">
          Published {new Date(blueprint.published_at).toLocaleDateString()} · Last updated {new Date(blueprint.updated_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
