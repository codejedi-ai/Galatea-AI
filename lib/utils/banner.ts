import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

/**
 * Get the user's banner URL via Edge Function
 * Returns null if no banner exists
 */
export async function getUserBannerUrl(user: User | null | undefined, cacheBust?: boolean): Promise<string | null> {
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
    const url = new URL(`${supabaseUrl}/functions/v1/get-banner`)
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
      console.debug('Error fetching banner:', error.error || response.statusText)
      return null
    }

    const result = await response.json()
    
    if (!result.success || !result.url) {
      return null
    }
    
    return result.url
  } catch (error: any) {
    console.debug('Error fetching banner:', error?.message || error)
    return null
  }
}

/**
 * Get the user's banner URL with a fallback placeholder
 */
export async function getUserBannerUrlWithFallback(user: User | null | undefined): Promise<string> {
  const bannerUrl = await getUserBannerUrl(user)
  return bannerUrl || '/placeholder-banner.svg'
}

