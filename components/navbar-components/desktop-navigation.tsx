"use client"

import Link from "next/link"
import { NavbarProps } from "./navbar-types"

interface DesktopNavigationProps {
  currentUser: NavbarProps["currentUser"]
}

export function DesktopNavigation({ currentUser }: DesktopNavigationProps) {
  return (
    <div className="hidden md:flex space-x-6">
      {currentUser && (
        <>
          <Link href="/dashboard" className="text-gray-300 hover:text-teal-400 transition-colors">
            Dashboard
          </Link>
          <Link href="/profile" className="text-gray-300 hover:text-teal-400 transition-colors">
            Profile
          </Link>
          <Link href="/swipe" className="text-gray-300 hover:text-teal-400 transition-colors">
            Swipe
          </Link>
        </>
      )}
    </div>
  )
}
