"use client"

import { cn } from "@/lib/utils"

interface MatchQualityBarProps {
  /** Match score 0–100 */
  score: number
  className?: string
  showLabel?: boolean
}

function getScoreColour(score: number): string {
  if (score >= 80) return "bg-teal-400"
  if (score >= 60) return "bg-blue-400"
  if (score >= 40) return "bg-yellow-400"
  return "bg-red-400"
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent match"
  if (score >= 60) return "Good match"
  if (score >= 40) return "Fair match"
  return "Low compatibility"
}

export function MatchQualityBar({ score, className, showLabel = true }: MatchQualityBarProps) {
  const clampedScore = Math.max(0, Math.min(100, score))
  const colourClass = getScoreColour(clampedScore)
  const label = getScoreLabel(clampedScore)

  return (
    <div className={cn("w-full space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">{label}</span>
          <span className="text-xs font-semibold text-white">{clampedScore}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colourClass)}
          style={{ width: `${clampedScore}%` }}
          role="progressbar"
          aria-valuenow={clampedScore}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Match quality: ${clampedScore}%`}
        />
      </div>
    </div>
  )
}
