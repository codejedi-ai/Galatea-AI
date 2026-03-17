"use client"

import { useState, useEffect } from "react"
import { motion, type PanInfo, useMotionValue, useTransform } from "framer-motion"
import { Heart, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { processSwipeDecision } from "@/lib/database/swipes"
import { useToast } from "@/components/ui/use-toast"
import type { Companion } from "@/lib/database/companions"

export default function SwipePage() {
  const [companions, setCompanions] = useState<Companion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const cardOpacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0])
  const nopeScale = useTransform(x, [-150, -50], [1, 0.8])
  const likeOpacity = useTransform(x, [50, 150], [0, 1])
  const likeScale = useTransform(x, [50, 150], [0.8, 1])

  useEffect(() => {
    loadCompanions()
  }, [])

  const loadCompanions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get companions user hasn't swiped on yet
      const { data: swipedCompanions } = await supabase
        .from('swipe_decisions')
        .select('companion_id')
        .eq('user_id', user.id)

      const swipedIds = swipedCompanions?.map(s => s.companion_id) || []

      // Get all active companions
      const { data: allCompanions, error: companionsError } = await supabase
        .from('companions')
        .select('*')
        .eq('is_active', true)
        .order('compatibility_score', { ascending: false })
        .limit(50)

      if (companionsError) throw companionsError

      // Filter out already swiped companions
      const fetchedCompanions = (allCompanions || []).filter(
        companion => !swipedIds.includes(companion.id)
      ).slice(0, 20)

      if (companionsError) throw companionsError
      
      if (fetchedCompanions && fetchedCompanions.length === 0) {
        setError("No more companions available. Check back later!")
      } else {
        setCompanions(fetchedCompanions || [])
      }
    } catch (err: any) {
      setError("Failed to load companions. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwipe = async (direction: "left" | "right" | "up") => {
    if (currentIndex >= companions.length || isProcessing) return

    const currentCompanion = companions[currentIndex]
    setIsProcessing(true)

    try {
      let decision: 'like' | 'pass' | 'super_like'
      if (direction === "right") {
        decision = 'like'
      } else if (direction === "up") {
        decision = 'super_like'
      } else {
        decision = 'pass'
      }

      // Process swipe decision (includes match creation)
      const result = await processSwipeDecision(currentCompanion.id!, decision)

      if (result.success) {
        if (decision === 'like' || decision === 'super_like') {
          setMatches(prev => [...prev, currentCompanion.id!])
          
          if (result.is_match) {
            toast({
              title: "🎉 It's a Match!",
              description: `You matched with ${currentCompanion.name}!`,
            })
          }
        }

        // Move to next companion
        if (currentIndex < companions.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else {
          // Load more companions or redirect
          await loadCompanions()
          if (companions.length <= currentIndex + 1) {
            router.push("/matches")
          } else {
            setCurrentIndex(0)
          }
        }
      } else {
        throw new Error(result.error || "Failed to process swipe")
      }
    } catch (error: any) {
      console.error("Swipe error:", error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100

    if (info.offset.x > threshold) {
      handleSwipe("right")
    } else if (info.offset.x < -threshold) {
      handleSwipe("left")
    }

    // Reset card position
    x.set(0)
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-white">Loading companions...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadCompanions} className="bg-teal-500 text-black hover:bg-teal-400">
              Try Again
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (companions.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-white mb-4">No companions available</p>
              <Button asChild className="bg-teal-500 text-black hover:bg-teal-400">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (currentIndex >= companions.length) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">All done!</h2>
              <p className="text-gray-300 mb-8">You've seen all available companions.</p>
              <div className="space-y-4">
                <Button asChild className="bg-teal-500 text-black hover:bg-teal-400 w-full">
                  <Link href="/matches">View Your Matches ({matches.length})</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">Return Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const currentCompanion = companions[currentIndex]
  const nextCompanion = companions[currentIndex + 1]

  return (
    <ProtectedRoute>
      <div className="h-screen bg-black overflow-hidden flex flex-col">
        <Navbar />

        <main className="flex-1 relative pt-20">
          {/* Image Area - Takes all space below navbar to bottom */}
          <div className="absolute inset-x-0 top-20 bottom-0 w-full overflow-hidden">
            {/* Next card (underneath) */}
            {nextCompanion && (
              <div
                className="absolute inset-0"
                style={{
                  zIndex: 0,
                  transform: "scale(0.95) translateY(10px)",
                  opacity: 0.7,
                }}
              >
                <img
                  src={nextCompanion.image_url || "/placeholder.svg"}
                  alt={nextCompanion.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Current card image (on top) */}
            <motion.div
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{
                zIndex: 1,
                x,
                rotate,
                opacity: cardOpacity,
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.05 }}
            >
              <img
                src={currentCompanion.image_url || "/placeholder.svg"}
                alt={currentCompanion.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Swipe indicators */}
            <motion.div
              className="absolute top-20 left-8 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg rotate-[-30deg] border-4 border-red-500 z-30"
              style={{
                opacity: nopeOpacity,
                scale: nopeScale,
              }}
            >
              NOPE
            </motion.div>

            <motion.div
              className="absolute top-20 right-8 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-lg rotate-[30deg] border-4 border-green-500 z-30"
              style={{
                opacity: likeOpacity,
                scale: likeScale,
              }}
            >
              LIKE
            </motion.div>

            {/* Header - Fixed at top right */}
            <div className="absolute top-4 right-4 z-30 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="text-center">
                <h1 className="text-sm font-bold text-white">Swipe</h1>
                <p className="text-xs text-gray-300">
                  {currentIndex + 1} / {companions.length}
                </p>
              </div>
            </div>

            {/* Description Box - Bottom Left */}
            <div className="absolute bottom-24 left-4 z-30 bg-black/70 backdrop-blur-md rounded-lg p-4 max-w-sm border border-white/20">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    {currentCompanion.name}
                    {currentCompanion.age && <span className="text-teal-400">, {currentCompanion.age}</span>}
                  </h2>
                  <p className="text-gray-300 text-sm">{currentCompanion.personality}</p>
                </div>
                {currentCompanion.compatibility_score && (
                  <div className="bg-teal-500/20 backdrop-blur-sm rounded-full px-2 py-1 border border-teal-500/30 ml-2">
                    <span className="text-teal-400 font-bold text-xs">{currentCompanion.compatibility_score}%</span>
                  </div>
                )}
              </div>
              <p className="text-gray-200 text-sm mb-3 line-clamp-3">{currentCompanion.bio}</p>
              {/* Interests */}
              <div className="flex flex-wrap gap-1.5">
                {currentCompanion.interests.slice(0, 3).map((interest: string, index: number) => (
                  <span
                    key={index}
                    className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full border border-white/30"
                  >
                    {interest}
                  </span>
                ))}
                {currentCompanion.interests.length > 3 && (
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full border border-white/30">
                    +{currentCompanion.interests.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center gap-6">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-14 h-14 border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400 bg-black/50 backdrop-blur-sm"
              onClick={() => handleSwipe("left")}
              disabled={isProcessing}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-12 h-12 border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400 bg-black/50 backdrop-blur-sm"
              onClick={() => handleSwipe("up")}
              disabled={isProcessing}
            >
              <Star className="h-5 w-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-14 h-14 border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-400 bg-black/50 backdrop-blur-sm"
              onClick={() => handleSwipe("right")}
              disabled={isProcessing}
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
