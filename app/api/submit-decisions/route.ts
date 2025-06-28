import { NextResponse } from "next/server"
import { userProfileService } from "@/lib/firestore"

interface SwipeDecision {
  companionId: string
  action: "liked" | "passed"
}

export async function POST(request: Request) {
  try {
    const { userId, decisions }: { userId: string; decisions: SwipeDecision[] } = await request.json()

    if (!userId || !decisions || !Array.isArray(decisions)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    // Process each decision
    for (const decision of decisions) {
      // Add to swipe history
      await userProfileService.addSwipe(userId, decision.companionId, decision.action)

      // If liked, add to matches
      if (decision.action === "liked") {
        await userProfileService.addMatch(userId, decision.companionId)
      }
    }

    // Get updated matches
    const matches = await userProfileService.getMatches(userId)

    return NextResponse.json({
      success: true,
      matchCount: matches.length,
      matches,
    })
  } catch (error) {
    console.error("Error in submit-decisions:", error)
    return NextResponse.json({ error: "Failed to submit decisions" }, { status: 500 })
  }
}
