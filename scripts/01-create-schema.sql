-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE swipe_decision AS ENUM ('like', 'pass', 'super_like');
CREATE TYPE conversation_status AS ENUM ('active', 'archived', 'blocked');
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  bio TEXT,
  age INTEGER CHECK (age >= 18 AND age <= 100),
  location TEXT,
  interests TEXT[] DEFAULT '{}',
  personality_traits TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Companions table
CREATE TABLE companions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  bio TEXT NOT NULL,
  personality TEXT NOT NULL,
  interests TEXT[] NOT NULL DEFAULT '{}',
  personality_traits TEXT[] NOT NULL DEFAULT '{}',
  communication_style TEXT NOT NULL,
  learning_capacity TEXT,
  backstory TEXT,
  favorite_topics TEXT[] DEFAULT '{}',
  relationship_goals TEXT[] DEFAULT '{}',
  image_url TEXT NOT NULL,
  compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swipe decisions table
CREATE TABLE swipe_decisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  companion_id UUID REFERENCES companions(id) ON DELETE CASCADE NOT NULL,
  decision swipe_decision NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, companion_id)
);

-- Matches table (when user likes a companion)
CREATE TABLE matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  companion_id UUID REFERENCES companions(id) ON DELETE CASCADE NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, companion_id)
);

-- Conversations table
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  companion_id UUID REFERENCES companions(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  status conversation_status DEFAULT 'active',
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, companion_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  companion_id UUID REFERENCES companions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (sender_id IS NOT NULL AND companion_id IS NULL) OR 
    (sender_id IS NULL AND companion_id IS NOT NULL)
  )
);

-- User preferences table
CREATE TABLE user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  age_range_min INTEGER DEFAULT 18 CHECK (age_range_min >= 18),
  age_range_max INTEGER DEFAULT 35 CHECK (age_range_max <= 100),
  preferred_personalities TEXT[] DEFAULT '{}',
  preferred_interests TEXT[] DEFAULT '{}',
  communication_style_preference TEXT,
  relationship_goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User statistics table
CREATE TABLE user_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_swipes INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_passes INTEGER DEFAULT 0,
  total_super_likes INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  total_messages_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active, last_active_at);
CREATE INDEX idx_companions_active ON companions(is_active);
CREATE INDEX idx_swipe_decisions_user ON swipe_decisions(user_id, created_at);
CREATE INDEX idx_matches_user ON matches(user_id, matched_at);
CREATE INDEX idx_conversations_user ON conversations(user_id, last_message_at);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = false;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companions_updated_at BEFORE UPDATE ON companions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
