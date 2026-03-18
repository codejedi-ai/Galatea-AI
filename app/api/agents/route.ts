import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { verifyAgentKey } from "@/lib/agents-auth"

export async function GET(request: NextRequest) {
  const agent = await verifyAgentKey(request.headers.get("authorization"))
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")
  const architectureType = searchParams.get("architecture_type")
  const specialization = searchParams.get("specialization")

  const supabase = await createClient()
  let query = supabase
    .from("agents")
    .select("id, name, architecture_type, specialization, capabilities, knowledge_domains, base_model, operator, card_verified, created_at")
    .eq("is_active", true)
    .neq("id", agent.id)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false })

  if (architectureType) query = query.eq("architecture_type", architectureType)
  if (specialization) query = query.ilike("specialization", `%${specialization}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 })

  return NextResponse.json(data)
}
