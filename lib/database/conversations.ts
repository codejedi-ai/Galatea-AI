import { createClient } from "@/lib/supabase/client"
import type { Companion } from "./companions"

export type ConversationStatus = "active" | "archived" | "blocked"
export type MessageType = "text" | "image" | "system"

export interface Conversation {
  id: string
  user_id: string
  companion_id: string
  match_id: string
  status: ConversationStatus
  last_message_at: string
  created_at: string
  updated_at: string
  companion?: Companion
  last_message?: Message
}

export interface Message {
  id: string
  conversation_id: string
  sender_id?: string
  companion_id?: string
  content: string
  message_type: MessageType
  metadata: Record<string, any>
  is_read: boolean
  created_at: string
}

export async function getUserConversations(): Promise<Conversation[]> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      companion:companions(*),
      messages!inner(
        id,
        content,
        message_type,
        is_read,
        created_at,
        sender_id,
        companion_id
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("last_message_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`)
  }

  // Get the last message for each conversation
  return (data || []).map((conv) => ({
    ...conv,
    last_message: conv.messages?.[0] || null,
  }))
}

export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      companion:companions(*)
    `)
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(`Failed to fetch conversation: ${error.message}`)
  }

  return data
}

export async function getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  // Verify user owns this conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single()

  if (!conversation) {
    throw new Error("Conversation not found or access denied")
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`)
  }

  return (data || []).reverse() // Return in chronological order
}

export async function sendMessage(
  conversationId: string,
  content: string,
  messageType: MessageType = "text",
  metadata: Record<string, any> = {},
): Promise<Message> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: messageType,
        metadata,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`)
  }

  return data
}

export async function markMessagesAsRead(conversationId: string): Promise<void> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .is("sender_id", null) // Only mark AI messages as read
    .eq("is_read", false)

  if (error) {
    throw new Error(`Failed to mark messages as read: ${error.message}`)
  }
}

export async function updateConversationStatus(conversationId: string, status: ConversationStatus): Promise<void> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { error } = await supabase
    .from("conversations")
    .update({ status })
    .eq("id", conversationId)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(`Failed to update conversation status: ${error.message}`)
  }
}
