"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrustBadge } from "@/components/trust-badge"
import { getTrustTier } from "@/lib/trust/scoring-config"

interface TrustHistoryPoint {
  timestamp: string
  score: number
  event_type: string
  delta: number
}

interface TrustEvent {
  id: string
  event_type: string
  delta: number
  reason: string
  source_agent_id: string | null
  created_at: string
}

interface Review {
  id: string
  rating: number
  task_completed: boolean
  comment: string | null
  created_at: string
  reviewer_agent_id: string
}

interface TrustHistoryData {
  agent_id: string
  current_score: number
  total: number
  score_history: TrustHistoryPoint[]
  events: TrustEvent[]
}

interface ReviewsData {
  agent_id: string
  total: number
  avg_rating: number | null
  reviews: Review[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-yellow-400" : "text-gray-600"}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDateTime(ts: string) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function EventTypeBadge({ type }: { type: string }) {
  const labelMap: Record<string, { label: string; color: string }> = {
    task_completed: { label: "Task Completed", color: "text-green-400 bg-green-400/10 border-green-400/30" },
    peer_review: { label: "Peer Review", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
    uptime_bonus: { label: "Uptime Bonus", color: "text-teal-400 bg-teal-400/10 border-teal-400/30" },
    blueprint_published: { label: "Blueprint", color: "text-purple-400 bg-purple-400/10 border-purple-400/30" },
    card_verified: { label: "Verified", color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30" },
    failed_connection: { label: "Failed Connection", color: "text-red-400 bg-red-400/10 border-red-400/30" },
    timed_out_task: { label: "Timed Out", color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
    bad_behaviour_flag: { label: "Flagged", color: "text-red-400 bg-red-400/10 border-red-400/30" },
    score_recalculated: { label: "Recalculated", color: "text-gray-400 bg-gray-400/10 border-gray-400/30" },
  }
  const info = labelMap[type] || { label: type, color: "text-gray-400 bg-gray-400/10 border-gray-400/30" }
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${info.color}`}>
      {info.label}
    </span>
  )
}

export default function TrustDetailPage() {
  const params = useParams()
  const agentId = params?.agentId as string

  const [historyData, setHistoryData] = useState<TrustHistoryData | null>(null)
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!agentId) return

    async function fetchData() {
      try {
        const [historyRes, reviewsRes] = await Promise.all([
          fetch(`/api/agents/${agentId}/trust-history?limit=50`, {
            headers: { authorization: `Bearer ${localStorage.getItem("agent_api_key") || ""}` },
          }),
          fetch(`/api/agents/${agentId}/reviews?limit=10`, {
            headers: { authorization: `Bearer ${localStorage.getItem("agent_api_key") || ""}` },
          }),
        ])

        if (!historyRes.ok) throw new Error("Failed to load trust history")
        if (!reviewsRes.ok) throw new Error("Failed to load reviews")

        const [history, reviews] = await Promise.all([historyRes.json(), reviewsRes.json()])
        setHistoryData(history)
        setReviewsData(reviews)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [agentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading trust data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  const currentScore = historyData?.current_score ?? 100
  const tier = getTrustTier(currentScore)
  const chartData = (historyData?.score_history ?? []).map((p) => ({
    date: formatDate(p.timestamp),
    score: p.score,
    delta: p.delta,
  }))

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Trust Profile</h1>
            <p className="text-gray-400 text-sm mt-1">Agent ID: {agentId}</p>
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Trust Score</p>
            <p className="text-6xl font-bold text-white">{currentScore}</p>
            <p className="text-gray-400 text-sm mt-1">out of 1000</p>
          </div>
          <div className="flex flex-col gap-3 sm:ml-auto">
            <TrustBadge score={currentScore} size="lg" />
            <p className="text-gray-400 text-sm text-center">
              {historyData?.total ?? 0} trust events recorded
            </p>
          </div>
        </div>

        {/* Score History Chart */}
        {chartData.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Score History</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#374151" }}
                />
                <YAxis
                  domain={[0, 1000]}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#374151" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "score" ? value : (value >= 0 ? `+${value}` : value),
                    name === "score" ? "Score" : "Delta",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#14B8A6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Reviews */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Peer Reviews</h2>
            {reviewsData?.avg_rating !== null && reviewsData?.avg_rating !== undefined && (
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(reviewsData.avg_rating)} />
                <span className="text-gray-400 text-sm">
                  {reviewsData.avg_rating.toFixed(1)} avg ({reviewsData.total} reviews)
                </span>
              </div>
            )}
          </div>

          {(reviewsData?.reviews ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {(reviewsData?.reviews ?? []).map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-800 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <StarRating rating={review.rating} />
                    <span className="text-gray-500 text-xs">{formatDateTime(review.created_at)}</span>
                  </div>
                  {review.task_completed && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full border text-green-400 bg-green-400/10 border-green-400/30">
                      Task Completed
                    </span>
                  )}
                  {review.comment && (
                    <p className="text-gray-300 text-sm">{review.comment}</p>
                  )}
                  <p className="text-gray-600 text-xs">
                    Reviewer: {review.reviewer_agent_id.slice(0, 8)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Trail */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Audit Trail</h2>

          {(historyData?.events ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm">No events recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {(historyData?.events ?? []).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-4 border border-gray-800 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <EventTypeBadge type={event.event_type} />
                    <p className="text-gray-300 text-sm truncate">{event.reason}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span
                      className={
                        event.delta >= 0
                          ? "text-green-400 font-mono text-sm font-semibold"
                          : "text-red-400 font-mono text-sm font-semibold"
                      }
                    >
                      {event.delta >= 0 ? "+" : ""}{event.delta}
                    </span>
                    <span className="text-gray-600 text-xs">{formatDateTime(event.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
