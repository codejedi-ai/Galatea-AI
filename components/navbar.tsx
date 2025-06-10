"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Menu, X, LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { currentUser, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Failed to log out:", error)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/60 backdrop-blur-md border-b border-teal-500/20" : "bg-transparent backdrop-blur-sm"
      }`}
    >
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo - already contains Link, so don't wrap it */}
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link href="/about" className="text-gray-300 hover:text-teal-400 transition-colors">
            About
          </Link>
          <Link href="/profile-setup" className="text-gray-300 hover:text-teal-400 transition-colors">
            Profile
          </Link>
          <Link href="/companions" className="text-gray-300 hover:text-teal-400 transition-colors">
            Companions
          </Link>
        </div>

        <div className="hidden md:flex space-x-2 items-center">
          {currentUser ? (
            <>
              <div className="flex items-center space-x-2 text-gray-300">
                <User size={18} />
                <span className="text-sm">{currentUser.displayName || currentUser.email}</span>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-300 hover:text-teal-400 hover:bg-black/20"
              >
                <LogOut size={18} className="mr-2" />
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-gray-300 hover:text-teal-400 hover:bg-black/20" asChild>
                <Link href="/sign-in">Log In</Link>
              </Button>
              <Button className="bg-teal-500 text-black hover:bg-teal-400" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            <Link
              href="/about"
              className="text-gray-300 hover:text-teal-400 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/profile-setup"
              className="text-gray-300 hover:text-teal-400 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="/companions"
              className="text-gray-300 hover:text-teal-400 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Companions
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              {currentUser ? (
                <>
                  <div className="flex items-center space-x-2 text-gray-300 py-2">
                    <User size={18} />
                    <span className="text-sm">{currentUser.displayName || currentUser.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="text-gray-300 hover:text-teal-400 justify-start"
                  >
                    <LogOut size={18} className="mr-2" />
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-teal-400 justify-start"
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href="/sign-in">Log In</Link>
                  </Button>
                  <Button
                    className="bg-teal-500 text-black hover:bg-teal-400"
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
