import { edgeFunctions } from "@/lib/edge-functions"
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
  return await edgeFunctions.getConversations()
}

export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  return await edgeFunctions.getConversationById(conversationId)
}

export async function getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
  const conversation = await edgeFunctions.getConversationById(conversationId, true, limit, offset)
  return conversation?.messages || []
}

export async function sendMessage(
  conversationId: string,
  content: string,
  messageType: MessageType = "text",
  metadata: Record<string, any> = {},
): Promise<Message> {
  return await edgeFunctions.sendMessage(conversationId, content, messageType, metadata)
}

export async function markMessagesAsRead(conversationId: string): Promise<void> {
  await edgeFunctions.markMessagesAsRead(conversationId)
}

export async function updateConversationStatus(conversationId: string, status: ConversationStatus): Promise<void> {
  await edgeFunctions.updateConversationStatus(conversationId, status)
}
