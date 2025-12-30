/**
 * Client-side library for calling Supabase Edge Functions
 * All database and file operations should go through Edge Functions for security
 */

import { createClient } from "@/utils/supabase/client"

import { getEdgeFunctionsUrl } from "@/lib/config/supabase-config"

const getSupabaseUrl = () => {
  try {
    return getEdgeFunctionsUrl().replace('/functions/v1', '')
  } catch {
    const url = process.env.PROJECT_URL
    if (!url) {
      throw new Error('PROJECT_URL is not set in .env.local file')
    }
    return url
  }
}

const getAuthToken = async () => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('User not authenticated')
  }
  return session.access_token
}

const callEdgeFunction = async (
  functionName: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: any
    searchParams?: Record<string, string>
  } = {}
) => {
  const { method = 'GET', body, searchParams } = options
  const supabaseUrl = getSupabaseUrl()
  const token = await getAuthToken()

  const url = new URL(`${supabaseUrl}/functions/v1/${functionName}`)
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || `Failed to call ${functionName}: ${response.statusText}`)
  }

  return await response.json()
}

// Edge Functions API
export const edgeFunctions = {
  // Initialization - Call this once on app startup for blank Supabase instances
  async initialize() {
    const supabaseUrl = getSupabaseUrl()
    const token = await getAuthToken()

    const response = await fetch(`${supabaseUrl}/functions/v1/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `Failed to initialize: ${response.statusText}`)
    }

    return await response.json()
  },

  // Companions
  async getCompanions(limit = 10) {
    const result = await callEdgeFunction('get-companions', {
      searchParams: { limit: limit.toString() }
    })
    return result.data || []
  },

  async getCompanionById(id: string) {
    const result = await callEdgeFunction('get-companions', {
      searchParams: { id }
    })
    return result.data
  },

  // User Profile
  async getUserProfile() {
    const result = await callEdgeFunction('get-user-profile')
    return result.data
  },

  async getUserPreferences() {
    const result = await callEdgeFunction('get-user-profile', {
      searchParams: { type: 'preferences' }
    })
    return result.data
  },

  async getUserStats() {
    const result = await callEdgeFunction('get-user-profile', {
      searchParams: { type: 'stats' }
    })
    return result.data
  },

  async updateUserProfile(updates: any) {
    const result = await callEdgeFunction('update-user-profile', {
      method: 'POST',
      body: { updates, type: 'profile' }
    })
    return result.data
  },

  async updateUserPreferences(updates: any) {
    const result = await callEdgeFunction('update-user-profile', {
      method: 'POST',
      body: { updates, type: 'preferences' }
    })
    return result.data
  },

  async updateUserStats(updates: any) {
    const result = await callEdgeFunction('update-user-profile', {
      method: 'POST',
      body: { updates, type: 'stats' }
    })
    return result.data
  },

  async updateLastActive() {
    await callEdgeFunction('update-user-profile', {
      method: 'POST',
      body: { type: 'last_active' }
    })
  },

  // Conversations
  async getConversations() {
    const result = await callEdgeFunction('get-conversations')
    return result.data || []
  },

  async getConversationById(id: string, includeMessages = false, limit = 50, offset = 0) {
    const result = await callEdgeFunction('get-conversations', {
      searchParams: {
        id,
        messages: includeMessages ? 'true' : 'false',
        limit: limit.toString(),
        offset: offset.toString()
      }
    })
    return result.data
  },

  async sendMessage(conversationId: string, content: string, messageType = 'text', metadata = {}) {
    const result = await callEdgeFunction('send-message', {
      method: 'POST',
      body: { conversation_id: conversationId, content, message_type: messageType, metadata }
    })
    return result.data
  },

  // Matches
  async getMatches(withDetails = false) {
    const result = await callEdgeFunction('get-matches', {
      searchParams: { details: withDetails ? 'true' : 'false' }
    })
    return result.data || []
  },

  async getMatchById(id: string) {
    const result = await callEdgeFunction('get-matches', {
      searchParams: { id }
    })
    return result.data
  },

  // Swipes
  async processSwipe(companionId: string, decision: 'like' | 'pass' | 'super_like') {
    const result = await callEdgeFunction('process-swipe', {
      method: 'POST',
      body: { companion_id: companionId, decision }
    })
    return result.data
  },

  // Matches
  async deactivateMatch(matchId: string) {
    await callEdgeFunction('deactivate-match', {
      method: 'POST',
      body: { match_id: matchId }
    })
  },

  // Conversations
  async markMessagesAsRead(conversationId: string) {
    await callEdgeFunction('mark-messages-read', {
      method: 'POST',
      body: { conversation_id: conversationId }
    })
  },

  async updateConversationStatus(conversationId: string, status: 'active' | 'archived' | 'blocked') {
    await callEdgeFunction('update-conversation-status', {
      method: 'POST',
      body: { conversation_id: conversationId, status }
    })
  },

  // Companions - Create/Update/Delete
  async createCompanion(companion: any) {
    const result = await callEdgeFunction('create-companion', {
      method: 'POST',
      body: { companion }
    })
    return result.data
  },

  async updateCompanion(id: string, updates: any) {
    const result = await callEdgeFunction('update-companion', {
      method: 'POST',
      body: { id, updates }
    })
    return result.data
  },

  async deleteCompanion(id: string) {
    await callEdgeFunction('delete-companion', {
      method: 'POST',
      body: { id }
    })
  },

  async getRecommendedCompanions(limit = 10) {
    const result = await callEdgeFunction('get-recommended-companions', {
      searchParams: { limit: limit.toString() }
    })
    return result.data || []
  },

  // User Profile - Ensure exists
  async ensureUserProfile() {
    await callEdgeFunction('ensure-user-profile', {
      method: 'POST'
    })
  },

  // Storage - Avatar
  async uploadAvatar(file: File): Promise<string> {
    const supabaseUrl = getSupabaseUrl()
    const token = await getAuthToken()

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${supabaseUrl}/functions/v1/upload-avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `Failed to upload avatar: ${response.statusText}`)
    }

    const result = await response.json()
    if (!result.success || !result.url) {
      throw new Error(result.error || 'Failed to upload avatar')
    }

    return result.url
  },
}

