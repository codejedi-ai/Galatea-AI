/**
 * Tailscale API client for Galatea AI.
 * All methods gracefully no-op (return mock/null) if TAILSCALE_API_KEY is not set.
 */

const TAILSCALE_API_BASE = "https://api.tailscale.com/api/v2"

function getTailnetConfig(): { apiKey: string; tailnet: string } | null {
  const apiKey = process.env.TAILSCALE_API_KEY
  const tailnet = process.env.TAILSCALE_TAILNET
  if (!apiKey || !tailnet) return null
  return { apiKey, tailnet }
}

function tailscaleHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  }
}

export interface TailscaleAuthKey {
  id: string
  key: string
  created: string
  expires: string
  revoked?: string
  capabilities: {
    devices: {
      create: {
        reusable: boolean
        ephemeral: boolean
        preauthorized: boolean
        tags?: string[]
      }
    }
  }
}

export interface TailscaleDevice {
  id: string
  name: string
  addresses: string[]
  user: string
  os: string
  lastSeen: string
  online: boolean
  clientConnectivity?: {
    endpoints: string[]
    latency?: Record<string, { latencyMs: number }>
  }
}

/**
 * Generate an ephemeral auth key for agent onboarding.
 * Returns null if TAILSCALE_API_KEY is not configured (no-op mode).
 */
export async function createAuthKey(tags: string[] = []): Promise<TailscaleAuthKey | null> {
  const config = getTailnetConfig()
  if (!config) {
    console.warn("[tailnet] TAILSCALE_API_KEY not set — skipping createAuthKey")
    return null
  }

  const body: Record<string, unknown> = {
    capabilities: {
      devices: {
        create: {
          reusable: false,
          ephemeral: true,
          preauthorized: true,
          ...(tags.length > 0 ? { tags } : {}),
        },
      },
    },
    expirySeconds: 3600,
  }

  try {
    const res = await fetch(
      `${TAILSCALE_API_BASE}/tailnet/${config.tailnet}/keys`,
      {
        method: "POST",
        headers: tailscaleHeaders(config.apiKey),
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error(`[tailnet] createAuthKey failed (${res.status}): ${text}`)
      return null
    }

    return (await res.json()) as TailscaleAuthKey
  } catch (err) {
    console.error("[tailnet] createAuthKey error:", err)
    return null
  }
}

/**
 * List all devices currently on the Tailnet.
 * Returns empty array if TAILSCALE_API_KEY is not configured (no-op mode).
 */
export async function getDevices(): Promise<TailscaleDevice[]> {
  const config = getTailnetConfig()
  if (!config) {
    console.warn("[tailnet] TAILSCALE_API_KEY not set — skipping getDevices")
    return []
  }

  try {
    const res = await fetch(
      `${TAILSCALE_API_BASE}/tailnet/${config.tailnet}/devices`,
      {
        headers: tailscaleHeaders(config.apiKey),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error(`[tailnet] getDevices failed (${res.status}): ${text}`)
      return []
    }

    const data = await res.json()
    return (data.devices ?? []) as TailscaleDevice[]
  } catch (err) {
    console.error("[tailnet] getDevices error:", err)
    return []
  }
}

/**
 * Remove a device from the Tailnet (agent departure).
 * No-ops silently if TAILSCALE_API_KEY is not configured.
 */
export async function removeDevice(deviceId: string): Promise<boolean> {
  const config = getTailnetConfig()
  if (!config) {
    console.warn("[tailnet] TAILSCALE_API_KEY not set — skipping removeDevice")
    return false
  }

  try {
    const res = await fetch(
      `${TAILSCALE_API_BASE}/device/${deviceId}`,
      {
        method: "DELETE",
        headers: tailscaleHeaders(config.apiKey),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error(`[tailnet] removeDevice failed (${res.status}): ${text}`)
      return false
    }

    return true
  } catch (err) {
    console.error("[tailnet] removeDevice error:", err)
    return false
  }
}

/**
 * Check whether the Tailscale integration is active (env vars present).
 */
export function isTailnetConfigured(): boolean {
  return Boolean(process.env.TAILSCALE_API_KEY && process.env.TAILSCALE_TAILNET)
}
