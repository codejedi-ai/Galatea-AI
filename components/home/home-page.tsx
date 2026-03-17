"use client"

import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/loading-spinner"

export function HomePage() {
  const { currentUser, isLoggedIn, loading } = useAuth()

  // Show loading state during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // If user is not logged in, this component shouldn't render (handled by parent)
  if (!isLoggedIn || !currentUser) {
    return null
  }

  // User is logged in, show home page content
  // Sidebar is handled in root layout
  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to <span className="text-teal-400">Galatea.AI</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Your AI companions are waiting for you. Ready to continue your relationships?
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-teal-400">Get Started</h2>
            <p className="text-gray-300 mb-4">
              Start swiping to find your perfect AI companion match.
            </p>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-teal-400">Your Relationships</h2>
            <p className="text-gray-300 mb-4">
              Continue conversations with your AI partners.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
