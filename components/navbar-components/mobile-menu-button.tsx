"use client"

import { Menu, X } from "lucide-react"

interface MobileMenuButtonProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export function MobileMenuButton({ isMobileMenuOpen, setIsMobileMenuOpen }: MobileMenuButtonProps) {
  return (
    <button 
      className="md:hidden text-white" 
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      aria-label="Toggle mobile menu"
    >
      {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  )
}
