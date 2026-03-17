import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decisions = await request.json()

    // Process each swipe decision
    const results = []
    for (const [companionId, decision] of Object.entries(decisions)) {
      try {
        // Map decision types
        let swipeDecision: 'like' | 'pass' | 'super_like'
        if (decision === 'accepted') {
          swipeDecision = 'like'
        } else if (decision === 'rejected') {
          swipeDecision = 'pass'
        } else {
          swipeDecision = decision as 'like' | 'pass' | 'super_like'
        }

        // Insert swipe decision
        const { error: swipeError } = await supabase
          .from('swipe_decisions')
          .insert({
            user_id: user.id,
            companion_id: companionId,
            decision: swipeDecision
          })

        if (swipeError) {
          // Check if it's a duplicate swipe
          if (swipeError.code === '23505') {
            results.push({ companionId, decision: swipeDecision, success: false, error: 'Already swiped' })
            continue
          }
          console.error("Error inserting swipe decision:", swipeError)
          results.push({ companionId, decision: swipeDecision, success: false, error: swipeError.message })
        } else {
          results.push({ companionId, decision: swipeDecision, success: true })
        }
      } catch (error) {
        console.error("Error processing decision for companion:", companionId, error)
        results.push({ companionId, decision, success: false, error: error })
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      results 
    })
  } catch (error) {
    console.error("Error in submit-decisions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}