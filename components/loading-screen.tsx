"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

// Main full-screen loading component with progress bar
export function LoadingScreen({
  message = "Sculpting your experience...",
  onComplete,
}: {
  message?: string
  onComplete?: () => void
}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          if (onComplete) {
            setTimeout(onComplete, 500) // Small delay before calling onComplete
          }
          return 100
        }
        return prev + Math.random() * 3 + 1 // Variable increment for more realistic loading
      })
    }, 50)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-[#0a1520] flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md px-4 flex flex-col items-center">
        <CircleLoader />
        <GalateaAIBarLoader progress={progress} message={message} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0a1520] via-[#2de2e6] to-[#0a1520] animate-shimmer" />
    </div>
  )
}

// Simple circle loader for login/signup with logo in center
function SimpleCircleLoader() {
 
  return (
    <div className="fixed inset-0 bg-[#0a1520]/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Spinning circles */}
        <div className="absolute w-32 h-32 rounded-full border-4 border-t-transparent border-[#2de2e6] animate-spin" />
        <div className="absolute w-24 h-24 rounded-full border-4 border-b-transparent border-[#0d92ba] animate-spin [animation-delay:500ms]" />
        <div className="absolute w-16 h-16 rounded-full border-4 border-l-transparent border-[#2de2e6] animate-spin [animation-delay:1000ms]" />
        
        {/* Galatea AI Logo centered in the middle */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Image
            src="/favicon.png"
            alt="Galatea AI Logo"
            width={48}
            height={48}
            className="filter brightness-0 invert"
            priority
          />
        </div>
      </div>
    </div>
  )
}

// Minimal loader for inline use
export function MinimalLoader() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-[#2de2e6] animate-spin" />
    </div>
  )
}

// Logo component
function GalateaAILogo() {
  return (
    <Image
      src="/favicon.png"
      alt="Galatea AI Logo"
      width={100}
      height={100}
      className="mb-8 animate-pulse filter brightness-0 invert"
      priority
    />
  )
}

// Circle loader component with logo in center
export function CircleLoader() {
  return (
    <div className="relative w-full h-40 flex items-center justify-center mb-8">
      {/* Spinning circles */}
      <div className="absolute w-32 h-32 rounded-full border-4 border-t-transparent border-[#2de2e6] animate-spin" />
      <div className="absolute w-24 h-24 rounded-full border-4 border-b-transparent border-[#0d92ba] animate-spin [animation-delay:500ms]" />
      <div className="absolute w-16 h-16 rounded-full border-4 border-l-transparent border-[#2de2e6] animate-spin [animation-delay:1000ms]" />
      
      {/* Galatea AI Logo centered in the middle */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Image
          src="/favicon.png"
          alt="Galatea AI Logo"
          width={48}
          height={48}
          className="filter brightness-0 invert"
          priority
        />
      </div>
    </div>
  )
}

// Progress bar component
function GalateaAIBarLoader({ progress, message }: { progress: number; message: string }) {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        Galatea<span className="text-[#2de2e6]">.AI</span>
      </h1>
      <div className="w-full h-2 bg-[#0a2535] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#2de2e6] to-[#0d92ba] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="text-[#2de2e6] text-lg font-medium text-center">{progress < 100 ? message : "Ready"}</p>
    </div>
  )
}
