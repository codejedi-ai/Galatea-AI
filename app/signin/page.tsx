"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/auth/auth-card"
import { Logo } from "@/components/logo"
import { LoadingScreen } from "@/components/loading"
import Image from "next/image"

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Authenticating...")

  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setLoadingMessage("Authenticating...")

      // Simulate authentication process with different loading messages
      await new Promise((resolve) =>
        setTimeout(() => {
          setLoadingMessage("Verifying credentials...")
          resolve(null)
        }, 1500),
      )

      await new Promise((resolve) =>
        setTimeout(() => {
          setLoadingMessage("Loading your profile...")
          resolve(null)
        }, 1500),
      )

      await new Promise((resolve) =>
        setTimeout(() => {
          setLoadingMessage("Almost there...")
          resolve(null)
        }, 1000),
      )

      // Simulate successful login
      router.push("/dashboard")
    } catch (err) {
      setIsLoading(false)
      setError("Invalid email or password. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Loading Screen */}
      {isLoading && <LoadingScreen message={loadingMessage} />}

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="signin.png"
          alt="Galatea background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 backdrop-blur-sm"></div>
      </div>

      {/* Logo */}
      <div className="absolute top-8 left-8 z-10">
        <Logo size="medium" />
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-4xl">
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg mb-4 max-w-4xl mx-auto">
            {error}
          </div>
        )}
        <AuthCard onSignIn={handleSignIn} />
      </div>

      {/* Animated particles */}
      <div className="particles"></div>
    </div>
  )
}
