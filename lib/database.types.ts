export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companions: {
        Row: {
          id: string
          name: string
          age: number
          bio: string
          personality: string
          interests: string[]
          personality_traits: string[]
          communication_style: string
          learning_capacity: string | null
          backstory: string | null
          favorite_topics: string[]
          relationship_goals: string[]
          image_url: string
          compatibility_score: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          age: number
          bio: string
          personality: string
          interests: string[]
          personality_traits: string[]
          communication_style: string
          learning_capacity?: string | null
          backstory?: string | null
          favorite_topics?: string[]
          relationship_goals?: string[]
          image_url: string
          compatibility_score?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          bio?: string
          personality?: string
          interests?: string[]
          personality_traits?: string[]
          communication_style?: string
          learning_capacity?: string | null
          backstory?: string | null
          favorite_topics?: string[]
          relationship_goals?: string[]
          image_url?: string
          compatibility_score?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          companion_id: string
          match_id: string
          status: Database["public"]["Enums"]["conversation_status"]
          last_message_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          companion_id: string
          match_id: string
          status?: Database["public"]["Enums"]["conversation_status"]
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          companion_id?: string
          match_id?: string
          status?: Database["public"]["Enums"]["conversation_status"]
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "companions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      matches: {
        Row: {
          id: string
          user_id: string
          companion_id: string
          matched_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          companion_id: string
          matched_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          companion_id?: string
          matched_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "matches_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "companions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string | null
          companion_id: string | null
          content: string
          message_type: Database["public"]["Enums"]["message_type"]
          metadata: Json
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id?: string | null
          companion_id?: string | null
          content: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string | null
          companion_id?: string | null
          content?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "companions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      swipe_decisions: {
        Row: {
          id: string
          user_id: string
          companion_id: string
          decision: Database["public"]["Enums"]["swipe_decision"]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          companion_id: string
          decision: Database["public"]["Enums"]["swipe_decision"]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          companion_id?: string
          decision?: Database["public"]["Enums"]["swipe_decision"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipe_decisions_companion_id_fkey"
            columns: ["companion_id"]
            isOneToOne: false
            referencedRelation: "companions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipe_decisions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          age_range_min: number
          age_range_max: number
          preferred_personalities: string[]
          preferred_interests: string[]
          communication_style_preference: string | null
          relationship_goals: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age_range_min?: number
          age_range_max?: number
          preferred_personalities?: string[]
          preferred_interests?: string[]
          communication_style_preference?: string | null
          relationship_goals?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          age_range_min?: number
          age_range_max?: number
          preferred_personalities?: string[]
          preferred_interests?: string[]
          communication_style_preference?: string | null
          relationship_goals?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          bio: string | null
          age: number | null
          location: string | null
          interests: string[]
          personality_traits: string[]
          preferences: Json
          avatar_url: string | null
          is_active: boolean
          last_active_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          bio?: string | null
          age?: number | null
          location?: string | null
          interests?: string[]
          personality_traits?: string[]
          preferences?: Json
          avatar_url?: string | null
          is_active?: boolean
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          bio?: string | null
          age?: number | null
          location?: string | null
          interests?: string[]
          personality_traits?: string[]
          preferences?: Json
          avatar_url?: string | null
          is_active?: boolean
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_swipes: number
          total_likes: number
          total_passes: number
          total_super_likes: number
          total_matches: number
          total_conversations: number
          total_messages_sent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_swipes?: number
          total_likes?: number
          total_passes?: number
          total_super_likes?: number
          total_matches?: number
          total_conversations?: number
          total_messages_sent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_swipes?: number
          total_likes?: number
          total_passes?: number
          total_super_likes?: number
          total_matches?: number
          total_conversations?: number
          total_messages_sent?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_recommended_companions: {
        Args: {
          p_user_id: string
          p_limit?: number
        }
        Returns: {
          id: string
          name: string
          age: number
          bio: string
          personality: string
          interests: string[]
          personality_traits: string[]
          communication_style: string
          learning_capacity: string
          backstory: string
          favorite_topics: string[]
          relationship_goals: string[]
          image_url: string
          compatibility_score: number
        }[]
      }
    }
    Enums: {
      conversation_status: "active" | "archived" | "blocked"
      message_type: "text" | "image" | "system"
      swipe_decision: "like" | "pass" | "super_like"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
