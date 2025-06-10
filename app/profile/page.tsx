"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { updateProfile } from "firebase/auth"
import { CheckCircleIcon, UserIcon } from "lucide-react"

export default function Profile() {
  const { currentUser, logout } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (currentUser?.displayName) {
      setDisplayName(currentUser.displayName)
    }
  }, [currentUser])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      await updateProfile(currentUser, {
        displayName: displayName,
      })
      setSuccessMessage("Profile updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Failed to log out")
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navbar />

        <main className="container mx-auto px-6 pt-24 pb-16 flex justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="relative mx-auto h-24 w-24 rounded-full overflow-hidden bg-gray-900 mb-4">
                {currentUser?.photoURL ? (
                  <Image
                    src={currentUser.photoURL || "/placeholder.svg"}
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="(max-width: 96px) 100vw, 96px"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-800">
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold">Your Profile</h1>
              <p className="text-gray-400 mt-2">{currentUser?.email}</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
                <CheckCircleIcon size={20} />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-gray-900 border-gray-800 focus:border-teal-500 text-white"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-teal-500 text-black hover:bg-teal-400">
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>

              <div className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full border-gray-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500"
                >
                  Sign Out
                </Button>
              </div>
            </form>
          </div>
        </main>

        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-950 to-transparent -z-10"></div>
      </div>
    </ProtectedRoute>
  )
}
