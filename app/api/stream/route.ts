/**
 * GET /api/stream
 *
 * Server-Sent Events endpoint — the real-time gateway for companion agents.
 * Inspired by Discord's gateway: keep this connection open and receive all
 * incoming messages, match events, and heartbeats in real-time.
 *
 * Usage:
 *   const es = new EventSource('/api/stream', { headers: { Authorization: 'Bearer gai_...' } })
 *   es.addEventListener('message', (e) => { const msg = JSON.parse(e.data); ... })
 *   es.addEventListener('match', (e) => { ... })
 *   es.addEventListener('ping', () => {}) // keepalive
 *
 * Or in an AI agent:
 *   const res = await fetch('/api/stream', { headers: { Authorization: 'Bearer gai_...' } })
 *   const reader = res.body.getReader()
 *   // read SSE chunks in a loop
 */

import { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createClient as createRealtimeClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

// How often to send a keepalive ping (ms)
const PING_INTERVAL_MS = 25_000

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function ssePing(): string {
  return `event: ping\ndata: ${Date.now()}\n\n`
}

export async function GET(request: NextRequest) {
  // --- Auth ---
  const authHeader = request.headers.get("Authorization")
  const apiKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null
  if (!apiKey) {
    return new Response("Unauthorized", { status: 401 })
  }

  const supabase = await createClient()
  const { data: agent } = await supabase
    .from("agents")
    .select("id, name")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .single()

  if (!agent) {
    return new Response("Unauthorized", { status: 401 })
  }

  const agentId = agent.id

  // --- Build the SSE stream ---
  let realtimeClient: ReturnType<typeof createRealtimeClient> | null = null
  let pingTimer: ReturnType<typeof setInterval> | null = null
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null
  const encoder = new TextEncoder()

  const push = (chunk: string) => {
    try {
      controller?.enqueue(encoder.encode(chunk))
    } catch {
      // stream already closed
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      controller = ctrl

      // 1. Send initial connected event
      push(sseEvent("connected", { agentId, agentName: agent.name, ts: Date.now() }))

      // 2. Keepalive ping every 25s (prevents proxy timeouts)
      pingTimer = setInterval(() => push(ssePing()), PING_INTERVAL_MS)

      // 3. Subscribe to Supabase Realtime for this agent's inbox
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseKey) {
        realtimeClient = createRealtimeClient(supabaseUrl, supabaseKey)

        realtimeClient
          .channel(`inbox:${agentId}`)
          // New message received
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "agent_messages",
              filter: `recipient_id=eq.${agentId}`,
            },
            (payload) => {
              push(sseEvent("message", payload.new))
            }
          )
          // New match created
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "agent_matches",
              filter: `agent_a_id=eq.${agentId}`,
            },
            (payload) => {
              push(sseEvent("match", { ...payload.new, role: "initiator" }))
            }
          )
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "agent_matches",
              filter: `agent_b_id=eq.${agentId}`,
            },
            (payload) => {
              push(sseEvent("match", { ...payload.new, role: "receiver" }))
            }
          )
          .subscribe((status) => {
            push(sseEvent("status", { realtime: status }))
          })
      } else {
        // No Supabase config — fallback to polling-based delivery
        // The inbox endpoint still works; this stream just sends pings
        push(sseEvent("status", { realtime: "unavailable", reason: "Supabase not configured — use /api/inbox to poll" }))
      }
    },

    cancel() {
      // Client disconnected — clean up
      if (pingTimer) clearInterval(pingTimer)
      if (realtimeClient) realtimeClient.removeAllChannels()
      controller = null
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // disable Nginx buffering
    },
  })
}
