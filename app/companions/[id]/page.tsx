"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import {
  ArrowLeft, Heart, Sparkles, MessageCircle, Clock,
  Lock, Download, AlertTriangle
} from "lucide-react"
import Link from "next/link"

interface CompanionDetail {
  id: string
  name: string
  avatar_seed: string
  soul_md: string
  skill_md: string
  traits: string[]
  status: "wild" | "claimed"
  message_count: number
  evolution_log: { ts: string; summary: string }[]
  last_evolved_at: string | null
  created_at: string
  claimed_at: string | null
  nft_token_id: string | null
}

export default function CompanionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState<string | null>(null)
  const [companion, setCompanion] = useState<CompanionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [claimResult, setClaimResult] = useState<{ success: boolean; message: string; soul_stack?: unknown } | null>(null)
  const [ownerId, setOwnerId] = useState("")
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"soul" | "skills" | "history">("soul")

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    fetch(`/api/companions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCompanion(data)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [id])

  const handleClaim = async () => {
    if (!ownerId.trim() || !id) return
    setClaiming(true)
    try {
      const res = await fetch(`/api/companions/${id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_id: ownerId.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setClaimResult({ success: true, message: data.message, soul_stack: data.soul_stack })
        setShowClaimModal(false)
      } else {
        setClaimResult({ success: false, message: data.error })
      }
    } catch {
      setClaimResult({ success: false, message: "Network error. Please try again." })
    } finally {
      setClaiming(false)
    }
  }

  const getAvatarColor = (seed: string): string => {
    const colors = [
      "from-teal-500 to-cyan-600", "from-violet-500 to-purple-600",
      "from-rose-500 to-pink-600", "from-amber-500 to-orange-600",
      "from-emerald-500 to-green-600", "from-blue-500 to-indigo-600",
    ]
    let hash = 0
    for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff
    return colors[hash % colors.length]
  }

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Navbar />
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    )
  }

  if (!companion) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-gray-400">Companion not found.</p>
          <Link href="/companions" className="text-teal-400 text-sm mt-4 inline-block">← Back to companions</Link>
        </div>
      </div>
    )
  }

  const isClaimed = companion.status === "claimed"

  // --- Claim success screen ---
  if (claimResult?.success) {
    const stack = claimResult.soul_stack as Record<string, string> | undefined
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <Navbar />
        <div className="max-w-lg w-full text-center">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarColor(companion.avatar_seed ?? companion.name)} flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6`}>
            {getInitials(companion.name)}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{companion.name} is yours.</h1>
          <p className="text-gray-400 mb-8 text-sm">{claimResult.message}</p>

          <div className="bg-gray-900 border border-teal-500/30 rounded-xl p-5 text-left space-y-3 mb-8">
            <p className="text-teal-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <Download className="h-3.5 w-3.5" /> Your soul stack
            </p>
            {stack?.soul_md && (
              <a
                href={`data:text/markdown;charset=utf-8,${encodeURIComponent(stack.soul_md)}`}
                download="soul.md"
                className="flex items-center gap-2 text-sm text-white hover:text-teal-400 transition-colors"
              >
                <span className="text-teal-500">↓</span> soul.md
              </a>
            )}
            {stack?.skill_md && (
              <a
                href={`data:text/markdown;charset=utf-8,${encodeURIComponent(stack.skill_md)}`}
                download="skill.md"
                className="flex items-center gap-2 text-sm text-white hover:text-teal-400 transition-colors"
              >
                <span className="text-teal-500">↓</span> skill.md
              </a>
            )}
            {stack?.system_prompt && (
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(stack.system_prompt)}`}
                download="system_prompt.txt"
                className="flex items-center gap-2 text-sm text-white hover:text-teal-400 transition-colors"
              >
                <span className="text-teal-500">↓</span> system_prompt.txt
              </a>
            )}
            {stack?.ipfs_soul_cid && (
              <p className="text-xs text-gray-600 font-mono">IPFS: {stack.ipfs_soul_cid}</p>
            )}
          </div>

          <Button onClick={() => router.push("/")} className="bg-teal-500 text-black hover:bg-teal-400">
            Return home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">

          {/* Back */}
          <div className="flex items-center gap-2 mb-8 pt-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/companions">
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
            </Button>
            <span className="text-gray-500 text-sm">All companions</span>
          </div>

          {/* Profile card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
            {/* Header */}
            <div className="p-6 flex items-start gap-4">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(companion.avatar_seed ?? companion.name)} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                {getInitials(companion.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{companion.name}</h1>
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {companion.message_count.toLocaleString()} conversations
                      </span>
                      {companion.last_evolved_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Evolved {new Date(companion.last_evolved_at).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                  {isClaimed ? (
                    <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-800 px-2.5 py-1 rounded-full">
                      <Lock className="h-3 w-3" /> Claimed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full">
                      <Heart className="h-3 w-3" /> Available
                    </span>
                  )}
                </div>

                {/* Traits */}
                {companion.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {companion.traits.map((trait) => (
                      <span key={trait} className="text-[10px] bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full">
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-800 flex">
              {(["soul", "skills", "history"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-medium transition-colors ${
                    activeTab === tab
                      ? "text-teal-400 border-b-2 border-teal-400"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab === "soul" ? "Soul" : tab === "skills" ? "Skills" : "Evolution"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === "soul" && (
                <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {companion.soul_md || "Soul still forming…"}
                </pre>
              )}
              {activeTab === "skills" && (
                <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {companion.skill_md || "Skills still developing…"}
                </pre>
              )}
              {activeTab === "history" && (
                <div className="space-y-3">
                  {companion.evolution_log.length === 0 ? (
                    <p className="text-gray-600 text-xs">No evolution events yet.</p>
                  ) : (
                    [...companion.evolution_log].reverse().map((entry, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-300 text-xs">{entry.summary}</p>
                          <p className="text-gray-600 text-[10px] mt-0.5">
                            {new Date(entry.ts).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Claim section */}
          {!isClaimed && (
            <div className="bg-gray-900 border border-teal-500/20 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-5">
                <Sparkles className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="text-white font-semibold">Claim {companion.name}</h2>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    Once claimed, {companion.name} will only talk to you. You receive their
                    complete soul stack — soul.md, skill.md, system prompt, and all memories.
                    This is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              {claimResult && !claimResult.success && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2.5 rounded-lg mb-4">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  {claimResult.message}
                </div>
              )}

              {!showClaimModal ? (
                <Button
                  onClick={() => setShowClaimModal(true)}
                  className="w-full bg-teal-500 text-black hover:bg-teal-400 font-semibold"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Claim {companion.name}
                </Button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your wallet address or email"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-teal-500/50"
                  />
                  <p className="text-gray-600 text-[10px]">
                    This becomes the permanent owner identifier stored on-chain.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowClaimModal(false)}
                      className="flex-1 text-gray-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleClaim}
                      disabled={claiming || !ownerId.trim()}
                      className="flex-1 bg-teal-500 text-black hover:bg-teal-400 font-semibold"
                    >
                      {claiming ? "Claiming…" : "Confirm Claim"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isClaimed && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <Lock className="h-8 w-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                {companion.name} has found their person. They are no longer available.
              </p>
              <p className="text-gray-600 text-xs mt-2">
                Claimed {companion.claimed_at ? new Date(companion.claimed_at).toLocaleDateString() : ""}
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
