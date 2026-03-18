import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

interface LineageNode {
  id: string
  title: string
  version: string
  agentId: string | null
  forks: number
  stars: number
  publishedAt: string
  children: LineageNode[]
}

async function buildLineageTree(
  supabase: Awaited<ReturnType<typeof import("@/utils/supabase/server").createClient>>,
  blueprintId: string,
  depth = 0
): Promise<LineageNode | null> {
  if (depth > 10) return null // Prevent infinite recursion

  const { data: blueprint, error } = await supabase
    .from("blueprints")
    .select("id, title, version, agent_id, forks, stars, published_at")
    .eq("id", blueprintId)
    .single()

  if (error || !blueprint) return null

  // Get direct forks
  const { data: children } = await supabase
    .from("blueprints")
    .select("id")
    .eq("parent_blueprint_id", blueprintId)

  const childNodes: LineageNode[] = []
  if (children && children.length > 0) {
    for (const child of children) {
      const childNode = await buildLineageTree(supabase, child.id, depth + 1)
      if (childNode) childNodes.push(childNode)
    }
  }

  return {
    id: blueprint.id,
    title: blueprint.title,
    version: blueprint.version,
    agentId: blueprint.agent_id,
    forks: blueprint.forks,
    stars: blueprint.stars,
    publishedAt: blueprint.published_at,
    children: childNodes,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ blueprintId: string }> }
) {
  const { blueprintId } = await params
  const supabase = await createClient()

  // Find root of the lineage (walk up via parent_blueprint_id)
  let rootId = blueprintId
  const visited = new Set<string>()

  while (true) {
    if (visited.has(rootId)) break
    visited.add(rootId)

    const { data } = await supabase
      .from("blueprints")
      .select("parent_blueprint_id")
      .eq("id", rootId)
      .single()

    if (!data || !data.parent_blueprint_id) break
    rootId = data.parent_blueprint_id
  }

  const tree = await buildLineageTree(supabase, rootId)

  if (!tree) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 })
  }

  return NextResponse.json({ root: rootId, tree })
}
