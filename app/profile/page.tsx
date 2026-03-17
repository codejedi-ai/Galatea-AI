"use client";

import { useState, useRef, useEffect } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/contexts/simple-auth-context"
import { uploadProfilePicture, deleteProfilePicture } from "@/lib/storage"
import { createClient } from "@/utils/supabase/client"
import { CheckCircleIcon, UserIcon, Camera, Trash2, Upload, Facebook, Instagram, Mail, Link2, Link2Off, AlertCircle } from "lucide-react"

export default function Profile() {
  const { currentUser, logout, refreshUser } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [displayName, setDisplayName] = useState(currentUser?.user_metadata?.display_name || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>({})
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);

    try {
      // Update user metadata in Supabase
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      })

      if (error) {
        throw error
      }

      setSuccessMessage("Profile updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentUser) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    setIsUploadingImage(true)
    setError("")
    setSuccessMessage("")

    try {
      // Upload and get the new avatar URL immediately
      const newAvatarUrl = await uploadProfilePicture(currentUser.id, file)
      
      // Update local state immediately for real-time display
      setAvatarUrl(newAvatarUrl)
      setAvatarTimestamp(Date.now()) // Force image reload with cache-busting
      
      // Refresh user data in background to sync with auth context
      refreshUser().catch(err => console.error("Error refreshing user:", err))
      
      setSuccessMessage("Profile picture updated successfully!")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Failed to upload profile picture")
    } finally {
      setIsUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteImage = async () => {
    if (!currentUser) return

    setIsUploadingImage(true)
    setError("")
    setSuccessMessage("")

    try {
      // Delete profile picture using userId
      await deleteProfilePicture(currentUser.id)
      
      // Clear local avatar URL immediately
      setAvatarUrl(null)
      setAvatarTimestamp(Date.now()) // Force image reload
      
      // Refresh user data in background
      refreshUser().catch(err => console.error("Error refreshing user:", err))
      
      setSuccessMessage("Profile picture removed successfully!")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Failed to remove profile picture")
    } finally {
      setIsUploadingImage(false)
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to log out")
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Check connected accounts on mount
  useEffect(() => {
    checkConnectedAccounts()
  }, [currentUser])

  const checkConnectedAccounts = async () => {
    if (!currentUser) return
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.identities) {
        const providers = user.identities.map(identity => identity.provider)
        setConnectedAccounts({
          discord: providers.includes('discord'),
          google: providers.includes('google'),
          facebook: providers.includes('facebook'),
          instagram: false, // Instagram is not a standard OAuth provider in Supabase
        })
      }
    } catch (err) {
      console.error('Error checking connected accounts:', err)
    }
  }

  const handleConnectSocial = async (provider: 'discord' | 'google' | 'facebook') => {
    if (!currentUser) return
    
    setIsConnecting(provider)
    setError("")
    
    try {
      const supabase = createClient()
      const { data, error: oauthError } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=/profile`,
        }
      })
      
      if (oauthError) {
        // If linking fails, try OAuth sign-in which will link if user is already logged in
        const { error: signInError } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback?redirect=/profile`,
          }
        })
        
        if (signInError) {
          throw signInError
        }
      }
    } catch (err: any) {
      setError(err.message || `Failed to connect ${provider}`)
      setIsConnecting(null)
    }
  }

  const handleDisconnectSocial = async (provider: string) => {
    if (!currentUser) return
    
    setIsConnecting(provider)
    setError("")
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.identities) {
        const identityToRemove = user.identities.find(identity => identity.provider === provider)
        
        if (identityToRemove) {
          // Note: Supabase doesn't have a direct unlink method in the client
          // This would typically require a server-side function
          setError("Disconnecting accounts requires server-side support. Please contact support.")
        }
      }
    } catch (err: any) {
      setError(err.message || `Failed to disconnect ${provider}`)
    } finally {
      setIsConnecting(null)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'discord':
        return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/></svg>
      case 'google':
        return <Mail className="w-5 h-5" />
      case 'facebook':
        return <Facebook className="w-5 h-5" />
      case 'instagram':
        return <Instagram className="w-5 h-5" />
      default:
        return <Link2 className="w-5 h-5" />
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'discord':
        return 'Discord'
      case 'google':
        return 'Gmail'
      case 'facebook':
        return 'Facebook'
      case 'instagram':
        return 'Instagram'
      default:
        return provider
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navbar />

        <main className="container mx-auto px-6 pt-24 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              {/* Profile Picture Section */}
              <div className="relative mx-auto h-32 w-32 mb-4">
                <div 
                  className="relative h-full w-full rounded-full overflow-hidden bg-gray-900 border-4 border-gray-800 cursor-pointer group"
                  onClick={handleProfilePictureClick}
                >
                  {avatarUrl ? (
                    <Image
                      key={`${avatarUrl}-${avatarTimestamp}`}
                      src={`${avatarUrl}?t=${avatarTimestamp}`}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized
                      priority
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-800">
                      <UserIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  {!isUploadingImage && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  )}

                  {/* Loading overlay */}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <LoadingSpinner size="small" />
                    </div>
                  )}
                </div>

              </div>

              {/* Hidden file input */}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

              <h1 className="text-3xl font-bold">Your Profile</h1>
              <p className="text-gray-400 mt-2">{currentUser?.email}</p>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
                <AlertCircle size={20} />
                <span>{error}</span>
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
                  placeholder="Enter your display name"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || isUploadingImage}
                className="w-full bg-teal-500 text-black hover:bg-teal-400"
              >
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>

              <div className="pt-4 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="w-full border-gray-800 hover:bg-teal-500/10 hover:text-teal-400 hover:border-teal-500"
                >
                  <a href="/swipe">Start Swiping</a>
                </Button>

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

            {/* MetaMask Wallet Connection */}
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-white mb-3">MetaMask Wallet</h3>
              <p className="text-xs text-gray-400 mb-4">
                Connect your MetaMask wallet to your account. Each account can have one wallet connected.
              </p>
              <MetaMaskConnector showStatus={true} />
            </div>

            {/* Social Media Connections */}
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-white mb-4">Connected Accounts</h3>
              <div className="space-y-3">
                {['discord', 'google', 'facebook', 'instagram'].map((provider) => {
                  const isConnected = connectedAccounts[provider] || false
                  const isProcessing = isConnecting === provider
                  
                  return (
                    <div
                      key={provider}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-teal-400">
                          {getProviderIcon(provider)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {getProviderName(provider)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {isConnected ? 'Connected' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => 
                          isConnected 
                            ? handleDisconnectSocial(provider)
                            : handleConnectSocial(provider as 'discord' | 'google' | 'facebook')
                        }
                        disabled={isProcessing || provider === 'instagram'}
                        className="border-gray-600 hover:bg-teal-500/10 hover:border-teal-500 hover:text-teal-400"
                      >
                        {isProcessing ? (
                          <LoadingSpinner size="small" />
                        ) : isConnected ? (
                          <>
                            <Link2Off className="w-4 h-4 mr-2" />
                            Disconnect
                          </>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Note: Instagram connection requires additional setup. Connect your accounts to enhance your profile and enable social features.
              </p>
            </div>

            {/* Upload instructions */}
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
              <div className="flex items-start gap-3">
                <Upload className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Profile Picture Tips</h3>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Use a clear, well-lit photo</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Supported formats: JPG, PNG, GIF</li>
                    <li>• Square images work best</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>

        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-950 to-transparent -z-10"></div>

        {/* Change Profile Picture Dialog */}
        <Dialog open={showChangePictureDialog} onOpenChange={setShowChangePictureDialog}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Change Profile Picture</DialogTitle>
              <DialogDescription className="text-gray-400">
                Choose an option to update your profile picture
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploadingImage}
                className="w-full bg-teal-500 text-black hover:bg-teal-400 justify-start"
              >
                <Camera className="h-4 w-4 mr-2" />
                {avatarUrl ? "Upload New Picture" : "Upload Picture"}
              </Button>
              {avatarUrl && (
                <Button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={isUploadingImage}
                  variant="outline"
                  className="w-full border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300 justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Current Picture
                </Button>
              )}
              <Button
                type="button"
                onClick={() => setShowChangePictureDialog(false)}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
