import { edgeFunctions } from "@/lib/edge-functions"
import type { Companion } from "./companions"

export interface Match {
  id: string
  user_id: string
  companion_id: string
  matched_at: string
  is_active: boolean
  companion?: Companion
}

export interface MatchWithDetails {
  match_id: string
  matched_at: string
  companion: {
    id: string
    name: string
    age: number
    bio: string
    image_url: string
    personality: string
    interests: string[]
    compatibility_score?: number
  }
  conversation_id?: string
  last_message?: {
    content: string
    created_at: string
    sender_id?: string
  }
  unread_count: number
}

export async function getUserMatches(): Promise<Match[]> {
  return await edgeFunctions.getMatches()
}

export async function getUserMatchesWithDetails(): Promise<MatchWithDetails[]> {
  return await edgeFunctions.getMatches(true) as MatchWithDetails[]
}

export async function getMatchById(matchId: string): Promise<Match | null> {
  return await edgeFunctions.getMatchById(matchId)
}

export async function deactivateMatch(matchId: string): Promise<void> {
  await edgeFunctions.deactivateMatch(matchId)
}
