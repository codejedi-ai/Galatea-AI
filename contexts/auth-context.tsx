"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  signup: (email: string, password: string, displayName: string) => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<User>
  loginWithFacebook: () => Promise<User>
  linkWithGoogle: () => Promise<void>
  linkWithFacebook: () => Promise<void>
  unlinkProvider: (providerId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function signup(email: string, password: string, displayName: string) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName })
      return user
    } catch (error: any) {
      console.error("Error in signup:", error)
      throw new Error(error.message || "Failed to create account")
    }
  }

  async function login(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error: any) {
      console.error("Error in login:", error)
      throw new Error(error.message || "Failed to sign in")
    }
  }

  async function logout() {
    try {
      await signOut(auth)
    } catch (error: any) {
      console.error("Error in logout:", error)
      throw new Error(error.message || "Failed to sign out")
    }
  }

  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      return result.user
    } catch (error: any) {
      console.error("Error in Google login:", error)
      throw new Error(error.message || "Failed to sign in with Google")
    }
  }

  async function loginWithFacebook() {
    try {
      const provider = new FacebookAuthProvider()
      const result = await signInWithPopup(auth, provider)
      return result.user
    } catch (error: any) {
      console.error("Error in Facebook login:", error)
      throw new Error(error.message || "Failed to sign in with Facebook")
    }
  }

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
