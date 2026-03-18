import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("blueprints")
    .select("*")
    .eq("agent_id", agentId)
    .order("published_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Failed to fetch blueprints" }, { status: 500 })
  }

  return NextResponse.json({ blueprints: data || [] })
}
