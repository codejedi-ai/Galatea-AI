import { createClient } from "@/utils/supabase/client"
import { createClient as createServerClient } from "@/utils/supabase/server"
import { edgeFunctions } from "@/lib/edge-functions"

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

// Client-side functions - now use Edge Functions
export async function getRecommendedCompanions(limit = 10): Promise<Companion[]> {
  return await edgeFunctions.getRecommendedCompanions(limit)
}

export async function getAllCompanions(): Promise<Companion[]> {
  return await edgeFunctions.getCompanions()
}

export async function getCompanionById(id: string): Promise<Companion | null> {
  return await edgeFunctions.getCompanionById(id)
}

// Server-side functions - now use Edge Functions
export async function createCompanion(
  companion: Omit<Companion, "id" | "created_at" | "updated_at">,
): Promise<Companion> {
  return await edgeFunctions.createCompanion(companion)
}

export async function updateCompanion(id: string, updates: Partial<Companion>): Promise<Companion> {
  return await edgeFunctions.updateCompanion(id, updates)
}

export async function deleteCompanion(id: string): Promise<void> {
  await edgeFunctions.deleteCompanion(id)
}
