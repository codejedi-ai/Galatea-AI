"use client"

import { useAuth } from "@/contexts/AuthContext"
import { AuthForm } from "@/components/auth-form"
import { LoadingSpinner } from "@/components/loading-spinner"
import Image from "next/image"

interface AuthProps {
  initialError?: string | null
  initialSuccessMessage?: string | null
}

export function Auth({ initialError, initialSuccessMessage }: AuthProps) {
  const { isLoggedIn, loading, currentUser } = useAuth()

  // Show loading state during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/favicon.png"
                alt="Galatea.AI Logo"
                width={60}
                height={60}
                className="filter brightness-0 invert"
              />
            </div>
            <h1 className="text-4xl font-bold">
              Galatea<span className="text-teal-400">.AI</span>
            </h1>
            <p className="text-gray-400 mt-2">Your AI wingman for building confidence</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="medium" />
          </div>
        </div>
      </div>
    )
  }

  // If user is logged in, this component shouldn't render (handled by parent)
  if (isLoggedIn && currentUser) {
    return null
  }

  // User is not logged in, show auth form
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/favicon.png"
              alt="Galatea.AI Logo"
              width={60}
              height={60}
              className="filter brightness-0 invert"
            />
          </div>
          <h1 className="text-4xl font-bold">
            Galatea<span className="text-teal-400">.AI</span>
          </h1>
          <p className="text-gray-400 mt-2">Your AI wingman for building confidence</p>
        </div>

        {/* Auth Form */}
        <AuthForm initialError={initialError} initialSuccessMessage={initialSuccessMessage} />
      </div>
    </div>
  )
}

