"use client"

import { useState, useEffect } from "react"
import { Menu, X, User, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/simple-auth-context"
import { getUserAvatarUrl } from "@/lib/utils/avatar"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const backendAvailable = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { currentUser, logout } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (currentUser) {
      getUserAvatarUrl(currentUser).then(url => {
        setAvatarUrl(url)
      }).catch(() => {
        setAvatarUrl(null)
      })
    } else {
      setAvatarUrl(null)
    }
  }, [currentUser])

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

  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up"

  // Render the sign-in area based on backend status
  const renderAuthArea = () => {
    if (!mounted) return null
    if (currentUser) {
      return (
        <>
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 text-gray-300 hover:text-[#00FFFF] transition-colors group"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border-2 border-[#00FFFF] group-hover:border-[#00FFFF]/80 transition-colors object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#00FFFF] group-hover:bg-[#00FFFF]/80 transition-colors flex items-center justify-center">
                <User size={18} className="text-[#0a0a1a]" />
              </div>
            )}
            <span className="text-sm font-medium">
              {currentUser.user_metadata?.full_name ||
                currentUser.user_metadata?.name ||
                currentUser.user_metadata?.preferred_username ||
                currentUser.email?.split("@")[0]}
            </span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-300 hover:text-red-400 hover:bg-black/20"
          >
            <LogOut size={18} />
          </Button>
        </>
      )
    }
    if (isAuthPage) return null
    if (!backendAvailable) {
      return (
        <span className="text-gray-500 text-sm font-mono cursor-not-allowed" title="No backend connected">
          Sign in unavailable
        </span>
      )
    }
    return (
      <Button className="bg-[#00FFFF] text-[#0a0a1a] hover:bg-[#00FFFF]/80 font-semibold" asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
    )
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/60 backdrop-blur-md border-b border-[#00FFFF]/20" : "bg-transparent backdrop-blur-sm"
      }`}
    >
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />

        {currentUser && (
          <div className="hidden md:flex space-x-6">
            <Link href="/dashboard" className="text-gray-300 hover:text-[#00FFFF] transition-colors">Dashboard</Link>
            <Link href="/profile" className="text-gray-300 hover:text-[#00FFFF] transition-colors">Profile</Link>
            <Link href="/swipe" className="text-gray-300 hover:text-[#00FFFF] transition-colors">Swipe</Link>
            <Link href="/matches" className="text-gray-300 hover:text-[#00FFFF] transition-colors">Matches</Link>
            <Link href="/chats" className="text-gray-300 hover:text-[#00FFFF] transition-colors">Chats</Link>
          </div>
        )}

        <div className="hidden md:flex items-center space-x-4">
          {renderAuthArea()}
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            {currentUser && (
              <>
                <Link href="/dashboard" className="text-gray-300 hover:text-[#00FFFF] transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                <Link href="/profile" className="text-gray-300 hover:text-[#00FFFF] transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                <Link href="/swipe" className="text-gray-300 hover:text-[#00FFFF] transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>Swipe</Link>
                <Link href="/matches" className="text-gray-300 hover:text-[#00FFFF] transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>Matches</Link>
                <Link href="/chats" className="text-gray-300 hover:text-[#00FFFF] transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>Chats</Link>
              </>
            )}
            <div className="flex flex-col space-y-2 pt-2">
              {mounted && (
                currentUser ? (
                  <>
                    <div className="flex items-center space-x-3 text-gray-300 py-2">
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-[#00FFFF] object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#00FFFF] flex items-center justify-center">
                          <User size={18} className="text-[#0a0a1a]" />
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {currentUser.user_metadata?.full_name ||
                          currentUser.user_metadata?.name ||
                          currentUser.user_metadata?.preferred_username ||
                          currentUser.email?.split("@")[0]}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false) }}
                      className="text-gray-300 hover:text-[#00FFFF] justify-start"
                    >
                      <LogOut size={18} className="mr-2" />
                      Log Out
                    </Button>
                  </>
                ) : !isAuthPage ? (
                  !backendAvailable ? (
                    <span className="text-gray-500 text-sm font-mono py-2 cursor-not-allowed">Sign in unavailable</span>
                  ) : (
                    <Button className="bg-[#00FFFF] text-[#0a0a1a] hover:bg-[#00FFFF]/80 font-semibold" asChild>
                      <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                  )
                ) : null
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
