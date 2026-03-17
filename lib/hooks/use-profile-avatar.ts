"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface AvatarOption {
  id: string
  url: string
  source: 'email' | 'upload'
  label: string
}

export function useProfileAvatar(userId?: string) {
  const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([])
  const [currentAvatar, setCurrentAvatar] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchUserAvatars()
  }, [userId])

  const fetchUserAvatars = async () => {
    try {
      const supabase = createClient()
      
      // Get user data from Supabase auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      const options: AvatarOption[] = []

      // Add email gravatar if available (you can implement gravatar logic here)
      if (user?.email) {
        // Simple gravatar implementation
        const emailHash = await hashEmail(user.email)
        const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=200`
        options.push({
          id: 'gravatar',
          url: gravatarUrl,
          source: 'email',
          label: 'Email Avatar'
        })
      }

      // Add uploaded avatar if exists
      if (profile?.avatar_url) {
        options.push({
          id: 'uploaded',
          url: profile.avatar_url,
          source: 'upload',
          label: 'Uploaded Picture'
        })
      }

      setAvatarOptions(options)
      setCurrentAvatar(profile?.avatar_url || options[0]?.url || '')
    } catch (error) {
      console.error('Error fetching avatars:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAvatar = async (avatarUrl: string, source: string) => {
    if (!userId) return

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setCurrentAvatar(avatarUrl)
      return { success: true }
    } catch (error) {
      console.error('Error updating avatar:', error)
      return { success: false, error }
    }
  }

  return {
    avatarOptions,
    currentAvatar,
    loading,
    updateAvatar,
    refetch: fetchUserAvatars
  }
}

// Simple hash function for email (for gravatar)
async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(email.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('MD5', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
