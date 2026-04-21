"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Cookies from "js-cookie"

export function ProfileSetupForm() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    occupation: "",
    interests: "",
    bio: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    // Load profile data from cookies on component mount
    const savedProfile = Cookies.get("userProfile")
    if (savedProfile) {
      setFormData(JSON.parse(savedProfile))
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Save profile data to cookies
    Cookies.set("userProfile", JSON.stringify(formData), { expires: 365 }) // Expires in 1 year
    console.log("Profile saved:", formData)
    setIsSubmitted(true)
  }

  const genderOptions = [
    { value: "", label: "Select gender" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "non-binary", label: "Non-binary" },
    { value: "other", label: "Other" },
  ]

  if (isSubmitted) {
    return (
      <div className="text-center p-8 bg-muted/50 rounded-lg border border-primary/30">
        <h2 className="text-2xl font-bold text-primary mb-4">Profile Saved Successfully!</h2>
        <p className="text-foreground/70 mb-6">Thank you for setting up your profile, {formData.name}.</p>
        <Button onClick={() => setIsSubmitted(false)}>Edit Profile</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground/80">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="bg-muted border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="age" className="text-foreground/80">
          Age
        </Label>
        <Input
          id="age"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          required
          className="bg-muted border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender" className="text-foreground/80">
          Gender
        </Label>
        <Select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          options={genderOptions}
          className="bg-muted border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="occupation" className="text-foreground/80">
          Occupation
        </Label>
        <Input
          id="occupation"
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
          className="bg-muted border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interests" className="text-foreground/80">
          Interests (comma-separated)
        </Label>
        <Input
          id="interests"
          name="interests"
          value={formData.interests}
          onChange={handleChange}
          className="bg-muted border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-foreground/80">
          Bio
        </Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="bg-muted border-border focus:border-primary"
          rows={4}
          placeholder="Tell us about yourself..."
        />
      </div>

      <Button type="submit" className="w-full py-6 text-lg">
        Save Profile
      </Button>
    </form>
  )
}
