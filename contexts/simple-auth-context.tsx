"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
})

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let supabase: any = null;

    try {
      supabase = createClient()
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      setLoading(false)
      return
    }

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setCurrentUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error("Error getting initial session:", error)
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        // Update user state immediately without blocking
        setCurrentUser(session?.user ?? null)
        setLoading(false)
        
        // Check/create profile in background (non-blocking)
        if (session?.user) {
          // Don't await - let it run in background
          supabase
            .from('user_profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()
            .then(({ error: profileError }) => {
              if (profileError && (profileError.code === 'PGRST116' || profileError.message?.includes('does not exist'))) {
                // Try to create profile via RPC (non-blocking)
                supabase.rpc('ensure_user_profile_exists', {
                  p_user_id: session.user.id
                }).catch(err => {
                  console.debug('Profile will be created on first access:', err)
                })
              }
            })
            .catch(() => {
              // Silently ignore - profile will be created when needed
            })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [mounted])

  const logout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setCurrentUser(null)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const refreshUser = async () => {
    try {
      const supabase = createClient()
      // Refresh the session to get latest user data
      const { data: { session } } = await supabase.auth.refreshSession()
      if (session?.user) {
        setCurrentUser(session.user)
      } else {
        // Fallback: get user directly
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      // Fallback: try to get user directly
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)
      } catch (fallbackError) {
        console.error("Error in fallback user refresh:", fallbackError)
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a SimpleAuthProvider')
  }
  return context
}
