"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Heart, X } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"

interface AIProfile {
  uuid: string
  id: number
  name: string
  age: number
  bio: string
  imageUrl: string
}

interface SwipeDecision {
  [uuid: string]: "accepted" | "rejected"
}

export default function StartSwiping() {
  const [profiles, setProfiles] = useState<AIProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [decisions, setDecisions] = useState<SwipeDecision>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)

  useEffect(() => {
    // Check for profiles in URL params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const profilesParam = urlParams.get("profiles")
      if (profilesParam) {
        try {
          const parsedProfiles = JSON.parse(decodeURIComponent(profilesParam)) as AIProfile[]
          setProfiles(parsedProfiles)
          setIsLoading(false)
          return
        } catch (err) {
          setError("Failed to parse profiles. Please try again.")
          setIsLoading(false)
          return
        }
      }
    }
    
    // If no profiles in URL, initiate swipe
    initiateSwipe()
  }, [])

  async function initiateSwipe() {
    try {
      const response = await fetch("/api/init-swiping")
      if (!response.ok) {
        throw new Error("Failed to initiate swipe session")
      }
      const data = await response.json()
      setProfiles(data)
      setIsLoading(false)
    } catch (err) {
      setError("Failed to start swiping session. Please try again later.")
      setIsLoading(false)
    }
  }

  const handleDecision = (decision: "accepted" | "rejected") => {
    if (currentIndex >= profiles.length) return

    const currentProfile = profiles[currentIndex]
    setDecisions((prev) => ({ ...prev, [currentProfile.uuid]: decision }))

    // Set swipe animation direction
    setSwipeDirection(decision === "accepted" ? "right" : "left")

    // Wait for animation to complete before changing index
    setTimeout(() => {
      setSwipeDirection(null)
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        submitDecisions()
      }
    }, 300)
  }

  const submitDecisions = async () => {
    try {
      const response = await fetch("/api/submit-decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(decisions),
      })

      if (!response.ok) {
        throw new Error("Failed to submit decisions")
      }

      // Handle successful submission (e.g., show results or redirect)
      console.log("Decisions submitted successfully")
    } catch (err) {
      setError("Failed to submit decisions. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500">
        <p className="mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-teal-500 text-black hover:bg-teal-400">
          Try Again
        </Button>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="mb-4">No profiles available</p>
        <Button asChild className="bg-teal-500 text-black hover:bg-teal-400">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    )
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h2 className="text-3xl font-bold mb-4">Swiping complete!</h2>
        <p className="text-gray-300 mb-8">We're analyzing your preferences to create your perfect AI companion.</p>
        <Button asChild className="bg-teal-500 text-black hover:bg-teal-400">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    )
  }

  const currentProfile = profiles[currentIndex]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navbar />

        <main className="container mx-auto px-6 py-24">
          <h1 className="text-4xl font-bold text-center mb-12">
            Find Your <span className="text-teal-400">Perfect Match</span>
          </h1>

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
                    src={currentProfile.imageUrl || "/placeholder.svg"}
                    alt={currentProfile.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-3xl font-bold text-white">
                      {currentProfile.name}, {currentProfile.age}
                    </h2>
                    <p className="text-gray-300 mt-2">{currentProfile.bio}</p>
                  </div>
                </div>

                <div className="flex justify-center space-x-8 p-6">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full p-4 border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => handleDecision("rejected")}
                  >
                    <X className="h-8 w-8" />
                    <span className="sr-only">Reject</span>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full p-4 border-teal-500 text-teal-500 hover:bg-teal-500/10 hover:text-teal-400"
                    onClick={() => handleDecision("accepted")}
                  >
                    <Heart className="h-8 w-8" />
                    <span className="sr-only">Accept</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center text-gray-400">
            <p>
              Profile {currentIndex + 1} of {profiles.length}
            </p>
          </div>
        </main>

        <footer className="bg-gray-950 border-t border-gray-800 mt-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center text-gray-400">© 2024 Galatea.AI. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  )
}
