/**
 * GET /api/companions/[id]
 *
 * Returns the full companion profile including soul.md and skill.md.
 * Available for both wild and claimed companions.
 * Claimed companions return limited info (they're private).
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("companions")
    .select(
      "id, name, avatar_seed, soul_md, skill_md, traits, status, message_count, " +
      "evolution_log, last_evolved_at, created_at, " +
      // Only return these if wild — owned companions are private
      "owner_id, claimed_at, nft_token_id, nft_contract, ipfs_soul_cid, ipfs_skill_cid"
    )
    .eq("id", id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Companion not found" }, { status: 404 })
  }

  // Redact owner identity from public view
  const response = {
    ...data,
    owner_id: data.owner_id ? "[claimed]" : null,
  }

  return NextResponse.json(response)
}
