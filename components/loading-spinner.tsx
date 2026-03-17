"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large" | "xlarge"
  className?: string
  text?: string
  fullScreen?: boolean
}

const sizeClasses = {
  small: "h-5 w-5",
  medium: "h-12 w-12",
  large: "h-16 w-16",
  xlarge: "h-32 w-32",
}

export function LoadingSpinner({ 
  size = "medium", 
  className,
  text,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex items-center justify-center">
      <div className={cn("animate-spin rounded-full border-t-2 border-b-2 border-teal-500", sizeClasses[size], className)} />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          {spinner}
          {text && (
            <p className="text-white mt-4">{text}</p>
          )}
        </div>
      </div>
    )
  }

  if (text) {
    return (
      <div className="text-center">
        {spinner}
        <p className="text-white mt-4">{text}</p>
      </div>
    )
  }

  return spinner
}

