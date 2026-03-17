import { edgeFunctions } from "@/lib/edge-functions"

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

/**
 * Ensures a user profile exists via Edge Function
 */
async function ensureUserProfileExists(userId: string): Promise<void> {
  await edgeFunctions.ensureUserProfile()
}

export async function getUserProfile(): Promise<UserProfile | null> {
  return await edgeFunctions.getUserProfile()
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  return await edgeFunctions.updateUserProfile(updates)
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  return await edgeFunctions.getUserPreferences()
}

export async function updateUserPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
  return await edgeFunctions.updateUserPreferences(updates)
}

export async function getUserStats(): Promise<UserStats | null> {
  return await edgeFunctions.getUserStats()
}

export async function updateLastActive(): Promise<void> {
  await edgeFunctions.updateLastActive()
}
