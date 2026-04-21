"use client"

import { SwipeInterface } from "@/app/(post-login)/discover/swipe-interface"
import { Sidebar } from "@/components/swipe/sidebar"

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden bg-galatea-darker">
        <div className="h-full max-w-2xl mx-auto">
          <SwipeInterface />
        </div>
      </main>
    </div>
  )
}
