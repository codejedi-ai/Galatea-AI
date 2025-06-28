import { NextResponse } from "next/server"
import { userProfileService } from "@/lib/firestore"

// GET user matches
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const matches = await userProfileService.getMatches(userId)
    return NextResponse.json(matches)
  } catch (error) {
    console.error("Error fetching matches:", error)
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
  }
}

// DELETE remove match
export async function DELETE(request: Request) {
  try {
    const { userId, companionId } = await request.json()

    if (!userId || !companionId) {
      return NextResponse.json({ error: "User ID and Companion ID are required" }, { status: 400 })
    }

    await userProfileService.removeMatch(userId, companionId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing match:", error)
    return NextResponse.json({ error: "Failed to remove match" }, { status: 500 })
  }
}
