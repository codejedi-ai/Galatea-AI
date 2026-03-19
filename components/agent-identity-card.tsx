"use client"

import { ShieldCheck, ShieldAlert, Clock, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import { shortAgentId } from "@/lib/types/agent-card"
import type { Capability, Framework } from "@/lib/types/agent-card"

export type VerificationStatus = "verified" | "unverified" | "expired"

export interface AgentIdentityCardProps {
  agentId: string
  name: string
  framework: Framework
  version?: string
  capabilities: (Capability | string)[]
  status: VerificationStatus
  className?: string
}

const FRAMEWORK_COLORS: Record<Framework, string> = {
  LangChain: "bg-green-500/20 text-green-300 border-green-500/30",
  AutoGen: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  CrewAI: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Custom: "bg-gray-500/20 text-gray-300 border-gray-500/30",
}

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  verified: {
    label: "Verified",
    icon: ShieldCheck,
    className: "text-teal-400 bg-teal-500/20 border-teal-500/30",
  },
  unverified: {
    label: "Unverified",
    icon: ShieldAlert,
    className: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
  },
  expired: {
    label: "Expired",
    icon: Clock,
    className: "text-red-400 bg-red-500/20 border-red-500/30",
  },
}

function getCapabilityName(cap: Capability | string): string {
  if (typeof cap === "string") return cap
  return cap.name
}

export function AgentIdentityCard({
  agentId,
  name,
  framework,
  version,
  capabilities,
  status,
  className,
}: AgentIdentityCardProps) {
  const statusConfig = STATUS_CONFIG[status]
  const StatusIcon = statusConfig.icon
  const frameworkColor = FRAMEWORK_COLORS[framework] ?? FRAMEWORK_COLORS.Custom

  return (
    <div
      className={cn(
        "bg-gray-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-3",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Cpu className="w-4 h-4 text-teal-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-white font-semibold truncate leading-tight">{name}</p>
            <p className="text-gray-500 text-xs font-mono">{shortAgentId(agentId)}</p>
          </div>
        </div>

        {/* Verification badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border shrink-0",
            statusConfig.className
          )}
        >
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
      </div>

      {/* Framework + version */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
            frameworkColor
          )}
        >
          {framework}
        </span>
        {version && (
          <span className="text-gray-500 text-xs">v{version}</span>
        )}
      </div>

      {/* Capabilities pills */}
      {capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {capabilities.slice(0, 6).map((cap, i) => (
            <span
              key={i}
              className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full border border-white/20"
            >
              {getCapabilityName(cap)}
            </span>
          ))}
          {capabilities.length > 6 && (
            <span className="bg-white/10 text-gray-400 text-xs px-2 py-0.5 rounded-full border border-white/20">
              +{capabilities.length - 6} more
            </span>
          )}
        </div>
      )}
    </div>
  )
}
