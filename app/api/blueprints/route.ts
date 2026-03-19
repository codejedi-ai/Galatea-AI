import { NextResponse, NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { BlueprintSchema } from "@/lib/types/blueprint"

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("blueprints")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const parsed = BlueprintSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("blueprints")
    .insert({
      agent_id: parsed.data.agentId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      version: parsed.data.version,
      nodes: parsed.data.nodes,
      edges: parsed.data.edges,
      tags: parsed.data.tags ?? [],
      is_public: parsed.data.isPublic,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
