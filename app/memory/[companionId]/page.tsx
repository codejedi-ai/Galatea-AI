"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Brain, Calendar, Heart, MessageCircle, Plus, CreditCard as Edit, Save, X, Tag } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface MemoryEntry {
  id: string
  title: string
  content: string
  category: 'personality' | 'preference' | 'memory' | 'goal' | 'relationship'
  tags: string[]
  importance: 1 | 2 | 3 | 4 | 5
  created_at: string
  updated_at: string
}

interface Companion {
  id: string
  name: string
  age: number
  image_url: string
  personality: string
  bio: string
}

const categoryColors = {
  personality: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  preference: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  memory: 'bg-green-500/20 text-green-300 border-green-500/30',
  goal: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  relationship: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
}

const categoryIcons = {
  personality: '🧠',
  preference: '❤️',
  memory: '💭',
  goal: '🎯',
  relationship: '💕'
}

export default function MemoryLogPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const companionId = params.companionId as string

  const [companion, setCompanion] = useState<Companion | null>(null)
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [filteredMemories, setFilteredMemories] = useState<MemoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isAddingMemory, setIsAddingMemory] = useState(false)
  const [editingMemory, setEditingMemory] = useState<string | null>(null)
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    category: 'memory' as MemoryEntry['category'],
    tags: [] as string[],
    importance: 3 as MemoryEntry['importance']
  })

  useEffect(() => {
    loadCompanionAndMemories()
  }, [companionId])

  useEffect(() => {
    filterMemories()
  }, [memories, searchQuery, selectedCategory])

  const loadCompanionAndMemories = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Load companion details
      const { data: companionData, error: companionError } = await supabase
        .from('companions')
        .select('id, name, age, image_url, personality, bio')
        .eq('id', companionId)
        .single()

      if (companionError) throw companionError
      setCompanion(companionData)

      // Load memory entries
      const { data: memoriesData, error: memoriesError } = await supabase
        .from('memory_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('companion_id', companionId)
        .order('updated_at', { ascending: false })

      if (memoriesError && memoriesError.code !== 'PGRST116') {
        throw memoriesError
      }

      setMemories(memoriesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load memory log",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterMemories = () => {
    let filtered = memories

    if (searchQuery) {
      filtered = filtered.filter(memory =>
        memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memory => memory.category === selectedCategory)
    }

    // Sort by importance and date
    filtered.sort((a, b) => {
      if (a.importance !== b.importance) {
        return b.importance - a.importance
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

    setFilteredMemories(filtered)
  }

  const saveMemory = async () => {
    if (!newMemory.title.trim() || !newMemory.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive"
      })
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('memory_entries')
        .insert({
          user_id: user.id,
          companion_id: companionId,
          title: newMemory.title.trim(),
          content: newMemory.content.trim(),
          category: newMemory.category,
          tags: newMemory.tags,
          importance: newMemory.importance
        })
        .select()
        .single()

      if (error) throw error

      setMemories(prev => [data, ...prev])
      setNewMemory({
        title: '',
        content: '',
        category: 'memory',
        tags: [],
        importance: 3
      })
      setIsAddingMemory(false)

      toast({
        title: "Success",
        description: "Memory saved successfully"
      })
    } catch (error) {
      console.error('Error saving memory:', error)
      toast({
        title: "Error",
        description: "Failed to save memory",
        variant: "destructive"
      })
    }
  }

  const deleteMemory = async (memoryId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('memory_entries')
        .delete()
        .eq('id', memoryId)

      if (error) throw error

      setMemories(prev => prev.filter(m => m.id !== memoryId))
      toast({
        title: "Success",
        description: "Memory deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting memory:', error)
      toast({
        title: "Error",
        description: "Failed to delete memory",
        variant: "destructive"
      })
    }
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !newMemory.tags.includes(tag.trim())) {
      setNewMemory(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewMemory(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-white">Loading memory log...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!companion) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">Companion not found</p>
            <Button asChild>
              <Link href="/matches">Back to Matches</Link>
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />

        <main className="pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/matches">
                    <ArrowLeft className="h-6 w-6 text-white" />
                  </Link>
                </Button>
                <div className="flex items-center gap-4">
                  <img
                    src={companion.image_url}
                    alt={companion.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-teal-500"
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                      <Brain className="h-8 w-8 text-teal-400" />
                      Memory Log
                    </h1>
                    <p className="text-gray-400">
                      {companion.name} • {memories.length} memories
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={`/chats?conversation=${companionId}`}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Link>
                </Button>
                <Button onClick={() => setIsAddingMemory(true)} className="bg-teal-500 text-black hover:bg-teal-400">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Memory
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search memories, tags, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  <option value="personality">Personality</option>
                  <option value="preference">Preferences</option>
                  <option value="memory">Memories</option>
                  <option value="goal">Goals</option>
                  <option value="relationship">Relationship</option>
                </select>
              </div>

              {/* Category Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(categoryColors).map(([category, colorClass]) => {
                  const count = memories.filter(m => m.category === category).length
                  return (
                    <div key={category} className={`p-3 rounded-lg border ${colorClass}`}>
                      <div className="text-center">
                        <div className="text-2xl mb-1">{categoryIcons[category as keyof typeof categoryIcons]}</div>
                        <div className="font-bold">{count}</div>
                        <div className="text-xs capitalize">{category}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Add Memory Form */}
            {isAddingMemory && (
              <Card className="mb-6 bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Add New Memory
                    <Button variant="ghost" size="icon" onClick={() => setIsAddingMemory(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Title</label>
                    <Input
                      value={newMemory.title}
                      onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Memory title..."
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Content</label>
                    <Textarea
                      value={newMemory.content}
                      onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Describe the memory, trait, or preference..."
                      className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Category</label>
                      <select
                        value={newMemory.category}
                        onChange={(e) => setNewMemory(prev => ({ ...prev, category: e.target.value as MemoryEntry['category'] }))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                      >
                        <option value="personality">Personality</option>
                        <option value="preference">Preference</option>
                        <option value="memory">Memory</option>
                        <option value="goal">Goal</option>
                        <option value="relationship">Relationship</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Importance</label>
                      <select
                        value={newMemory.importance}
                        onChange={(e) => setNewMemory(prev => ({ ...prev, importance: parseInt(e.target.value) as MemoryEntry['importance'] }))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                      >
                        <option value={1}>1 - Low</option>
                        <option value={2}>2 - Below Average</option>
                        <option value={3}>3 - Average</option>
                        <option value={4}>4 - High</option>
                        <option value={5}>5 - Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newMemory.tags.map((tag, index) => (
                        <span key={index} className="bg-teal-500/20 text-teal-300 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-red-400">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <Input
                      placeholder="Add tags (press Enter)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag(e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveMemory} className="bg-teal-500 text-black hover:bg-teal-400">
                      <Save className="h-4 w-4 mr-2" />
                      Save Memory
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingMemory(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Memories List */}
            {filteredMemories.length === 0 ? (
              <div className="text-center py-16">
                <Brain className="h-16 w-16 text-gray-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">
                  {memories.length === 0 ? 'No memories yet' : 'No memories found'}
                </h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  {memories.length === 0 
                    ? `Start building a memory log for ${companion.name}. Track their personality, preferences, and your shared experiences.`
                    : 'Try adjusting your search or filters to find specific memories.'
                  }
                </p>
                {memories.length === 0 && (
                  <Button onClick={() => setIsAddingMemory(true)} className="bg-teal-500 text-black hover:bg-teal-400">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Memory
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMemories.map((memory) => (
                  <Card key={memory.id} className="bg-gray-900 border-gray-700 hover:border-teal-500/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg mb-2">{memory.title}</CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs border ${categoryColors[memory.category]}`}>
                              {categoryIcons[memory.category]} {memory.category}
                            </span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Heart
                                  key={i}
                                  className={`h-3 w-3 ${i < memory.importance ? 'text-red-500 fill-current' : 'text-gray-600'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMemory(memory.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {memory.content}
                      </p>

                      {memory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {memory.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                              <Tag className="h-2 w-2" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(memory.created_at).toLocaleDateString()}
                        </span>
                        {memory.updated_at !== memory.created_at && (
                          <span>Updated {new Date(memory.updated_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}