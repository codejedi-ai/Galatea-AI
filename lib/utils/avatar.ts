import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

/**
 * Get the user's profile picture URL via Edge Function
 * Returns null if no profile picture exists (use placeholder)
 */
export async function getUserAvatarUrl(user: User | null | undefined, cacheBust?: boolean): Promise<string | null> {
  if (!user) return null
  
  try {
    const supabase = createClient()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not set')
      return null
    }

    // Get auth token
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return null
    }

    // Call Edge Function
    const url = new URL(`${supabaseUrl}/functions/v1/get-profile-picture`)
    if (cacheBust) {
      url.searchParams.set('cacheBust', 'true')
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return null
      }
      const error = await response.json().catch(() => ({}))
      console.debug('Error fetching profile picture:', error.error || response.statusText)
      return null
    }

    const result = await response.json()
    
    if (!result.success || !result.url) {
      return null
    }
    
    return result.url
  } catch (error: any) {
    // Catch any unexpected errors and return null gracefully
    console.debug('Error fetching profile picture:', error?.message || error)
    return null
  }
}

/**
 * Get the user's avatar URL with a fallback placeholder
 */
export async function getUserAvatarUrlWithFallback(user: User | null | undefined): Promise<string> {
  const url = await getUserAvatarUrl(user)
  return url || '/placeholder.svg'
}

