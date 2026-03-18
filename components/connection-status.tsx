"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, Loader2, Unplug } from "lucide-react"

type ConnectionState = "connecting" | "connected" | "offline"

interface ConnectionData {
  peerTailnetIP: string
  peerA2AEndpoint: string
  connectionEstablishedAt: string
  latency?: { latency_ms: number; created_at: string } | null
}

interface ConnectionStatusProps {
  matchId: string
  apiKey: string
  onDisconnect?: (matchId: string) => void
}

function getLatencyColor(ms: number): string {
  if (ms < 20) return "text-green-400"
  if (ms < 100) return "text-yellow-400"
  return "text-red-400"
}

function getLatencyLabel(ms: number): string {
  if (ms < 20) return "Excellent"
  if (ms < 100) return "Good"
  return "Poor"
}

export function ConnectionStatus({ matchId, apiKey, onDisconnect }: ConnectionStatusProps) {
  const [state, setState] = useState<ConnectionState>("connecting")
  const [connection, setConnection] = useState<ConnectionData | null>(null)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConnection = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/matches/${matchId}/connection`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })

      if (res.ok) {
        const data: ConnectionData = await res.json()
        setConnection(data)
        setState("connected")
        setError(null)
      } else if (res.status === 404) {
        setState("offline")
      } else {
        setState("offline")
        setError("Connection unavailable")
      }
    } catch {
      setState("offline")
      setError("Network error")
    }
  }, [matchId, apiKey])

  useEffect(() => {
    fetchConnection()
    // Poll every 30 seconds
    const interval = setInterval(fetchConnection, 30_000)
    return () => clearInterval(interval)
  }, [fetchConnection])

  const handleDisconnect = async () => {
    if (!onDisconnect) return
    setIsDisconnecting(true)
    try {
      onDisconnect(matchId)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* State badge */}
      {state === "connecting" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">
          <Loader2 className="h-3 w-3 animate-spin" />
          Connecting
        </span>
      )}

      {state === "connected" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30">
          <Wifi className="h-3 w-3" />
          Connected
        </span>
      )}

      {state === "offline" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
          <WifiOff className="h-3 w-3" />
          Offline
        </span>
      )}

      {/* Latency indicator */}
      {state === "connected" && connection?.latency && (
        <span className={`text-xs font-mono ${getLatencyColor(connection.latency.latency_ms)}`}>
          {connection.latency.latency_ms}ms ({getLatencyLabel(connection.latency.latency_ms)})
        </span>
      )}

      {/* Error message */}
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}

      {/* Disconnect button */}
      {onDisconnect && state === "connected" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="h-6 px-2 text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10"
          title="Disconnect and revoke ACL"
        >
          {isDisconnecting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Unplug className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  )
}
