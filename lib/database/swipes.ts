import { createClient } from "@/lib/supabase/client"

export type SwipeDecision = "like" | "pass" | "super_like"

export interface SwipeDecisionRecord {
  id: string
  user_id: string
  companion_id: string
  decision: SwipeDecision
  created_at: string
}

export async function recordSwipeDecision(companionId: string, decision: SwipeDecision): Promise<SwipeDecisionRecord> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("swipe_decisions")
    .insert([
      {
        user_id: user.id,
        companion_id: companionId,
        decision,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to record swipe decision: ${error.message}`)
  }

  return data
}

export async function getUserSwipeDecisions(): Promise<SwipeDecisionRecord[]> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("swipe_decisions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch swipe decisions: ${error.message}`)
  }

  return data || []
}

export async function hasUserSwipedCompanion(companionId: string): Promise<boolean> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from("swipe_decisions")
    .select("id")
    .eq("user_id", user.id)
    .eq("companion_id", companionId)
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to check swipe status: ${error.message}`)
  }

  return !!data
}
