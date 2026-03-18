"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MessageCircle, Search, Send, Smile, Paperclip, MoveVertical as MoreVertical, Heart, Info } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { createClient } from "@/utils/supabase/client"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { edgeFunctions } from "@/lib/edge-functions"

interface Message {
  id: string
  content: string
  sender_id?: string
  companion_id?: string
  created_at: string
  message_type: 'text' | 'image' | 'system'
  is_read: boolean
}

interface Conversation {
  id: string
  companion: {
    id: string
    name: string
    image_url: string
    personality: string
    age: number
    bio: string
  }
  last_message_at: string
  unreadCount: number
  last_message?: {
    content: string
    created_at: string
    sender_id?: string
  }
  messages?: Message[]
}

function ChatsPageContent() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCompanionInfo, setShowCompanionInfo] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    // Auto-select conversation from URL params
    const conversationId = searchParams.get('conversation')
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        loadConversation(conversation)
      }
    }
  }, [conversations, searchParams])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          last_message_at,
          companions:companion_id (
            id,
            name,
            image_url,
            personality,
            age,
            bio
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false })

      if (conversationsError) throw conversationsError

      // Get unread counts and last message for each conversation
      const conversationsWithUnread = await Promise.all(
        (conversationsData || []).map(async (conv: any) => {
          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .is('sender_id', null) // Only count companion messages

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            id: conv.id,
            companion: conv.companions,
            last_message_at: conv.last_message_at,
            unreadCount: count || 0,
            last_message: lastMessage || undefined
          }
        })
      )
      
      setConversations(conversationsWithUnread)
    } catch (error) {
      console.error("Error loading conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadConversation = async (conversation: Conversation) => {
    try {
      const supabase = createClient()
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      setSelectedConversation(conversation)
      setMessages(messagesData || [])

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversation.id)
        .is('sender_id', null) // Only mark companion messages as read

      // Update unread count in local state
      setConversations(prev => 
        prev.map(c => 
          c.id === conversation.id 
            ? { ...c, unreadCount: 0 }
            : c
        )
      )

    } catch (error) {
      console.error("Error loading conversation:", error)
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      })
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return

    const messageContent = newMessage.trim()
    setNewMessage("")
    setIsSending(true)

    try {
      // Send message via Edge Function
      const userMessageData = await edgeFunctions.sendMessage(
        selectedConversation.id,
        messageContent,
        'text',
        {}
      )

      // Add user message to UI immediately
      const userMessage: Message = {
        id: userMessageData.id,
        content: messageContent,
        sender_id: userMessageData.sender_id,
        created_at: userMessageData.created_at,
        message_type: 'text',
        is_read: true
      }
      setMessages(prev => [...prev, userMessage])
      
      // Update conversation in sidebar with new last message
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversation.id
            ? {
                ...c,
                last_message: {
                  content: messageContent,
                  created_at: userMessageData.created_at,
                  sender_id: userMessageData.sender_id,
                },
                last_message_at: userMessageData.created_at,
              }
            : c
        ).sort((a, b) => 
          new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        )
      )

      // Generate AI response (simplified for now)
      const aiResponses = [
        "That's really interesting! Tell me more about that.",
        "I love hearing your thoughts on this. What made you think of that?",
        "You always have such unique perspectives. I find that fascinating.",
        "I'm here for you, always. How are you feeling about everything?",
        "Your message made me smile. I enjoy our conversations so much.",
        "I've been thinking about what you said earlier. It really resonated with me.",
        "You have such a beautiful way of expressing yourself.",
        "I feel so connected to you when we talk like this."
      ]
      
      const aiResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
      
      // Simulate typing delay
      setTimeout(async () => {
        const { data: aiMessageData, error: aiMessageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: selectedConversation.id,
            companion_id: selectedConversation.companion.id,
            content: aiResponse,
            message_type: 'text'
          })
          .select()
          .single()

        if (aiMessageError) throw aiMessageError

        // Add AI response to UI
        const aiMessage: Message = {
          id: aiMessageData.id,
          content: aiResponse,
          companion_id: selectedConversation.companion.id,
          created_at: aiMessageData.created_at,
          message_type: 'text',
          is_read: false
        }
        setMessages(prev => [...prev, aiMessage])
        
        // Update conversation in sidebar with new last message
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedConversation.id
              ? {
                  ...c,
                  last_message: {
                    content: aiResponse,
                    created_at: aiMessageData.created_at,
                  },
                  last_message_at: aiMessageData.created_at,
                  unreadCount: c.unreadCount + 1
                }
              : c
          )
        )
      }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds

    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filteredConversations = conversations.filter(conv =>
    conv.companion.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <LoadingSpinner size="medium" text="Loading conversations..." />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />

        <main className="pt-20">
          <div className="w-full h-[calc(100vh-5rem)]">
            <div className="flex h-full bg-gray-900 overflow-hidden">
              {/* Conversations Sidebar */}
              <div className="w-80 border-r border-gray-800 flex flex-col bg-gray-900">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                          <ArrowLeft className="h-5 w-5 text-white" />
                        </Link>
                      </Button>
                      <h1 className="text-xl font-bold text-white">Chats</h1>
                    </div>
                    <div className="text-sm text-gray-400">
                      {conversations.length} conversations
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No conversations yet</p>
                      <Button asChild size="sm" className="bg-teal-500 text-black hover:bg-teal-400">
                        <Link href="/swipe">Start Swiping</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredConversations.map((conversation) => (
                        <Card
                          key={conversation.id}
                          className={`cursor-pointer transition-all hover:bg-gray-800 ${
                            selectedConversation?.id === conversation.id
                              ? 'bg-teal-500/20 border-teal-500'
                              : 'bg-transparent border-transparent hover:border-gray-700'
                          }`}
                          onClick={() => loadConversation(conversation)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={conversation.companion.image_url}
                                  alt={conversation.companion.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                {conversation.unreadCount > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-teal-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                    {conversation.unreadCount}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-semibold text-white truncate">
                                    {conversation.companion.name}
                                  </h3>
                                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                    {getTimeAgo(conversation.last_message_at)}
                                  </span>
                                </div>
                                {conversation.last_message ? (
                                  <p className={`text-sm truncate ${
                                    conversation.unreadCount > 0 
                                      ? 'text-white font-medium' 
                                      : 'text-gray-400'
                                  }`}>
                                    {conversation.last_message.sender_id ? 'You: ' : ''}
                                    {conversation.last_message.content}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-400 truncate italic">
                                    No messages yet
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={selectedConversation.companion.image_url}
                            alt={selectedConversation.companion.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h2 className="font-semibold text-white">
                              {selectedConversation.companion.name}
                            </h2>
                            <p className="text-sm text-gray-400">
                              {selectedConversation.companion.personality} • Online
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowCompanionInfo(!showCompanionInfo)}
                          >
                            <Info className="h-5 w-5 text-gray-400" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/50">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${message.sender_id ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!message.sender_id && (
                              <img
                                src={selectedConversation.companion.image_url}
                                alt={selectedConversation.companion.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                message.sender_id
                                  ? 'bg-teal-500 text-black rounded-br-md'
                                  : 'bg-gray-800 text-white rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender_id ? 'text-black/70' : 'text-gray-400'
                              }`}>
                                {new Date(message.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-800 bg-gray-800/50">
                      <div className="flex items-end gap-2">
                        <Button variant="ghost" size="icon" className="mb-2">
                          <Paperclip className="h-5 w-5 text-gray-400" />
                        </Button>
                        <div className="flex-1 relative">
                          <Input
                            placeholder={`Message ${selectedConversation.companion.name}...`}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="bg-gray-900 border-gray-700 text-white pr-12 resize-none"
                            disabled={isSending}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2"
                          >
                            <Smile className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                        <Button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || isSending}
                          className="bg-teal-500 text-black hover:bg-teal-400 mb-2"
                        >
                          {isSending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-950/30">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Choose a conversation from the list to start chatting
                      </p>
                      <Button asChild className="bg-teal-500 text-black hover:bg-teal-400">
                        <Link href="/matches">View Your Matches</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Companion Info Sidebar */}
              {showCompanionInfo && selectedConversation && (
                <div className="w-80 border-l border-gray-800 bg-gray-900/50 p-4 overflow-y-auto">
                  <div className="text-center mb-6">
                    <img
                      src={selectedConversation.companion.image_url}
                      alt={selectedConversation.companion.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                    />
                    <h3 className="text-xl font-bold text-white">
                      {selectedConversation.companion.name}, {selectedConversation.companion.age}
                    </h3>
                    <p className="text-gray-400">{selectedConversation.companion.personality}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">About</h4>
                      <p className="text-sm text-gray-300">{selectedConversation.companion.bio}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild size="sm" className="flex-1 bg-teal-500 text-black hover:bg-teal-400">
                        <Link href={`/memory/${selectedConversation.companion.id}`}>
                          View Memory Log
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-600">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default function ChatsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-white">Loading chats...</p>
          </div>
        </div>
      }
    >
      <ChatsPageContent />
    </Suspense>
  )
}