"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useProfileAvatar } from '@/lib/hooks/use-profile-avatar'
import { AvatarSelector } from './avatar-selector'
import { LoadingSpinner } from '@/components/loading-spinner'

interface ProfileAvatarSectionProps {
  userId: string
}

export function ProfileAvatarSection({ userId }: ProfileAvatarSectionProps) {
  const [showSelector, setShowSelector] = useState(false)
  const { avatarOptions, currentAvatar, loading, updateAvatar } = useProfileAvatar(userId)

  const handleAvatarSelect = async (avatarUrl: string, source: string) => {
    const result = await updateAvatar(avatarUrl, source)
    if (result.success) {
      // Avatar updated successfully
      console.log(`Avatar updated to ${source} source`)
    } else {
      // Handle error
      console.error('Failed to update avatar:', result.error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center w-24 h-24 bg-gray-800 rounded-full">
        <LoadingSpinner size="small" />
      </div>
    )
  }

  return (
    <>
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-600">
          {currentAvatar ? (
            <Image
              src={currentAvatar}
              alt="Profile picture"
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Show change button when user has multiple avatar options */}
        {avatarOptions.length > 1 && (
          <button
            onClick={() => setShowSelector(true)}
            className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm"
          >
            Change
          </button>
        )}
        
        {/* If only one option, show edit button for uploading */}
        {avatarOptions.length <= 1 && (
          <button
            onClick={() => {/* Handle file upload */}}
            className="absolute -bottom-2 -right-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        )}
      </div>

      {/* Avatar Selector Modal */}
      {showSelector && (
        <AvatarSelector
          avatarOptions={avatarOptions}
          currentAvatar={currentAvatar}
          onSelect={handleAvatarSelect}
          onClose={() => setShowSelector(false)}
        />
      )}
    </>
  )
}
