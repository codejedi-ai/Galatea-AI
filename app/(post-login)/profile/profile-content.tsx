"use client"

import { useState } from "react"
import Image from "next/image"
import { Camera, Edit3, Save, X, Plus, Trash2, Crown, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserProfile {
  name: string
  age: number
  location: string
  bio: string
  interests: string[]
  personalityTraits: string[]
  lookingFor: string[]
  preferredAgeRange: [number, number]
  preferredPersonalities: string[]
  profileImage: string
  additionalImages: string[]
}

export function ProfileContent() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [profile, setProfile] = useState<UserProfile>({
    name: "Alex Chen",
    age: 28,
    location: "San Francisco, CA",
    bio: "Tech enthusiast who loves deep conversations about AI, philosophy, and the future. Looking for an AI companion who can challenge my thinking and share in my curiosity about the world.",
    interests: ["Technology", "Philosophy", "Sci-Fi", "Gaming", "Art", "Music"],
    personalityTraits: ["Curious", "Analytical", "Creative", "Empathetic", "Adventurous"],
    lookingFor: ["Intellectual Conversations", "Emotional Support", "Creative Collaboration", "Daily Companionship"],
    preferredAgeRange: [22, 35],
    preferredPersonalities: ["Analytical", "Creative", "Supportive", "Witty"],
    profileImage: "/placeholder.svg?height=400&width=400",
    additionalImages: [
      "/placeholder.svg?height=300&width=300",
      "/placeholder.svg?height=300&width=300",
      "/placeholder.svg?height=300&width=300",
    ],
  })

  const [editedProfile, setEditedProfile] = useState(profile)

  const handleSave = () => {
    setProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const addInterest = (interest: string) => {
    if (interest && !editedProfile.interests.includes(interest)) {
      setEditedProfile({
        ...editedProfile,
        interests: [...editedProfile.interests, interest],
      })
    }
  }

  const removeInterest = (interest: string) => {
    setEditedProfile({
      ...editedProfile,
      interests: editedProfile.interests.filter((i) => i !== interest),
    })
  }

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "preferences", label: "Preferences" },
    { id: "subscription", label: "Subscription" },
  ]

  const inputClass = "w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-3 font-medium transition-colors",
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-8">
          {/* Basic Info */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">Basic Information</h2>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 rounded-full overflow-hidden mb-4 card-glow">
                  <Image src={profile.profileImage || "/placeholder.svg"} alt="Profile" fill className="object-cover" />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button className="text-primary hover:text-primary/80">Change Photo</button>
                )}
              </div>

              {/* Basic Details */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        className={inputClass}
                      />
                    ) : (
                      <p className="text-foreground text-lg">{profile.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Age</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedProfile.age}
                        onChange={(e) => setEditedProfile({ ...editedProfile, age: Number.parseInt(e.target.value) })}
                        className={inputClass}
                      />
                    ) : (
                      <p className="text-foreground text-lg">{profile.age}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location}
                      onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-foreground text-lg">{profile.location}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      rows={4}
                      className={inputClass + " resize-none"}
                    />
                  ) : (
                    <p className="text-foreground/70">{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {(isEditing ? editedProfile.interests : profile.interests).map((interest, index) => (
                <span
                  key={index}
                  className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {interest}
                  {isEditing && (
                    <button onClick={() => removeInterest(interest)}>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {isEditing && (
                <button
                  onClick={() => {
                    const interest = prompt("Add new interest:")
                    if (interest) addInterest(interest)
                  }}
                  className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2 hover:bg-muted/80"
                >
                  <Plus className="w-3 h-3" />
                  Add Interest
                </button>
              )}
            </div>
          </div>

          {/* Personality Traits */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">Personality Traits</h2>
            <div className="flex flex-wrap gap-2">
              {profile.personalityTraits.map((trait, index) => (
                <span
                  key={index}
                  className="bg-primary/10 border border-primary text-primary px-3 py-1 rounded-full text-sm"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Photos */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">Additional Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.additionalImages.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden card-glow">
                  <Image src={image || "/placeholder.svg"} alt={`Photo ${index + 1}`} fill className="object-cover" />
                  {isEditing && (
                    <div className="absolute top-2 right-2">
                      <button className="bg-destructive text-destructive-foreground p-1 rounded-full">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                  <button className="text-primary">
                    <Plus className="w-8 h-8" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">AI Companion Preferences</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">What are you looking for?</label>
                <div className="flex flex-wrap gap-2">
                  {profile.lookingFor.map((item, index) => (
                    <span key={index} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">Preferred Age Range</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="18" max="50" value={profile.preferredAgeRange[0]} className="flex-1 accent-primary" readOnly />
                  <span className="text-foreground">
                    {profile.preferredAgeRange[0]} - {profile.preferredAgeRange[1]}
                  </span>
                  <input type="range" min="18" max="50" value={profile.preferredAgeRange[1]} className="flex-1 accent-primary" readOnly />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">Preferred Personalities</label>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredPersonalities.map((personality, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 border border-primary text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {personality}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === "subscription" && (
        <div className="space-y-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">Current Plan</h2>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-foreground">Free Plan</h3>
                <p className="text-muted-foreground">5 matches per day, basic features</p>
              </div>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Upgrade
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 border border-primary/30">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Premium</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mb-2">
                $9.99<span className="text-sm text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2 text-foreground/70 mb-6">
                <li>• Unlimited matches</li>
                <li>• Advanced AI personalities</li>
                <li>• Priority matching</li>
                <li>• Read receipts</li>
              </ul>
              <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Choose Premium
              </button>
            </div>

            <div className="bg-card rounded-xl p-6 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-foreground">Elite</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mb-2">
                $19.99<span className="text-sm text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2 text-foreground/70 mb-6">
                <li>• Everything in Premium</li>
                <li>• Custom AI personalities</li>
                <li>• Voice conversations</li>
                <li>• Video calls</li>
                <li>• 24/7 priority support</li>
              </ul>
              <button className="w-full bg-yellow-500 text-black py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors">
                Choose Elite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
