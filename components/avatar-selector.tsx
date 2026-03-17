"use client"

import { useState } from "react"
import Image from "next/image"

interface AvatarOption {
  id: string
  url: string
  source: 'email' | 'upload'
  label: string
}

interface AvatarSelectorProps {
  avatarOptions: AvatarOption[]
  currentAvatar?: string
  onSelect: (avatarUrl: string, source: string) => void
  onClose: () => void
}

export function AvatarSelector({ avatarOptions, currentAvatar, onSelect, onClose }: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || avatarOptions[0]?.url)

  const handleSave = () => {
    const selected = avatarOptions.find(option => option.url === selectedAvatar)
    if (selected) {
      onSelect(selected.url, selected.source)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-4">Choose Your Profile Picture</h3>
        
        <div className="space-y-4">
          {avatarOptions.map((option) => (
            <div
              key={option.id}
              className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedAvatar === option.url
                  ? 'bg-teal-600/20 border border-teal-500'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
              onClick={() => setSelectedAvatar(option.url)}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={option.url}
                  alt={option.label}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{option.label}</p>
                <p className="text-gray-400 text-sm capitalize">From {option.source}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedAvatar === option.url
                  ? 'bg-teal-500 border-teal-500'
                  : 'border-gray-400'
              }`}>
                {selectedAvatar === option.url && (
                  <div className="w-full h-full rounded-full bg-white/20"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
