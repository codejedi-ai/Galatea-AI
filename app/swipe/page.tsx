"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, X, RotateCcw, Settings } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import type { AICompanion } from "@/lib/firestore"

interface SwipeDecision {
  companionId: string
  action: "liked" | "passed"
}

export default function SwipePage() {
  const { currentUser } = useAuth()
  const [companions, setCompanions] = useState<AICompanion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [decisions, setDecisions] = useState<SwipeDecision[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)
  const [matches, setMatches] = useState<AICompanion[]>([])
  const [showMatches, setShowMatches] = useState(false)

  useEffect(() => {
    if (currentUser) {
      initiateSwipe()
    }
  }, [currentUser])

  async function initiateSwipe() {
    if (!currentUser) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/init-swiping?userId=${currentUser.uid}`)
      if (!response.ok) {
        throw new Error("Failed to initiate swipe session")
      }
      const data = await response.json()
      setCompanions(data)
      setCurrentIndex(0)
      setDecisions([])
      setMatches([])
      setShowMatches(false)
      setIsLoading(false)
    } catch (err) {
      setError("Failed to start swiping session. Please try again later.")
      setIsLoading(false)
    }
  }

  const handleDecision = async (action: "liked" | "passed") => {
    if (currentIndex >= companions.length || !currentUser) return

    const currentCompanion = companions[currentIndex]
    const newDecision: SwipeDecision = {
      companionId: currentCompanion.id,
      action,
    }

    setDecisions((prev) => [...prev, newDecision])

    // Add to matches if liked
    if (action === "liked") {
      setMatches((prev) => [...prev, currentCompanion])
    }

    // Set swipe animation direction
    setSwipeDirection(action === "liked" ? "right" : "left")

    // Wait for animation to complete before changing index
    setTimeout(() => {
      setSwipeDirection(null)
      if (currentIndex < companions.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        submitDecisions([...decisions, newDecision])
      }
    }, 300)
  }

  const submitDecisions = async (allDecisions: SwipeDecision[]) => {
    if (!currentUser) return

    try {
      const response = await fetch("/api/submit-decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          decisions: allDecisions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit decisions")
      }

      const result = await response.json()
      setShowMatches(true)
    } catch (err) {
      setError("Failed to submit decisions. Please try again.")
    }
  }

  const resetSwipe = () => {
    initiateSwipe()
  }

  if (isLoading) {
    return <LoadingScreen message="Loading your matches..." />
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500">
          <p className="mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-teal-500 text-black hover:bg-teal-400">
            Try Again
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  if (showMatches) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          <Navbar />
          <main className="container mx-auto px-6 pt-24 pb-16">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                Your <span className="text-teal-400">Matches</span>
              </h1>
              <p className="text-gray-300 mb-8">
                You matched with {matches.length} AI companion{matches.length !== 1 ? "s" : ""}!
              </p>
            </div>

            {matches.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {matches.map((match) => (
                  <Card key={match.id} className="bg-gray-900 border-gray-800 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={match.imageUrl || "/placeholder.svg"}
                          alt={match.name}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-xl font-bold text-white">
                            {match.name}, {match.age}
                          </h3>
                          <p className="text-gray-300 text-sm mt-1">{match.bio}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {match.personality.slice(0, 3).map((trait, index) => (
                              <span key={index} className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-full">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <Button className="w-full bg-teal-500 text-black hover:bg-teal-400">Start Chatting</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-6">No matches this time. Try swiping again!</p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <Button onClick={resetSwipe} className="bg-teal-500 text-black hover:bg-teal-400">
                <RotateCcw className="h-4 w-4 mr-2" />
                Swipe Again
              </Button>
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800" asChild>
                <Link href="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (companions.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
          <p className="mb-4">No more companions to swipe on!</p>
          <Button onClick={resetSwipe} className="bg-teal-500 text-black hover:bg-teal-400">
            Check for New Companions
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  if (currentIndex >= companions.length) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
          <h2 className="text-3xl font-bold mb-4">Swiping complete!</h2>
          <p className="text-gray-300 mb-8">We're analyzing your preferences to create your perfect AI companion.</p>
          <Button onClick={() => setShowMatches(true)} className="bg-teal-500 text-black hover:bg-teal-400">
            View Matches
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  const currentCompanion = companions[currentIndex]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navbar />

        <main className="container mx-auto px-6 py-24">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Find Your <span className="text-teal-400">Perfect Match</span>
            </h1>
            <p className="text-gray-300">
              Profile {currentIndex + 1} of {companions.length}
            </p>
          </div>

          <div className="flex justify-center">
            <Card
              className={`w-full max-w-md bg-gray-900 border border-gray-800 overflow-hidden transition-transform duration-300 ${
                swipeDirection === "left"
                  ? "translate-x-[-100vw]"
                  : swipeDirection === "right"
                    ? "translate-x-[100vw]"
                    : ""
              }`}
            >
              <CardContent className="p-0">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={currentCompanion.imageUrl || "/placeholder.svg"}
                    alt={currentCompanion.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-3xl font-bold text-white">
                      {currentCompanion.name}, {currentCompanion.age}
                    </h2>
                    <p className="text-gray-300 mt-2">{currentCompanion.bio}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {currentCompanion.personality.slice(0, 4).map((trait, index) => (
                        <span key={index} className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-full">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-8 p-6">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full p-4 border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => handleDecision("passed")}
                  >
                    <X className="h-8 w-8" />
                    <span className="sr-only">Pass</span>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full p-4 border-teal-500 text-teal-500 hover:bg-teal-500/10 hover:text-teal-400"
                    onClick={() => handleDecision("liked")}
                  >
                    <Heart className="h-8 w-8" />
                    <span className="sr-only">Like</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mt-8">
            <Button variant="ghost" onClick={resetSwipe} className="text-gray-400 hover:text-white hover:bg-gray-800">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
