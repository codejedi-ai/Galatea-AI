"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  async function linkWithGoogle() {
    if (!currentUser) throw new Error("No user logged in")

    try {
      const provider = new GoogleAuthProvider()
      const { linkWithPopup } = await import("firebase/auth")
      await linkWithPopup(currentUser, provider)
    } catch (error: any) {
      console.error("Error linking Google account:", error)
      throw new Error(error.message || "Failed to link Google account")
    }
  }

  async function linkWithFacebook() {
    if (!currentUser) throw new Error("No user logged in")

    try {
      const provider = new FacebookAuthProvider()
      const { linkWithPopup } = await import("firebase/auth")
      await linkWithPopup(currentUser, provider)
    } catch (error: any) {
      console.error("Error linking Facebook account:", error)
      throw new Error(error.message || "Failed to link Facebook account")
    }
  }

  async function unlinkProvider(providerId: string) {
    if (!currentUser) throw new Error("No user logged in")

    try {
      const { unlink } = await import("firebase/auth")
      await unlink(currentUser, providerId)
    } catch (error: any) {
      console.error("Error unlinking provider:", error)
      throw new Error(error.message || "Failed to unlink account")
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only start auth operations after component is mounted
    if (!mounted) return

    let supabase: any = null;
    
    try {
      supabase = createClient()
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      setLoading(false)
      return
    }

    // Get initial session
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        setCurrentUser(session?.user ?? null)
        setLoading(false)
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

  return (
    <AuthContext.Provider value={{ currentUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
