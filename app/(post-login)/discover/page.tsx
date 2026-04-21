"use client"

import { Sidebar } from "@/components/swipe/sidebar"
import { SwipeInterface } from "./swipe-interface"

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
