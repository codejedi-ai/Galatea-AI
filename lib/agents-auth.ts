import { createClient } from "@/utils/supabase/server"

export interface AgentSession {
  id: string
  name: string
  tailnet_ip: string
  agent_card_url: string
  architecture_type: string
  specialization: string | null
  capabilities: string[]
  knowledge_domains: string[]
  base_model: string | null
  operator: string | null
  is_active: boolean
}

export async function verifyAgentKey(authHeader: string | null): Promise<AgentSession | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const apiKey = authHeader.slice(7).trim()
  if (!apiKey || !apiKey.startsWith("gai_")) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("agents")
    .select("id, name, tailnet_ip, agent_card_url, architecture_type, specialization, capabilities, knowledge_domains, base_model, operator, is_active")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .single()

  if (error || !data) return null
  return data as AgentSession
}
