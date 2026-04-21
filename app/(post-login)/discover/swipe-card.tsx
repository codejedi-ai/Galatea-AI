"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import "./swipe.css"

interface AICompanion {
  id: string
  name: string
  age: number
  personality: string
  interests: string[]
  bio: string
  imageUrl: string
  compatibilityScore: number
}

interface SwipeCardProps {
  companion: AICompanion
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onSuperLike: () => void
  style?: React.CSSProperties
}

export function SwipeCard({ companion, onSwipeLeft, onSwipeRight, onSuperLike, style }: SwipeCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="swipe-card card-glow" style={style}>
      <div className="relative w-full h-full">
        <Image
          src={companion.imageUrl || "/placeholder.svg"}
          alt={companion.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 500px"
        />

        <div
          className={cn(
            "absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 transition-all duration-300",
            showDetails ? "h-full pb-32" : "h-auto",
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {companion.name}, <span className="text-primary">{companion.age}</span>
              </h2>
              <p className="text-white/80">{companion.personality}</p>
            </div>
            <div className="flex items-center bg-black/60 rounded-full px-2 py-1">
              <span className="text-primary font-bold mr-1">{companion.compatibilityScore}%</span>
              <span className="text-sm text-white/70">match</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {companion.interests.map((interest, index) => (
              <span key={index} className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                {interest}
              </span>
            ))}
          </div>

          <div
            className={cn(
              "transition-opacity duration-300",
              showDetails ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <p className="text-white mb-4">{companion.bio}</p>
            <div className="space-y-3">
              <div className="bg-black/60 rounded-lg p-3">
                <h3 className="text-primary font-semibold mb-1">Personality Traits</h3>
                <p className="text-white/80 text-sm">Empathetic, Witty, Supportive, Creative, Adaptable</p>
              </div>
              <div className="bg-black/60 rounded-lg p-3">
                <h3 className="text-primary font-semibold mb-1">Communication Style</h3>
                <p className="text-white/80 text-sm">
                  Thoughtful responses with a touch of humor. Asks meaningful questions.
                </p>
              </div>
              <div className="bg-black/60 rounded-lg p-3">
                <h3 className="text-primary font-semibold mb-1">Learning Capacity</h3>
                <p className="text-white/80 text-sm">Quickly adapts to your preferences and conversation style.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
