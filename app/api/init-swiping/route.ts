import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get companions that the user hasn't swiped on yet
    const { data: companions, error } = await supabase
      .from('companions')
      .select('*')
      .eq('is_active', true)
      .limit(10)

    if (error) {
      console.error("Error fetching companions:", error)
      return NextResponse.json({ error: "Failed to fetch companions" }, { status: 500 })
    }

    // Transform the data to match the expected format
    const profiles = companions.map((companion: any) => ({
      uuid: companion.id,
      id: companion.id,
      name: companion.name,
      age: companion.age,
      bio: companion.bio,
      imageUrl: companion.image_url,
      personality: companion.personality,
      interests: companion.interests,
      personalityTraits: companion.personality_traits,
      communicationStyle: companion.communication_style,
      learningCapacity: companion.learning_capacity,
      backstory: companion.backstory,
      favoriteTopics: companion.favorite_topics,
      relationshipGoals: companion.relationship_goals,
      compatibilityScore: companion.compatibility_score
    }))

    return NextResponse.json(profiles)
  } catch (error) {
    console.error("Error in init-swiping:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}