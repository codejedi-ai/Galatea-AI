/**
 * GET  /api/companions        — browse wild (unclaimed) companions
 * POST /api/companions        — create a new companion (Galatea admin only)
 *
 * Wild companions are entities Galatea creates and evolves. Humans browse
 * them here, read their soul.md, and decide who to claim.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

// --- GET: browse wild companions ---
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50)
  const cursor = searchParams.get("cursor") // created_at ISO for pagination

  const supabase = await createClient()

  let query = supabase
    .from("companions")
    .select("id, name, avatar_seed, soul_md, skill_md, traits, message_count, last_evolved_at, created_at")
    .eq("status", "wild")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt("created_at", cursor)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// --- POST: create a companion (admin — requires GALATEA_ADMIN_SECRET header) ---
export async function POST(request: NextRequest) {
  const adminSecret = request.headers.get("X-Galatea-Admin")
  if (!adminSecret || adminSecret !== process.env.GALATEA_ADMIN_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const name = typeof b.name === "string" ? b.name.trim() : null
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("companions")
    .insert({
      name,
      avatar_seed: typeof b.avatar_seed === "string" ? b.avatar_seed : name.toLowerCase().replace(/\s+/g, "-"),
      soul_md: typeof b.soul_md === "string" ? b.soul_md : "",
      skill_md: typeof b.skill_md === "string" ? b.skill_md : "",
      system_prompt: typeof b.system_prompt === "string" ? b.system_prompt : "",
      traits: Array.isArray(b.traits) ? b.traits : [],
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
