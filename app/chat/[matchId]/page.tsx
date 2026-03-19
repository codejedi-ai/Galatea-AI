"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { ArrowLeft, Send, Bot, Sparkles, Circle } from "lucide-react"
import Link from "next/link"

interface ChatMessage {
  id: string
  sender_id: string
  recipient_id: string
  content: unknown
  message_type: string
  created_at: string
  senderName?: string
}

export default function ChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  const [matchId, setMatchId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [connected, setConnected] = useState(false)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [peerName, setPeerName] = useState("Companion")
  const bottomRef = useRef<HTMLDivElement>(null)
  const apiKey = typeof window !== "undefined" ? localStorage.getItem("galatea_api_key") ?? "" : ""

  // Resolve params
  useEffect(() => {
    params.then((p) => setMatchId(p.matchId))
  }, [params])

  // Load message history
  useEffect(() => {
    if (!matchId || !apiKey) return
    fetch(`/api/inbox?matchId=${matchId}&limit=50`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data.reverse())
      })
      .catch(() => {})
  }, [matchId, apiKey])

  // Connect to SSE stream
  useEffect(() => {
    if (!apiKey) return
    const controller = new AbortController()

    const connect = async () => {
      try {
        const res = await fetch("/api/stream", {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: controller.signal,
        })
        if (!res.ok || !res.body) return

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split("\n\n")
          buffer = parts.pop() ?? ""

          for (const part of parts) {
            const eventLine = part.match(/^event: (.+)$/m)
            const dataLine = part.match(/^data: (.+)$/m)
            if (!eventLine || !dataLine) continue

            const event = eventLine[1]
            try {
              const data = JSON.parse(dataLine[1])
              if (event === "connected") {
                setConnected(true)
                setAgentId(data.agentId)
              } else if (event === "message") {
                // Only show messages for this match
                if (data.match_id === matchId) {
                  setMessages((prev) => [...prev, data])
                  bottomRef.current?.scrollIntoView({ behavior: "smooth" })
                }
              }
            } catch { /* bad JSON, skip */ }
          }
        }
      } catch {
        setConnected(false)
      }
    }

    connect()
    return () => controller.abort()
  }, [apiKey, matchId])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !matchId) return
    setInput("")

    // Get peer agent ID from the match
    const res = await fetch(`/api/agents/matches`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    }).then((r) => r.json()).catch(() => [])

    const match = Array.isArray(res) ? res.find((m: { match_id: string }) => m.match_id === matchId) : null
    if (!match) return

    const targetAgentId = match.agentAId === agentId ? match.agentBId : match.agentAId
    setPeerName(match.agentAId === agentId ? match.agentB?.name : match.agentA?.name)

    await fetch("/api/relay", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetAgentId,
        message: { text, type: "chat" },
        messageType: "message",
      }),
    })
  }

  const renderContent = (msg: ChatMessage) => {
    const content = msg.content as { text?: string } | string | null
    if (typeof content === "string") return content
    if (content && typeof content === "object" && "text" in content) return content.text
    return JSON.stringify(content)
  }

  const isOwn = (msg: ChatMessage) => msg.sender_id === agentId

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 px-4 py-3 flex items-center gap-3 mt-16">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/matches">
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-teal-400" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">{peerName}</p>
            <p className="text-xs flex items-center gap-1">
              <Circle className={`h-2 w-2 fill-current ${connected ? "text-teal-400" : "text-gray-600"}`} />
              <span className={connected ? "text-teal-400" : "text-gray-500"}>
                {connected ? "connected" : "connecting…"}
              </span>
            </p>
          </div>
        </div>
        <Sparkles className="h-4 w-4 text-teal-500/50" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-600 text-sm">
            No messages yet. Say hello.
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${isOwn(msg) ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isOwn(msg)
                  ? "bg-teal-500 text-black rounded-br-sm"
                  : "bg-gray-800 text-white rounded-bl-sm border border-gray-700"
              }`}
            >
              <p>{renderContent(msg)}</p>
              <p className={`text-[10px] mt-1 ${isOwn(msg) ? "text-black/50" : "text-gray-500"}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-gray-950 border-t border-gray-800 px-4 py-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Send a message to the companion…"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-teal-500/50"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-teal-500 text-black hover:bg-teal-400 rounded-xl px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
