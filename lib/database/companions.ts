import { createClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"

export interface Companion {
  id: string
  name: string
  age: number
  bio: string
  personality: string
  interests: string[]
  personality_traits: string[]
  communication_style: string
  learning_capacity?: string
  backstory?: string
  favorite_topics: string[]
  relationship_goals: string[]
  image_url: string
  compatibility_score?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Client-side functions
export async function getRecommendedCompanions(limit = 10): Promise<Companion[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_recommended_companions", {
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
    p_limit: limit,
  })

  if (error) {
    throw new Error(`Failed to fetch recommended companions: ${error.message}`)
  }

  return data || []
}

export async function getAllCompanions(): Promise<Companion[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("companions")
    .select("*")
    .eq("is_active", true)
    .order("compatibility_score", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch companions: ${error.message}`)
  }

  return data || []
}

export async function getCompanionById(id: string): Promise<Companion | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("companions").select("*").eq("id", id).eq("is_active", true).single()

  if (error) {
    if (error.code === "PGRST116") return null // Not found
    throw new Error(`Failed to fetch companion: ${error.message}`)
  }

  return data
}

// Server-side functions
export async function createCompanion(
  companion: Omit<Companion, "id" | "created_at" | "updated_at">,
): Promise<Companion> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("companions").insert([companion]).select().single()

  if (error) {
    throw new Error(`Failed to create companion: ${error.message}`)
  }

  return data
}

export async function updateCompanion(id: string, updates: Partial<Companion>): Promise<Companion> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("companions").update(updates).eq("id", id).select().single()

  if (error) {
    throw new Error(`Failed to update companion: ${error.message}`)
  }

  return data
}

export async function deleteCompanion(id: string): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase.from("companions").update({ is_active: false }).eq("id", id)

  if (error) {
    throw new Error(`Failed to delete companion: ${error.message}`)
  }
}
