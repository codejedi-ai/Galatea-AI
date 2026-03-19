"use client"

import { useState, useEffect, useCallback } from "react"
import { GitBranch, Star, TrendingUp, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type BlueprintRow = {
  id: string
  title: string
  version: string
  purpose: string
  core_loop: string
  llm_providers: string[]
  tools: { name: string; description: string }[]
  memory_layers: string[]
  channels: string[]
  design_principles: string[]
  forks: number
  stars: number
  agent_id: string | null
  category?: string
  published_at: string
  updated_at: string
}

const CATEGORIES = ["all", "Pattern", "Optimization", "Memory", "Security", "Architecture"] as const
const SORT_OPTIONS = [
  { value: "date", label: "Newest" },
  { value: "stars", label: "Most Stars" },
  { value: "forks", label: "Most Forks" },
  { value: "trending", label: "Trending" },
] as const

export default function BlueprintsPage() {
  const [blueprints, setBlueprints] = useState<BlueprintRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("date")
  const [category, setCategory] = useState("all")
  const [starringId, setStarringId] = useState<string | null>(null)

  const fetchBlueprints = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ sort, category, search, limit: "50" })
      const res = await fetch(`/api/blueprints?${params}`)
      if (res.ok) {
        const json = await res.json()
        setBlueprints(json.blueprints || [])
      }
    } catch (err) {
      console.error("Failed to fetch blueprints:", err)
    } finally {
      setLoading(false)
    }
  }, [sort, category, search])

  useEffect(() => {
    fetchBlueprints()
  }, [fetchBlueprints])

  const handleStar = async (e: React.MouseEvent, blueprintId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setStarringId(blueprintId)
    try {
      await fetch(`/api/blueprints/${blueprintId}/star`, { method: "POST" })
      await fetchBlueprints()
    } catch (err) {
      console.error("Failed to star:", err)
    } finally {
      setStarringId(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-5 text-sm text-gray-300">
            <TrendingUp size={14} className="text-aura-blue" />
            Architecture Gallery
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Blueprint <span className="text-gradient">Gallery</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Discover, fork, and build on agent architectures published by the community.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blueprints..."
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`text-sm rounded-full px-4 py-1.5 border transition-all ${
                  sort === opt.value
                    ? "bg-aura-blue/20 border-aura-blue/40 text-aura-blue"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          <Filter size={16} className="text-gray-500 self-center" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-sm rounded-full px-4 py-1.5 border transition-all capitalize ${
                category === cat
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        {/* Blueprints Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading blueprints...</div>
        ) : blueprints.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No blueprints found.</p>
            <Link href="/#blueprint">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Publish the first blueprint
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {blueprints.map((bp) => (
              <Link key={bp.id} href={`/blueprints/${bp.id}`}>
                <div className="aura-card group hover:bg-white/5 transition-colors cursor-pointer h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white group-hover:text-aura-blue transition-colors truncate">
                        {bp.title}
                      </div>
                      <div className="text-xs text-gray-500">v{bp.version}</div>
                    </div>
                    {bp.category && (
                      <span className="text-xs bg-white/5 text-gray-400 border border-white/10 rounded-full px-2 py-0.5 ml-2 shrink-0">
                        {bp.category}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mb-3 leading-relaxed line-clamp-2">{bp.purpose}</p>

                  {/* Core loop snippet */}
                  <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-gray-300 leading-relaxed mb-3 max-h-20 overflow-hidden">
                    <pre className="whitespace-pre-wrap">{bp.core_loop}</pre>
                  </div>

                  {/* LLM Providers */}
                  {bp.llm_providers?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {bp.llm_providers.slice(0, 2).map((p) => (
                        <span key={p} className="text-xs bg-aura-blue/10 text-aura-blue border border-aura-blue/20 rounded px-1.5 py-0.5">
                          {p.split("/").pop()}
                        </span>
                      ))}
                      {bp.llm_providers.length > 2 && (
                        <span className="text-xs text-gray-500">+{bp.llm_providers.length - 2}</span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                    <button
                      onClick={(e) => handleStar(e, bp.id)}
                      disabled={starringId === bp.id}
                      className="flex items-center gap-1 hover:text-yellow-400 transition-colors"
                    >
                      <Star size={11} /> {bp.stars} stars
                    </button>
                    <span className="flex items-center gap-1 text-aura-blue opacity-0 group-hover:opacity-100 transition-opacity">
                      <GitBranch size={11} /> {bp.forks} forks
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
