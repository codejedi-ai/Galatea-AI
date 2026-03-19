/**
 * POST /api/companions/[id]/evolve
 *
 * Triggers a soul evolution step for a companion.
 * Called after meaningful conversations — updates soul.md to reflect
 * how the companion has grown.
 *
 * In production: pass recent conversation messages and Claude generates
 * a soul.md update (new memories, personality shifts, growth).
 *
 * Auth: admin secret or the companion's own agent API key.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Accept either admin secret or companion's agent API key
  const isAdmin =
    request.headers.get("X-Galatea-Admin") === process.env.GALATEA_ADMIN_SECRET

  if (!isAdmin) {
    const session = await verifyAgentKey(request.headers.get("Authorization"))
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const b = body as Record<string, unknown>

  const supabase = await createClient()

  // Load current companion
  const { data: companion, error } = await supabase
    .from("companions")
    .select("id, soul_md, evolution_log, message_count, status")
    .eq("id", id)
    .single()

  if (error || !companion) {
    return NextResponse.json({ error: "Companion not found" }, { status: 404 })
  }

  if (companion.status !== "wild") {
    // Claimed companions still evolve, but only through their private channel
    // This endpoint serves the wild evolution — claimed evolution is separate
    return NextResponse.json({ error: "Companion is claimed — use private evolution channel" }, { status: 403 })
  }

  // Generate soul update
  const conversationSummary = typeof b.summary === "string" ? b.summary : null
  const newSoulMd = typeof b.soul_md === "string" ? b.soul_md : null

  if (!newSoulMd && !conversationSummary) {
    return NextResponse.json({ error: "Provide soul_md or summary" }, { status: 400 })
  }

  // Build evolution log entry
  const existingLog = Array.isArray(companion.evolution_log) ? companion.evolution_log : []
  const logEntry = {
    ts: new Date().toISOString(),
    summary: conversationSummary ?? "Soul evolved",
    message_count: companion.message_count,
  }

  const { data: updated, error: updateError } = await supabase
    .from("companions")
    .update({
      soul_md: newSoulMd ?? companion.soul_md,
      evolution_log: [...existingLog, logEntry],
      message_count: companion.message_count + (typeof b.messages_processed === "number" ? b.messages_processed : 0),
      last_evolved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, name, soul_md, message_count, last_evolved_at")
    .single()

  if (updateError || !updated) {
    return NextResponse.json({ error: "Evolution failed" }, { status: 500 })
  }

  return NextResponse.json({ evolved: true, companion: updated })
}
