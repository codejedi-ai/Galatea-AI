"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Menu, X, LogOut, User, Settings } from "lucide-react"
import { useAuth } from "@/contexts/simple-auth-context"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { currentUser, logout } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

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
          {currentUser && (
            <>
              <Link href="/dashboard" className="text-gray-300 hover:text-teal-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/profile" className="text-gray-300 hover:text-teal-400 transition-colors">
                Profile
              </Link>
              <Link href="/start-swiping" className="text-gray-300 hover:text-teal-400 transition-colors">
                Discover
              </Link>
            </>
          )}
        </div>

        <div className="hidden md:flex space-x-4 items-center">
          {!mounted ? (
            // Show loading state during hydration
            <div className="w-24 h-8 bg-gray-700 rounded animate-pulse"></div>
          ) : currentUser ? (
            <>
              {/* Profile Section - Clickable */}
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 text-gray-300 hover:text-teal-400 transition-colors group"
              >
                {/* Profile Picture */}
                {currentUser.user_metadata?.avatar_url ? (
                  <img
                    src={currentUser.user_metadata.avatar_url || "/placeholder.svg"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-teal-500 group-hover:border-teal-400 transition-colors"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-500 group-hover:bg-teal-400 transition-colors flex items-center justify-center">
                    <User size={18} className="text-black" />
                  </div>
                )}
                {/* Username */}
                <span className="text-sm font-medium">
                  {currentUser.user_metadata?.full_name ||
                    currentUser.user_metadata?.name ||
                    currentUser.user_metadata?.preferred_username ||
                    currentUser.email?.split("@")[0]}
                </span>
              </Link>

              {/* Quick Action Buttons */}
              <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-teal-400 hover:bg-black/20">
                <Link href="/profile">
                  <Settings size={18} />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-300 hover:text-red-400 hover:bg-black/20"
              >
                <LogOut size={18} />
              </Button>
            </>
          ) : (
            <Button className="bg-teal-500 text-black hover:bg-teal-400" asChild>
              <Link href="/sign-in">Login</Link>
            </Button>
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
            {currentUser && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-teal-400 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-teal-400 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/start-swiping"
                  className="text-gray-300 hover:text-teal-400 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Discover
                </Link>
              </>
            )}
            <div className="flex flex-col space-y-2 pt-2">
              {!mounted ? (
                // Show loading state during hydration
                <div className="w-32 h-8 bg-gray-700 rounded animate-pulse"></div>
              ) : currentUser ? (
                <>
                  <div className="flex items-center space-x-3 text-gray-300 py-2">
                    {/* Profile Picture */}
                    {currentUser.user_metadata?.avatar_url ? (
                      <img
                        src={currentUser.user_metadata.avatar_url || "/placeholder.svg"}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border-2 border-teal-500"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                        <User size={18} className="text-black" />
                      </div>
                    )}
                    {/* Username */}
                    <span className="text-sm font-medium">
                      {currentUser.user_metadata?.full_name ||
                        currentUser.user_metadata?.name ||
                        currentUser.user_metadata?.preferred_username ||
                        currentUser.email?.split("@")[0]}
                    </span>
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
                <Button
                  className="bg-teal-500 text-black hover:bg-teal-400"
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href="/sign-in">Login</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
