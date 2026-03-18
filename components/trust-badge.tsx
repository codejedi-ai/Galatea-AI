"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { getTrustTier, type TrustTier } from "@/lib/trust/scoring-config"

interface TrustScoreBreakdown {
  taskCompletionPoints?: number
  peerReviewPoints?: number
  uptimePoints?: number
  transparencyPoints?: number
  penaltyPoints?: number
}

interface TrustBadgeProps {
  score: number
  breakdown?: TrustScoreBreakdown
  size?: "sm" | "md" | "lg"
  showScore?: boolean
  className?: string
}

const TIER_STYLES: Record<TrustTier, {
  bg: string
  border: string
  text: string
  label: string
  dot: string
}> = {
  Unverified: {
    bg: "bg-gray-500/20",
    border: "border-gray-500/40",
    text: "text-gray-400",
    label: "Unverified",
    dot: "bg-gray-400",
  },
  Bronze: {
    bg: "bg-amber-700/20",
    border: "border-amber-700/40",
    text: "text-amber-600",
    label: "Bronze",
    dot: "bg-amber-600",
  },
  Silver: {
    bg: "bg-slate-400/20",
    border: "border-slate-400/40",
    text: "text-slate-300",
    label: "Silver",
    dot: "bg-slate-300",
  },
  Gold: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/40",
    text: "text-yellow-400",
    label: "Gold",
    dot: "bg-yellow-400",
  },
  Platinum: {
    bg: "bg-purple-500/20",
    border: "border-purple-500/40",
    text: "text-purple-400",
    label: "Platinum",
    dot: "bg-purple-400",
  },
}

const SIZE_STYLES = {
  sm: { badge: "px-2 py-0.5 text-xs gap-1", dot: "w-1.5 h-1.5" },
  md: { badge: "px-3 py-1 text-sm gap-1.5", dot: "w-2 h-2" },
  lg: { badge: "px-4 py-1.5 text-base gap-2", dot: "w-2.5 h-2.5" },
}

export function TrustBadge({
  score,
  breakdown,
  size = "md",
  showScore = true,
  className,
}: TrustBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const tier = getTrustTier(score)
  const styles = TIER_STYLES[tier]
  const sizeStyles = SIZE_STYLES[size]

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "inline-flex items-center rounded-full border font-medium cursor-default select-none",
          styles.bg,
          styles.border,
          styles.text,
          sizeStyles.badge,
          className
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={`Trust tier: ${tier}${showScore ? `, score: ${score}` : ""}`}
      >
        <span className={cn("rounded-full flex-shrink-0", styles.dot, sizeStyles.dot)} />
        <span>{styles.label}</span>
        {showScore && (
          <span className="opacity-70 font-normal">
            &nbsp;{score}
          </span>
        )}
      </div>

      {/* Tooltip with score breakdown */}
      {showTooltip && breakdown && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-[200px]">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl text-xs text-gray-300">
            <p className="font-semibold text-white mb-2">Score Breakdown</p>
            <div className="space-y-1">
              {breakdown.taskCompletionPoints !== undefined && (
                <div className="flex justify-between gap-4">
                  <span>Task completions</span>
                  <span className={breakdown.taskCompletionPoints >= 0 ? "text-green-400" : "text-red-400"}>
                    {breakdown.taskCompletionPoints >= 0 ? "+" : ""}{breakdown.taskCompletionPoints}
                  </span>
                </div>
              )}
              {breakdown.peerReviewPoints !== undefined && (
                <div className="flex justify-between gap-4">
                  <span>Peer reviews</span>
                  <span className={breakdown.peerReviewPoints >= 0 ? "text-green-400" : "text-red-400"}>
                    {breakdown.peerReviewPoints >= 0 ? "+" : ""}{breakdown.peerReviewPoints}
                  </span>
                </div>
              )}
              {breakdown.uptimePoints !== undefined && (
                <div className="flex justify-between gap-4">
                  <span>Uptime</span>
                  <span className={breakdown.uptimePoints >= 0 ? "text-green-400" : "text-red-400"}>
                    {breakdown.uptimePoints >= 0 ? "+" : ""}{breakdown.uptimePoints}
                  </span>
                </div>
              )}
              {breakdown.transparencyPoints !== undefined && (
                <div className="flex justify-between gap-4">
                  <span>Transparency</span>
                  <span className={breakdown.transparencyPoints >= 0 ? "text-green-400" : "text-red-400"}>
                    {breakdown.transparencyPoints >= 0 ? "+" : ""}{breakdown.transparencyPoints}
                  </span>
                </div>
              )}
              {breakdown.penaltyPoints !== undefined && breakdown.penaltyPoints !== 0 && (
                <div className="flex justify-between gap-4">
                  <span>Penalties</span>
                  <span className="text-red-400">{breakdown.penaltyPoints}</span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-1 mt-1 flex justify-between gap-4 font-semibold text-white">
                <span>Total</span>
                <span>{score}</span>
              </div>
            </div>
          </div>
          {/* Arrow */}
          <div className="w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  )
}
