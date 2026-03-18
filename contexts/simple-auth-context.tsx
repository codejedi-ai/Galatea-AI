"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  signup: (email: string, password: string, displayName: string) => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  linkWithGoogle: () => Promise<void>
  linkWithFacebook: () => Promise<void>
  unlinkProvider: (providerId: string) => Promise<void>
  updateDisplayName: (displayName: string) => Promise<void>
  updateUserEmail: (email: string) => Promise<void>
  updateUserPassword: (password: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signup: async () => { throw new Error('Not implemented') },
  login: async () => { throw new Error('Not implemented') },
  logout: async () => {},
  loginWithGoogle: async () => {},
  loginWithFacebook: async () => {},
  linkWithGoogle: async () => {},
  linkWithFacebook: async () => {},
  unlinkProvider: async () => {},
  updateDisplayName: async () => {},
  updateUserEmail: async () => {},
  updateUserPassword: async () => {},
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
        setCurrentUser(session?.user ?? null)
        setLoading(false)

        if (session?.user) {
          supabase
            .from('user_profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()
            .then(({ error: profileError }: any) => {
              if (profileError && (profileError.code === 'PGRST116' || profileError.message?.includes('does not exist'))) {
                supabase.rpc('ensure_user_profile_exists', {
                  p_user_id: session.user.id
                }).catch((err: any) => {
                  console.debug('Profile will be created on first access:', err)
                })
              }
            })
            .catch(() => {})
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [mounted])

  const signup = async (email: string, password: string, displayName: string): Promise<User> => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, full_name: displayName } },
    })
    if (error) throw new Error(error.message)
    if (!data.user) throw new Error('Failed to create account')
    return data.user
  }

  const login = async (email: string, password: string): Promise<User> => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    if (!data.user) throw new Error('Failed to sign in')
    return data.user
  }

  const logout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setCurrentUser(null)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const loginWithGoogle = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw new Error(error.message)
  }

  const loginWithFacebook = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw new Error(error.message)
  }

  const linkWithGoogle = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw new Error(error.message)
  }

  const linkWithFacebook = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.linkIdentity({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw new Error(error.message)
  }

  const unlinkProvider = async (providerId: string) => {
    if (!currentUser) throw new Error('No user logged in')
    const supabase = createClient()
    const identity = currentUser.identities?.find((i) => i.provider === providerId)
    if (!identity) throw new Error(`No linked identity for provider: ${providerId}`)
    const { error } = await supabase.auth.unlinkIdentity(identity)
    if (error) throw new Error(error.message)
  }

  const updateDisplayName = async (displayName: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: displayName, full_name: displayName },
    })
    if (error) throw new Error(error.message)
    if (data.user) setCurrentUser(data.user)
  }

  const updateUserEmail = async (email: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.updateUser({ email })
    if (error) throw new Error(error.message)
    if (data.user) setCurrentUser(data.user)
  }

  const updateUserPassword = async (password: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(error.message)
  }

  const refreshUser = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.refreshSession()
      if (session?.user) {
        setCurrentUser(session.user)
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
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
        signup,
        login,
        logout,
        loginWithGoogle,
        loginWithFacebook,
        linkWithGoogle,
        linkWithFacebook,
        unlinkProvider,
        updateDisplayName,
        updateUserEmail,
        updateUserPassword,
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
