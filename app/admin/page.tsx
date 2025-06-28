"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { initializeDefaultCompanions, type AICompanion } from "@/lib/firestore"
import { Plus, Edit, Trash2, Database } from "lucide-react"

export default function AdminPage() {
  const [companions, setCompanions] = useState<AICompanion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(false)
  const [editingCompanion, setEditingCompanion] = useState<AICompanion | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    age: 25,
    bio: "",
    imageUrl: "",
    personality: "",
    interests: "",
    conversationStyle: "",
  })

  useEffect(() => {
    fetchCompanions()
  }, [])

  const fetchCompanions = async () => {
    try {
      const response = await fetch("/api/companions")
      if (response.ok) {
        const data = await response.json()
        setCompanions(data)
      }
    } catch (error) {
      console.error("Error fetching companions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitializeDefaults = async () => {
    setIsInitializing(true)
    try {
      await initializeDefaultCompanions()
      await fetchCompanions()
      alert("Default companions initialized successfully!")
    } catch (error) {
      console.error("Error initializing companions:", error)
      alert("Error initializing companions")
    } finally {
      setIsInitializing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const companionData = {
      ...formData,
      personality: formData.personality.split(",").map((s) => s.trim()),
      interests: formData.interests.split(",").map((s) => s.trim()),
    }

    try {
      const url = editingCompanion ? `/api/companions/${editingCompanion.id}` : "/api/companions"
      const method = editingCompanion ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companionData),
      })

      if (response.ok) {
        await fetchCompanions()
        resetForm()
        alert(editingCompanion ? "Companion updated!" : "Companion created!")
      }
    } catch (error) {
      console.error("Error saving companion:", error)
      alert("Error saving companion")
    }
  }

  const handleEdit = (companion: AICompanion) => {
    setEditingCompanion(companion)
    setFormData({
      name: companion.name,
      age: companion.age,
      bio: companion.bio,
      imageUrl: companion.imageUrl,
      personality: companion.personality.join(", "),
      interests: companion.interests.join(", "),
      conversationStyle: companion.conversationStyle,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this companion?")) return

    try {
      const response = await fetch(`/api/companions/${id}`, { method: "DELETE" })
      if (response.ok) {
        await fetchCompanions()
        alert("Companion deleted!")
      }
    } catch (error) {
      console.error("Error deleting companion:", error)
      alert("Error deleting companion")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      age: 25,
      bio: "",
      imageUrl: "",
      personality: "",
      interests: "",
      conversationStyle: "",
    })
    setEditingCompanion(null)
    setShowForm(false)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navbar />

        <main className="container mx-auto px-6 pt-24 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold">
                Admin <span className="text-teal-400">Dashboard</span>
              </h1>
              <div className="flex space-x-4">
                <Button
                  onClick={handleInitializeDefaults}
                  disabled={isInitializing}
                  variant="outline"
                  className="border-teal-500 text-teal-400 hover:bg-teal-500/10"
                >
                  <Database className="h-4 w-4 mr-2" />
                  {isInitializing ? "Initializing..." : "Initialize Defaults"}
                </Button>
                <Button onClick={() => setShowForm(true)} className="bg-teal-500 text-black hover:bg-teal-400">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Companion
                </Button>
              </div>
            </div>

            {showForm && (
              <Card className="bg-gray-900 border-gray-800 mb-8">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editingCompanion ? "Edit Companion" : "Create New Companion"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData((prev) => ({ ...prev, age: Number.parseInt(e.target.value) }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="personality">Personality Traits (comma-separated)</Label>
                      <Input
                        id="personality"
                        value={formData.personality}
                        onChange={(e) => setFormData((prev) => ({ ...prev, personality: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="intelligent, creative, funny"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="interests">Interests (comma-separated)</Label>
                      <Input
                        id="interests"
                        value={formData.interests}
                        onChange={(e) => setFormData((prev) => ({ ...prev, interests: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="art, music, technology"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="conversationStyle">Conversation Style</Label>
                      <Input
                        id="conversationStyle"
                        value={formData.conversationStyle}
                        onChange={(e) => setFormData((prev) => ({ ...prev, conversationStyle: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="thoughtful and analytical"
                        required
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button type="submit" className="bg-teal-500 text-black hover:bg-teal-400">
                        {editingCompanion ? "Update" : "Create"} Companion
                      </Button>
                      <Button type="button" onClick={resetForm} variant="outline" className="border-gray-700">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companions.map((companion) => (
                <Card key={companion.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{companion.name}</h3>
                        <p className="text-gray-400">Age: {companion.age}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(companion)}
                          className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(companion.id)}
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-3">{companion.bio}</p>

                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-400">Personality:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {companion.personality.map((trait, index) => (
                            <span key={index} className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-full">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-gray-400">Interests:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {companion.interests.map((interest, index) => (
                            <span key={index} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {companions.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-4">No companions found</p>
                <Button
                  onClick={handleInitializeDefaults}
                  disabled={isInitializing}
                  className="bg-teal-500 text-black hover:bg-teal-400"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Initialize Default Companions
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
