"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { User, Settings, LogOut } from "lucide-react"
import { NavbarProps } from "./navbar-types"
import { getUserAvatarUrl } from "@/lib/utils/avatar"

interface UserProfileSectionProps {
  currentUser: NavbarProps["currentUser"]
  handleLogout: NavbarProps["handleLogout"]
  mounted: NavbarProps["mounted"]
  isAuthPage: NavbarProps["isAuthPage"]
}

export function UserProfileSection({ 
  currentUser, 
  handleLogout, 
  mounted, 
  isAuthPage 
}: UserProfileSectionProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

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
  if (!mounted) {
    // Show loading state during hydration
    return <div className="w-24 h-8 bg-gray-700 rounded animate-pulse"></div>
  }

  if (currentUser && !isAuthPage) {
    return (
      <>
        {/* Profile Section - Clickable */}
        <Link
          href="/dashboard"
          className="flex items-center space-x-3 text-gray-300 hover:text-teal-400 transition-colors group"
        >
          {/* Profile Picture */}
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border-2 border-teal-500 group-hover:border-teal-400 transition-colors object-cover"
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
    )
  }

  if (!currentUser && !isAuthPage) {
    return (
      <Button className="bg-teal-500 text-black hover:bg-teal-400" asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
    )
  }

  return null
}
