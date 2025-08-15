import { createClient } from "@/lib/supabase/client"
import type { Companion } from "./companions"

export interface Match {
  id: string
  user_id: string
  companion_id: string
  matched_at: string
  is_active: boolean
  companion?: Companion
}

export async function getUserMatches(): Promise<Match[]> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      companion:companions(*)
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("matched_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch matches: ${error.message}`)
  }

  return data || []
}

export async function getMatchById(matchId: string): Promise<Match | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      companion:companions(*)
    `)
    .eq("id", matchId)
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(`Failed to fetch match: ${error.message}`)
  }

  return data
}

export async function deactivateMatch(matchId: string): Promise<void> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { error } = await supabase.from("matches").update({ is_active: false }).eq("id", matchId).eq("user_id", user.id)

  if (error) {
    throw new Error(`Failed to deactivate match: ${error.message}`)
  }
}
