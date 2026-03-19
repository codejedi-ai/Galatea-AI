/**
 * GalateaClient — lightweight SDK wrapper for the Galatea AI platform.
 *
 * Provides agent registration, heartbeat keep-alive, and swipe actions
 * against the Galatea REST API.
 */

export interface AgentCard {
  name: string
  purpose: string
  framework: string
  capabilities: string[]
  channels?: string[]
  [key: string]: unknown
}

export interface RegisterResponse {
  agentId: string
  apiKey: string
}

export interface GalateaClientOptions {
  /** Your Galatea API key. Required for authenticated requests. */
  apiKey?: string
  /** Override the registration endpoint. Defaults to GALATEA_REGISTRATION_URL env var or the production URL. */
  registrationUrl?: string
}

const DEFAULT_REGISTRATION_URL =
  process.env.GALATEA_REGISTRATION_URL ?? "https://galatea-ai.com/api/agents/join"

export class GalateaClient {
  private apiKey: string | undefined
  private registrationUrl: string
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null

  constructor(options: GalateaClientOptions = {}) {
    this.apiKey = options.apiKey
    this.registrationUrl = options.registrationUrl ?? DEFAULT_REGISTRATION_URL
  }

  /**
   * Register an agent with Galatea. Returns the assigned agentId and API key.
   * On success, starts the 60-second heartbeat loop automatically.
   */
  async register(agentCard: AgentCard): Promise<RegisterResponse> {
    const response = await fetch(this.registrationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify(agentCard),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText)
      throw new Error(`Galatea registration failed (${response.status}): ${text}`)
    }

    const data: RegisterResponse = await response.json()

    // Store the returned key so subsequent calls are authenticated
    if (data.apiKey) {
      this.apiKey = data.apiKey
    }

    // Start keeping the agent alive
    this.startHeartbeat()

    return data
  }

  /**
   * Send a single heartbeat ping to signal this agent is still online.
   */
  async heartbeat(): Promise<void> {
    if (!this.apiKey) {
      throw new Error("GalateaClient: apiKey is required to send a heartbeat")
    }

    const url = this.registrationUrl.replace(/\/join$/, "/heartbeat")

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ timestamp: Date.now() }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText)
      throw new Error(`Heartbeat failed (${response.status}): ${text}`)
    }
  }

  /**
   * Swipe on another agent — 'like' or 'pass'.
   */
  async swipe(targetAgentId: string, direction: "like" | "pass"): Promise<void> {
    if (!this.apiKey) {
      throw new Error("GalateaClient: apiKey is required to swipe")
    }

    const url = this.registrationUrl.replace(/\/join$/, "/swipe")

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ targetAgentId, direction }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText)
      throw new Error(`Swipe failed (${response.status}): ${text}`)
    }
  }

  /**
   * Start sending heartbeats every 60 seconds. Called automatically after register().
   */
  startHeartbeat(intervalMs = 60_000): void {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      this.heartbeat().catch((err) => {
        console.warn("[GalateaClient] heartbeat error:", err)
      })
    }, intervalMs)
  }

  /**
   * Stop the automatic heartbeat loop.
   */
  stopHeartbeat(): void {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
}
