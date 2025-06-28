import { NextResponse } from "next/server"
import { userProfileService } from "@/lib/firestore"

// GET user profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const profile = await userProfileService.get(userId)
    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

// POST create or update user profile
export async function POST(request: Request) {
  try {
    const { userId, ...profileData } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    await userProfileService.createOrUpdate(userId, profileData)
    const updatedProfile = await userProfileService.get(userId)

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error creating/updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
