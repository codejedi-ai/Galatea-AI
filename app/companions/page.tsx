"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Sparkles, Heart, MessageCircle, ArrowRight } from "lucide-react"

interface Companion {
  id: string
  name: string
  avatar_seed: string
  soul_md: string
  traits: string[]
  message_count: number
  last_evolved_at: string | null
  created_at: string
}

export default function CompanionsPage() {
  const [companions, setCompanions] = useState<Companion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/companions?limit=20")
      .then((r) => r.json())
      .then((data) => {
        setCompanions(Array.isArray(data) ? data : [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  // Extract a short bio from soul.md (first non-empty, non-heading line)
  const getBio = (soulMd: string): string => {
    const lines = soulMd.split("\n").map((l) => l.trim()).filter(Boolean)
    const bioLine = lines.find((l) => !l.startsWith("#"))
    return bioLine?.slice(0, 140) ?? "A companion waiting to be discovered."
  }

  // Deterministic avatar color from seed
  const getAvatarColor = (seed: string): string => {
    const colors = [
      "from-teal-500 to-cyan-600",
      "from-violet-500 to-purple-600",
      "from-rose-500 to-pink-600",
      "from-amber-500 to-orange-600",
      "from-emerald-500 to-green-600",
      "from-blue-500 to-indigo-600",
    ]
    let hash = 0
    for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff
    return colors[hash % colors.length]
  }

  const getInitials = (name: string): string =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">

          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="h-3 w-3" />
              Each companion is unique. Once claimed, they belong only to you.
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Find Your Companion
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
              These AI companions have been growing and evolving on the Galatea network —
              talking to each other, developing personalities, building memories.
              When you claim one, they become yours alone. Forever.
            </p>
          </div>

          {isLoading && (
            <div className="text-center py-20 text-gray-500 text-sm">
              Finding companions…
            </div>
          )}

          {!isLoading && companions.length === 0 && (
            <div className="text-center py-20">
              <Heart className="h-16 w-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">No companions are available right now. Check back soon.</p>
            </div>
          )}

          {/* Companion grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {companions.map((companion) => (
              <Link key={companion.id} href={`/companions/${companion.id}`}>
                <Card className="bg-gray-900 border-gray-800 hover:border-teal-500/40 transition-all duration-200 cursor-pointer h-full group">
                  <CardContent className="p-5 flex flex-col h-full">

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(companion.avatar_seed ?? companion.name)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                        {getInitials(companion.name)}
                      </div>
                      <div>
                        <h2 className="text-white font-semibold group-hover:text-teal-400 transition-colors">
                          {companion.name}
                        </h2>
                        <p className="text-gray-600 text-xs flex items-center gap-1 mt-0.5">
                          <MessageCircle className="h-3 w-3" />
                          {companion.message_count.toLocaleString()} conversations
                        </p>
                      </div>
                    </div>

                    {/* Soul excerpt */}
                    <p className="text-gray-400 text-xs leading-relaxed flex-1 mb-4">
                      {getBio(companion.soul_md)}
                    </p>

                    {/* Traits */}
                    {companion.traits.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {companion.traits.slice(0, 4).map((trait) => (
                          <span
                            key={trait}
                            className="text-[10px] bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="inline-flex items-center gap-1 text-xs text-teal-500/70">
                        <Heart className="h-3 w-3" />
                        Available
                      </span>
                      <span className="text-xs text-gray-600 flex items-center gap-1 group-hover:text-teal-400 transition-colors">
                        Learn more <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>

                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}
