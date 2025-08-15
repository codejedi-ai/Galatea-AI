-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update user stats after swipe
CREATE OR REPLACE FUNCTION update_user_stats_on_swipe()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_stats 
  SET 
    total_swipes = total_swipes + 1,
    total_likes = total_likes + CASE WHEN NEW.decision = 'like' THEN 1 ELSE 0 END,
    total_passes = total_passes + CASE WHEN NEW.decision = 'pass' THEN 1 ELSE 0 END,
    total_super_likes = total_super_likes + CASE WHEN NEW.decision = 'super_like' THEN 1 ELSE 0 END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for swipe stats
CREATE OR REPLACE TRIGGER on_swipe_decision_created
  AFTER INSERT ON swipe_decisions
  FOR EACH ROW EXECUTE FUNCTION update_user_stats_on_swipe();

-- Function to create match and conversation when user likes companion
CREATE OR REPLACE FUNCTION handle_companion_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create match if decision is like or super_like
  IF NEW.decision IN ('like', 'super_like') THEN
    -- Insert match
    INSERT INTO matches (user_id, companion_id)
    VALUES (NEW.user_id, NEW.companion_id)
    ON CONFLICT (user_id, companion_id) DO NOTHING;
    
    -- Create conversation
    INSERT INTO conversations (user_id, companion_id, match_id)
    SELECT NEW.user_id, NEW.companion_id, m.id
    FROM matches m
    WHERE m.user_id = NEW.user_id AND m.companion_id = NEW.companion_id
    ON CONFLICT (user_id, companion_id) DO NOTHING;
    
    -- Update user stats
    UPDATE user_stats 
    SET 
      total_matches = total_matches + 1,
      total_conversations = total_conversations + 1,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for match creation
CREATE OR REPLACE TRIGGER on_companion_like
  AFTER INSERT ON swipe_decisions
  FOR EACH ROW EXECUTE FUNCTION handle_companion_like();

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET 
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  -- Update user stats for messages sent
  IF NEW.sender_id IS NOT NULL THEN
    UPDATE user_stats 
    SET 
      total_messages_sent = total_messages_sent + 1,
      updated_at = NOW()
    WHERE user_id = NEW.sender_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for message timestamp
CREATE OR REPLACE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- Function to get recommended companions for a user
CREATE OR REPLACE FUNCTION get_recommended_companions(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  age INTEGER,
  bio TEXT,
  personality TEXT,
  interests TEXT[],
  personality_traits TEXT[],
  communication_style TEXT,
  learning_capacity TEXT,
  backstory TEXT,
  favorite_topics TEXT[],
  relationship_goals TEXT[],
  image_url TEXT,
  compatibility_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.age,
    c.bio,
    c.personality,
    c.interests,
    c.personality_traits,
    c.communication_style,
    c.learning_capacity,
    c.backstory,
    c.favorite_topics,
    c.relationship_goals,
    c.image_url,
    c.compatibility_score
  FROM companions c
  WHERE c.is_active = true
    AND c.id NOT IN (
      SELECT sd.companion_id 
      FROM swipe_decisions sd 
      WHERE sd.user_id = p_user_id
    )
  ORDER BY c.compatibility_score DESC NULLS LAST, RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
