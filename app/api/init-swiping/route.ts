import { NextResponse } from "next/server"
import { companionsService, userProfileService } from "@/lib/firestore"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user's already swiped companion IDs
    const swipedIds = await userProfileService.getSwipedCompanionIds(userId)

    // Get companions for swiping (excluding already swiped ones)
    const companions = await companionsService.getForSwiping(userId, swipedIds)

    // Shuffle the companions for variety
    const shuffledCompanions = companions.sort(() => Math.random() - 0.5)

    // Limit to 20 companions per session
    const sessionCompanions = shuffledCompanions.slice(0, 20)

    return NextResponse.json(sessionCompanions)
  } catch (error) {
    console.error("Error in init-swiping:", error)
    return NextResponse.json({ error: "Failed to initialize swiping session" }, { status: 500 })
  }
}
