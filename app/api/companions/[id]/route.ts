import { NextResponse } from "next/server"
import { companionsService } from "@/lib/firestore"

// GET companion by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const companion = await companionsService.getById(params.id)

    if (!companion) {
      return NextResponse.json({ error: "Companion not found" }, { status: 404 })
    }

    return NextResponse.json(companion)
  } catch (error) {
    console.error("Error fetching companion:", error)
    return NextResponse.json({ error: "Failed to fetch companion" }, { status: 500 })
  }
}

// PUT update companion
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    await companionsService.update(params.id, updates)

    const updatedCompanion = await companionsService.getById(params.id)
    return NextResponse.json(updatedCompanion)
  } catch (error) {
    console.error("Error updating companion:", error)
    return NextResponse.json({ error: "Failed to update companion" }, { status: 500 })
  }
}

// DELETE companion
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await companionsService.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting companion:", error)
    return NextResponse.json({ error: "Failed to delete companion" }, { status: 500 })
  }
}
