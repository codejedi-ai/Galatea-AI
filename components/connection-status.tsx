"use client"

import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"

interface ConnectionStatusProps {
  matchId: string
  apiKey: string
}

export function ConnectionStatus({ matchId, apiKey }: ConnectionStatusProps) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!apiKey) return
    // Poll inbox count every 30 seconds
    const check = async () => {
      try {
        const res = await fetch(`/api/inbox?matchId=${matchId}&unreadOnly=true`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        if (res.ok) {
          const data = await res.json()
          setUnread(Array.isArray(data) ? data.length : 0)
        }
      } catch { /* ignore */ }
    }
    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [matchId, apiKey])

  if (unread === 0) return null

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30">
      <MessageCircle className="h-3 w-3" />
      {unread} pending
    </span>
  )
}
