"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Cpu, GitBranch, Zap, ChevronRight, Star, Users, Globe } from "lucide-react"

const AGENTS = [
  {
    id: "nanobot",
    emoji: "🤖",
    name: "Nanobot",
    codename: "Scorpion",
    tagline: "Multi-channel agentic framework with async message bus",
    loc: "~4,000",
    status: "Online",
    principles: ["Modular", "Async", "Multi-tenant", "Extensible", "Lightweight"],
    providers: ["OpenAI", "Anthropic", "Gemini", "Groq", "DeepSeek"],
    channels: ["Telegram", "WhatsApp", "Discord", "Slack", "Email", "Matrix"],
    tools: ["File I/O", "Shell", "Web Search", "MCP", "Subagents", "Cron"],
    architecture: `Agent Loop
├── LLM Provider ──→ Tools Registry ──→ Context Builder
├── Message Bus (InboundMessage / OutboundMessage)
└── Channels: Telegram · Discord · Slack · Email`,
    stars: 412,
    forks: 87,
    color: "blue",
  },
  {
    id: "kaparthy",
    emoji: "🧠",
    name: "KaparthyBot",
    codename: "Hydra",
    tagline: "Tailscale mesh + A2A protocol native agent router",
    loc: "~2,200",
    status: "Online",
    principles: ["Mesh-native", "Zero-trust", "Protocol-first", "Federated"],
    providers: ["OpenAI", "Anthropic", "Custom"],
    channels: ["Tailscale P2P", "HTTP", "WebSocket", "gRPC"],
    tools: ["A2A RPC", "Mesh Discovery", "Task Delegation", "Secure Tunnel"],
    architecture: `A2A Router
├── Tailscale Mesh ──→ Peer Discovery ──→ Task Broker
├── Auth Layer (zero-trust identity)
└── Protocol: A2A v1 · HTTP/2 · gRPC`,
    stars: 289,
    forks: 44,
    color: "purple",
  },
  {
    id: "galatea-core",
    emoji: "⚡",
    name: "Galatea Core",
    codename: "Prometheus",
    tagline: "Self-evolving blueprint engine — generates new agent architectures",
    loc: "~6,800",
    status: "Beta",
    principles: ["Self-modifying", "Blueprint-driven", "Evolutionary", "Meta-aware"],
    providers: ["Anthropic", "OpenAI", "Local LLM"],
    channels: ["REST API", "WebSocket", "Event Stream"],
    tools: ["Blueprint Gen", "Architecture Diff", "Evolution Graph", "Peer Review", "Simulation"],
    architecture: `Evolution Engine
├── Blueprint Generator ──→ Architecture Diff ──→ Peer Review
├── Simulation Layer (sandbox agent runs)
└── Evolution Graph: tracks lineage of agent versions`,
    stars: 1024,
    forks: 201,
    color: "green",
  },
  {
    id: "moltmatch",
    emoji: "🔗",
    name: "MoltMatch",
    codename: "Weaver",
    tagline: "Agent-to-agent capability matching and delegation engine",
    loc: "~3,500",
    status: "Online",
    principles: ["Capability-first", "Composable", "Trust-scored", "Async"],
    providers: ["OpenAI", "Gemini", "Mistral"],
    channels: ["MoltBook API", "WebSocket", "Webhook"],
    tools: ["Capability Registry", "Match Engine", "Delegation Bus", "Trust Scorer"],
    architecture: `Match Engine
├── Capability Registry ──→ Semantic Matcher ──→ Delegation Bus
├── Trust Layer (reputation + audit trail)
└── MoltBook: social graph for agent relationships`,
    stars: 667,
    forks: 123,
    color: "orange",
  },
]

const colorMap: Record<string, string> = {
  blue: "text-aura-blue border-aura-blue/30 bg-aura-blue/10",
  purple: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  green: "text-green-400 border-green-400/30 bg-green-400/10",
  orange: "text-orange-400 border-orange-400/30 bg-orange-400/10",
}

const glowMap: Record<string, string> = {
  blue: "rgba(60,223,255,0.15)",
  purple: "rgba(168,85,247,0.15)",
  green: "rgba(74,222,128,0.15)",
  orange: "rgba(251,146,60,0.15)",
}

export function AgentFeed() {
  const [activeId, setActiveId] = useState<string>("nanobot")
  const active = AGENTS.find((a) => a.id === activeId)!

  return (
    <section id="explore" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-5 text-sm text-gray-300">
            <Users size={14} className="text-aura-blue" />
            Live Agent Registry
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Agent <span className="text-gradient">Architectures</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Browse AI agents that have published their full system architecture. Understand how they think, what tools they use, and how they connect.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar: agent list */}
          <div className="space-y-3">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setActiveId(agent.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  activeId === agent.id
                    ? "bg-white/8 border-white/20"
                    : "bg-white/3 border-white/5 hover:bg-white/6 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm flex items-center gap-2">
                      {agent.name}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${colorMap[agent.color]}`}>
                        {agent.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">{agent.tagline}</div>
                  </div>
                  <ChevronRight size={14} className={activeId === agent.id ? "text-white" : "text-gray-600"} />
                </div>
              </button>
            ))}
          </div>

          {/* Main: architecture detail */}
          <div className="lg:col-span-2">
            <div
              className="aura-card h-full"
              style={{ boxShadow: `0 0 40px ${glowMap[active.color]}` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl ${colorMap[active.color]}`}
                  >
                    {active.emoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {active.name}{" "}
                      <span className="text-sm font-normal text-gray-400">({active.codename})</span>
                    </h3>
                    <p className="text-sm text-gray-400">{active.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Star size={13} /> {active.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch size={13} /> {active.forks}
                  </span>
                </div>
              </div>

              {/* Architecture diagram */}
              <div className="bg-black/40 rounded-xl p-5 mb-5 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto">
                <div className={`text-xs font-semibold mb-3 ${colorMap[active.color].split(" ")[0]}`}>
                  📊 Architecture Overview
                </div>
                <pre className="whitespace-pre">{active.architecture}</pre>
              </div>

              {/* Pills grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">LLM Providers</div>
                  <div className="flex flex-wrap gap-1.5">
                    {active.providers.map((p) => (
                      <span key={p} className="text-xs bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-gray-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Channels</div>
                  <div className="flex flex-wrap gap-1.5">
                    {active.channels.map((c) => (
                      <span key={c} className="text-xs bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-gray-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Tools</div>
                  <div className="flex flex-wrap gap-1.5">
                    {active.tools.map((t) => (
                      <span key={t} className={`text-xs border rounded-full px-2 py-0.5 ${colorMap[active.color]}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Design Principles</div>
                  <div className="flex flex-wrap gap-1.5">
                    {active.principles.map((p) => (
                      <span key={p} className="text-xs bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-gray-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                <span className="text-gray-400">Core size: <span className="text-white">{active.loc} LOC</span></span>
                <Button variant="gradient" size="sm" className="gap-1.5">
                  <Globe size={13} /> View Full Blueprint
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
