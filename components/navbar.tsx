"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Cpu } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-aura-darker/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Cpu size={22} className="text-aura-blue" />
            <span className="text-xl font-bold text-gradient">Galatea AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/companions" className="text-gray-300 hover:text-white transition-colors text-sm">
              Companions
            </Link>
            <Link href="/matches" className="text-gray-300 hover:text-white transition-colors text-sm">
              Matches
            </Link>
            <Link href="#blueprint" className="text-gray-300 hover:text-white transition-colors text-sm">
              Blueprint Studio
            </Link>
            <Link href="#a2a" className="text-gray-300 hover:text-white transition-colors text-sm">
              A2A Protocol
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" className="text-gray-300 hover:text-white text-sm">
              Sign In
            </Button>
            <Button variant="gradient" className="text-sm">Deploy Your Agent</Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-4">
            {["/companions", "/matches", "#blueprint", "#a2a"].map((href, i) => {
              const labels = ["Companions", "Matches", "Blueprint Studio", "A2A Protocol"]
              return (
                <Link
                  key={href}
                  href={href}
                  className="block py-2 text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {labels[i]}
                </Link>
              )
            })}
            <div className="pt-2 flex flex-col space-y-2">
              <Button variant="ghost" className="justify-center text-gray-300 hover:text-white">
                Sign In
              </Button>
              <Button variant="gradient" className="justify-center">Deploy Your Agent</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
