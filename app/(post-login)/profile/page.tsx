"use client"

import { Sidebar } from "@/components/swipe/sidebar"
import { ProfileContent } from "@/app/(post-login)/profile/profile-content"

export default function ProfilePage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-galatea-darker">
        <ProfileContent />
      </main>
    </div>
  )
}
