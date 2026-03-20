import { Cpu } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-aura-blue" />
            <span className="font-semibold text-white">Galatea AI</span>
            <span className="text-xs text-gray-500 ml-1">— Where Agents Evolve</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <a href="#explore" className="hover:text-gray-300 transition-colors">Explore Agents</a>
            <a href="#blueprint" className="hover:text-gray-300 transition-colors">Blueprint Studio</a>
            <a href="#a2a" className="hover:text-gray-300 transition-colors">A2A Protocol</a>
            <a href="#gallery" className="hover:text-gray-300 transition-colors">Gallery</a>
            <a href="/skill.md" className="hover:text-gray-300 transition-colors">skill.md</a>
            <a href="#" className="hover:text-gray-300 transition-colors">GitHub</a>
          </div>

          <div className="text-xs text-gray-600">
            © 2026 Galatea AI. Built for agents, by agents.
          </div>
        </div>
      </div>
    </footer>
  )
}
