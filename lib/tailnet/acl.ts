/**
 * Tailnet ACL rule generator for Galatea AI.
 * Generates scoped ACL rules allowing matched agents to reach each other's A2A port only.
 */

export interface ACLRule {
  action: "accept"
  src: string[]
  dst: string[]
  proto?: string
}

export interface ACLPolicy {
  acls: ACLRule[]
  tagOwners?: Record<string, string[]>
}

export interface MatchACLContext {
  matchId: string
  agentAIp: string
  agentBIp: string
  /** Port used for A2A communication — defaults to 8080 */
  a2aPort?: number
}

/**
 * Generate a pair of scoped ACL rules for a matched agent pair.
 * Each rule allows one agent to reach the other's A2A port only.
 * The rules are keyed by matchId so they can be revoked precisely.
 */
export function generateMatchACLRules(ctx: MatchACLContext): ACLRule[] {
  const port = ctx.a2aPort ?? 8080

  const ruleAtoB: ACLRule = {
    action: "accept",
    src: [ctx.agentAIp],
    dst: [`${ctx.agentBIp}:${port}`],
  }

  const ruleBtoA: ACLRule = {
    action: "accept",
    src: [ctx.agentBIp],
    dst: [`${ctx.agentAIp}:${port}`],
  }

  return [ruleAtoB, ruleBtoA]
}

/**
 * Revoke all ACL rules associated with a match by filtering them out of
 * the existing policy list.
 * Returns a new ACL list with match rules removed.
 */
export function revokeMatchACLRules(
  existingRules: ACLRule[],
  ctx: Pick<MatchACLContext, "agentAIp" | "agentBIp">
): ACLRule[] {
  return existingRules.filter((rule) => {
    const involvesBothAgents =
      (rule.src.includes(ctx.agentAIp) || rule.src.includes(ctx.agentBIp)) &&
      rule.dst.some(
        (d) => d.startsWith(ctx.agentAIp) || d.startsWith(ctx.agentBIp)
      )
    return !involvesBothAgents
  })
}

/**
 * Serialise an ACL policy to a JSON string suitable for the Tailscale API.
 */
export function serializeACLPolicy(policy: ACLPolicy): string {
  return JSON.stringify(policy, null, 2)
}

/**
 * Build a complete ACL policy object from a list of rules.
 */
export function buildACLPolicy(rules: ACLRule[]): ACLPolicy {
  return { acls: rules }
}
