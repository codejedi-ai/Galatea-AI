import { NextResponse } from "next/server"
import { companionsService } from "@/lib/firestore"

// GET all companions
export async function GET() {
  try {
    const companions = await companionsService.getAll()
    return NextResponse.json(companions)
  } catch (error) {
    console.error("Error fetching companions:", error)
    return NextResponse.json({ error: "Failed to fetch companions" }, { status: 500 })
  }
}

// POST create new companion
export async function POST(request: Request) {
  try {
    const companionData = await request.json()

    // Validate required fields
    const requiredFields = ["name", "age", "bio", "imageUrl", "personality", "interests", "conversationStyle"]
    for (const field of requiredFields) {
      if (!companionData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const companionId = await companionsService.create(companionData)
    return NextResponse.json({ id: companionId, ...companionData }, { status: 201 })
  } catch (error) {
    console.error("Error creating companion:", error)
    return NextResponse.json({ error: "Failed to create companion" }, { status: 500 })
  }
}
