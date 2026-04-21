import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function ProfileTab() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    occupation: '',
    interests: '',
    bio: ''
  })
  const [isEditing, setIsEditing] = useState(true)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Profile updated:', formData)
    setIsEditing(false)
  }

  const genderOptions = [
    { value: '', label: 'Select gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'other', label: 'Other' }
  ]

  if (!isEditing) {
    return (
      <div className="bg-ivory-100 bg-opacity-70 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-earth-800 mb-6">Your Profile</h2>
        <div className="space-y-4">
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Age:</strong> {formData.age}</p>
          <p><strong>Gender:</strong> {formData.gender}</p>
          <p><strong>Occupation:</strong> {formData.occupation}</p>
          <p><strong>Interests:</strong> {formData.interests}</p>
          <p><strong>Bio:</strong> {formData.bio}</p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="mt-6 bg-rose-600 text-ivory-100 hover:bg-rose-700">
          Edit Profile
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-ivory-100 bg-opacity-70 rounded-lg shadow-xl p-8">
      <h2 className="text-3xl font-bold text-earth-800 mb-6">Edit Your Profile</h2>
      
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-ivory-200" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} required className="bg-ivory-200" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          options={genderOptions}
          className="bg-ivory-200"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="occupation">Occupation</Label>
        <Input id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} className="bg-ivory-200" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="interests">Interests (comma-separated)</Label>
        <Input id="interests" name="interests" value={formData.interests} onChange={handleChange} className="bg-ivory-200" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea 
          id="bio" 
          name="bio" 
          value={formData.bio} 
          onChange={handleChange} 
          className="bg-ivory-200" 
          rows={4}
          placeholder="Tell us about yourself..."
        />
      </div>
      
      <Button type="submit" className="w-full bg-rose-600 text-ivory-100 hover:bg-rose-700">
        Save Profile
      </Button>
    </form>
  )
}
