"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Heart, MessageSquare, Settings, User, LogOut, Sparkles, Zap, Search, Bell } from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [activeItem, setActiveItem] = useState("discover")

  useEffect(() => {
    if (pathname === "/") {
      setActiveItem("discover")
    } else if (pathname.startsWith("/profile")) {
      setActiveItem("profile")
    } else if (pathname.startsWith("/matches")) {
      setActiveItem("matches")
    } else if (pathname.startsWith("/messages")) {
      setActiveItem("messages")
    } else if (pathname.startsWith("/search")) {
      setActiveItem("search")
    } else if (pathname.startsWith("/notifications")) {
      setActiveItem("notifications")
    } else if (pathname.startsWith("/boost")) {
      setActiveItem("boost")
    } else if (pathname.startsWith("/settings")) {
      setActiveItem("settings")
    }
  }, [pathname])

  const menuItems = [
    { id: "discover", label: "Discover", icon: Sparkles, href: "/discover" },
    { id: "matches", label: "Matches", icon: Heart, href: "/matches", badge: 3 },
    { id: "messages", label: "Messages", icon: MessageSquare, href: "/messages", badge: 5 },
    { id: "search", label: "Search", icon: Search, href: "/search" },
    { id: "notifications", label: "Notifications", icon: Bell, href: "/notifications", badge: 2 },
    { id: "boost", label: "Boost Profile", icon: Zap, href: "/boost" },
  ]

  const bottomMenuItems = [
    { id: "profile", label: "Profile", icon: User, href: "/profile" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
    { id: "logout", label: "Logout", icon: LogOut, href: "/logout" },
  ]

  return (
    <div className={cn("flex flex-col h-full bg-card border-r border-border w-64 py-6", className)}>
      <div className="px-6 mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Galatea<span className="text-primary">.AI</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "sidebar-item group",
                activeItem === item.id ? "sidebar-item-active" : "sidebar-item-inactive",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  activeItem === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span>{item.label}</span>
              {item.badge && (
                <div className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-3">
        <div className="pt-4 border-t border-border">
          <nav className="space-y-1">
            {bottomMenuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "sidebar-item group",
                  activeItem === item.id ? "sidebar-item-active" : "sidebar-item-inactive",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    activeItem === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
