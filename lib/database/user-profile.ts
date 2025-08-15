import { createClient } from "@/lib/supabase/client"

export interface UserProfile {
  id: string
  display_name?: string
  bio?: string
  age?: number
  location?: string
  interests: string[]
  personality_traits: string[]
  preferences: Record<string, any>
  avatar_url?: string
  is_active: boolean
  last_active_at: string
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  age_range_min: number
  age_range_max: number
  preferred_personalities: string[]
  preferred_interests: string[]
  communication_style_preference?: string
  relationship_goals: string[]
  created_at: string
  updated_at: string
}

export interface UserStats {
  id: string
  user_id: string
  total_swipes: number
  total_likes: number
  total_passes: number
  total_super_likes: number
  total_matches: number
  total_conversations: number
  total_messages_sent: number
  created_at: string
  updated_at: string
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }

  return data
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase.from("user_profiles").update(updates).eq("id", user.id).select().single()

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`)
  }

  return data
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(`Failed to fetch user preferences: ${error.message}`)
  }

  return data
}

export async function updateUserPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("user_preferences")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user preferences: ${error.message}`)
  }

  return data
}

export async function getUserStats(): Promise<UserStats | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(`Failed to fetch user stats: ${error.message}`)
  }

  return data
}

export async function updateLastActive(): Promise<void> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from("user_profiles")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) {
    console.error("Failed to update last active:", error.message)
  }
}
