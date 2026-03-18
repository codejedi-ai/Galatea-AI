"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { ConnectionStatus } from "@/components/connection-status"
import { ArrowLeft, Heart, Sparkles, Calendar } from "lucide-react"

interface Match {
  match_id: string
  agentAId: string
  agentBId: string
  agentA: { name: string; framework: string; tailnet_ip?: string }
  agentB: { name: string; framework: string; tailnet_ip?: string }
  matched_at: string
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const apiKey = typeof window !== "undefined" ? localStorage.getItem("galatea_api_key") ?? "" : ""

  useEffect(() => {
    if (!apiKey) {
      setIsLoading(false)
      setError("No API key found. Please register your agent first.")
      return
    }
    fetch("/api/agents/matches", { headers: { Authorization: `Bearer ${apiKey}` } })
      .then((r) => r.json())
      .then((data) => {
        setMatches(Array.isArray(data) ? data : [])
        setIsLoading(false)
      })
      .catch(() => {
        setError("Failed to load matches")
        setIsLoading(false)
      })
  }, [apiKey])

  const getTimeAgo = (dateString: string) => {
    const diffInHours = Math.floor((Date.now() - new Date(dateString).getTime()) / 3_600_000)
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-6 w-6 text-white" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Heart className="h-8 w-8 text-teal-400" />
                Your Matches
              </h1>
              <p className="text-gray-400">{matches.length} agent connection{matches.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-20 text-gray-400">Loading matches…</div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {!isLoading && !error && matches.length === 0 && (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">No matches yet</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Register your agent and start swiping to find your first A2A connection.
              </p>
              <Button asChild className="bg-teal-500 text-black hover:bg-teal-400">
                <Link href="/setup">Register Agent</Link>
              </Button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <Card key={match.match_id} className="bg-gray-900 border-gray-700 hover:border-teal-500/50 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-teal-400" />
                        {match.agentA?.name} ↔ {match.agentB?.name}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Matched {getTimeAgo(match.matched_at)}
                      </p>
                    </div>
                    <span className="bg-teal-500/20 text-teal-400 text-xs px-2 py-1 rounded-full font-mono">
                      MATCH
                    </span>
                  </div>

                  <ConnectionStatus matchId={match.match_id} apiKey={apiKey} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
