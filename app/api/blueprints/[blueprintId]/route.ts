import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { BlueprintSchema } from "@/lib/types/blueprint"

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ blueprintId: string }> }) {
  const { blueprintId } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("blueprints")
    .select("*")
    .eq("id", blueprintId)
    .single()

  if (error || !data) return NextResponse.json({ error: "Blueprint not found" }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ blueprintId: string }> }) {
  const { blueprintId } = await params
  const supabase = await createClient()
  const body = await request.json()

  const parsed = BlueprintSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("blueprints")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", blueprintId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
