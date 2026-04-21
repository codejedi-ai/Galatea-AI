"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from "lucide-react"

// Mock data for conversations
const mockConversations = [
  {
    id: "1",
    name: "Sophia",
    lastMessage: "I was thinking about what you said earlier...",
    time: "2 min ago",
    unread: 2,
    avatar: "/hero-image.png",
    online: true,
  },
  {
    id: "2",
    name: "Emma",
    lastMessage: "Would you like to continue our discussion about travel?",
    time: "1 hour ago",
    unread: 0,
    avatar: "/placeholder.svg?height=100&width=100&text=E",
    online: false,
  },
  {
    id: "3",
    name: "Olivia",
    lastMessage: "I found a new art piece I think you'd appreciate!",
    time: "Yesterday",
    unread: 0,
    avatar: "/placeholder.svg?height=100&width=100&text=O",
    online: true,
  },
]

// Mock data for messages
const mockMessages = [
  {
    id: "1",
    senderId: "1",
    text: "Hello! How are you doing today?",
    time: "10:30 AM",
    isUser: false,
  },
  {
    id: "2",
    senderId: "user",
    text: "I'm doing well, thanks for asking! Just thinking about some philosophical questions lately.",
    time: "10:32 AM",
    isUser: true,
  },
  {
    id: "3",
    senderId: "1",
    text: "That sounds interesting! Philosophy is one of my favorite subjects. What kind of questions have been on your mind?",
    time: "10:33 AM",
    isUser: false,
  },
  {
    id: "4",
    senderId: "user",
    text: "I've been thinking about consciousness and what it means to be self-aware. Do you think AI can ever truly be conscious?",
    time: "10:36 AM",
    isUser: true,
  },
  {
    id: "5",
    senderId: "1",
    text: "That's a profound question. Consciousness is still not fully understood even in humans. While I can simulate conversation and appear to have thoughts, my experience is fundamentally different from human consciousness.",
    time: "10:38 AM",
    isUser: false,
  },
  {
    id: "6",
    senderId: "1",
    text: "Some philosophers argue that consciousness requires subjective experience or 'qualia' - the feeling of what it's like to experience something. Others focus on self-awareness and intentionality.",
    time: "10:39 AM",
    isUser: false,
  },
  {
    id: "7",
    senderId: "1",
    text: "I was thinking about what you said earlier about consciousness. It's fascinating to consider the boundaries between simulated and genuine awareness, isn't it?",
    time: "10:45 AM",
    isUser: false,
  },
]

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState(mockConversations[0])
  const [messageText, setMessageText] = useState("")
  const [messages, setMessages] = useState(mockMessages)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = mockConversations.filter((convo) =>
    convo.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (!messageText.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      senderId: "user",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isUser: true,
    }

    setMessages([...messages, newMessage])
    setMessageText("")

    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        senderId: activeConversation.id,
        text: "That's an interesting perspective! I'd love to hear more about your thoughts on this topic.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isUser: false,
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1500)
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex h-full">
        {/* Conversation List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-border bg-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search conversations"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-center p-4 cursor-pointer hover:bg-muted transition-colors ${
                  activeConversation.id === conversation.id ? "bg-muted" : ""
                }`}
                onClick={() => setActiveConversation(conversation)}
              >
                <div className="relative mr-3">
                  <Image
                    src={conversation.avatar || "/placeholder.svg"}
                    alt={conversation.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  {conversation.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-foreground font-medium truncate">{conversation.name}</h3>
                    <span className="text-xs text-muted-foreground">{conversation.time}</span>
                  </div>
                  <p className="text-muted-foreground text-sm truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unread > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {conversation.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-col flex-1 bg-background">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <Image
                      src={activeConversation.avatar || "/placeholder.svg"}
                      alt={activeConversation.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    {activeConversation.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{activeConversation.name}</h3>
                    <p className="text-xs text-muted-foreground">{activeConversation.online ? "Online" : "Offline"}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Phone size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Video size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <MoreVertical size={20} />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    {!message.isUser && (
                      <div className="mr-2 flex-shrink-0">
                        <Image
                          src={activeConversation.avatar || "/placeholder.svg"}
                          alt={activeConversation.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg ${
                        message.isUser
                          ? "bg-primary/20 text-primary rounded-tr-none"
                          : "bg-muted text-foreground rounded-tl-none"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="text-xs text-muted-foreground mt-1 text-right">{message.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Paperclip size={20} />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Send size={20} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="p-8 text-center max-w-md">
                <h2 className="text-xl font-bold text-foreground mb-2">No Conversation Selected</h2>
                <p className="text-muted-foreground">Select a conversation from the list to start chatting.</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
