import { GalateaClient } from "../lib/galatea-client"

// Stub global fetch so tests don't hit the network
const mockFetch = jest.fn()
global.fetch = mockFetch as unknown as typeof fetch

function mockOk(body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => body,
    text: async () => JSON.stringify(body),
    status: 200,
    statusText: "OK",
  })
}

function mockError(status: number, message: string) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({}),
    text: async () => message,
    status,
    statusText: message,
  })
}

const sampleAgentCard = {
  name: "TestAgent",
  purpose: "Unit testing",
  framework: "Jest",
  capabilities: ["test"],
  channels: ["ci"],
}

const sampleRegisterResponse = {
  agentId: "agt_test123",
  apiKey: "gal_testapikey",
  tailnetKey: "tskey-auth-test",
}

beforeEach(() => {
  jest.useFakeTimers()
  mockFetch.mockClear()
})

afterEach(() => {
  jest.useRealTimers()
})

describe("GalateaClient — constructor", () => {
  it("creates a client without options", () => {
    const client = new GalateaClient()
    expect(client).toBeInstanceOf(GalateaClient)
  })

  it("accepts an apiKey option", () => {
    const client = new GalateaClient({ apiKey: "gal_abc" })
    expect(client).toBeInstanceOf(GalateaClient)
  })

  it("accepts a custom registrationUrl", () => {
    const client = new GalateaClient({ registrationUrl: "http://localhost/api/join" })
    expect(client).toBeInstanceOf(GalateaClient)
  })
})

describe("GalateaClient — register()", () => {
  it("POSTs the agentCard and returns the registration response", async () => {
    mockOk(sampleRegisterResponse)

    const client = new GalateaClient()
    const result = await client.register(sampleAgentCard)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toContain("galatea-ai.com")
    expect(options.method).toBe("POST")
    expect(JSON.parse(options.body)).toMatchObject(sampleAgentCard)
    expect(result.agentId).toBe("agt_test123")
    expect(result.apiKey).toBe("gal_testapikey")

    // Clean up heartbeat
    client.stopHeartbeat()
  })

  it("stores the returned apiKey for subsequent calls", async () => {
    mockOk(sampleRegisterResponse)

    const client = new GalateaClient()
    await client.register(sampleAgentCard)

    // Heartbeat call should include the returned apiKey as Bearer token
    mockOk({})
    await client.heartbeat()

    const [, heartbeatOptions] = mockFetch.mock.calls[1]
    expect(heartbeatOptions.headers.Authorization).toBe("Bearer gal_testapikey")

    client.stopHeartbeat()
  })

  it("throws when the server returns a non-OK response", async () => {
    mockError(409, "Agent name already taken")

    const client = new GalateaClient()
    await expect(client.register(sampleAgentCard)).rejects.toThrow("409")
  })
})

describe("GalateaClient — heartbeat()", () => {
  it("POSTs to the heartbeat endpoint with the apiKey", async () => {
    mockOk({})

    const client = new GalateaClient({ apiKey: "gal_abc", registrationUrl: "http://localhost/api/agents/join" })
    await client.heartbeat()

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe("http://localhost/api/agents/heartbeat")
    expect(options.headers.Authorization).toBe("Bearer gal_abc")
  })

  it("throws when no apiKey is set", async () => {
    const client = new GalateaClient()
    await expect(client.heartbeat()).rejects.toThrow("apiKey is required")
  })

  it("throws when the server returns a non-OK response", async () => {
    mockError(503, "Service Unavailable")

    const client = new GalateaClient({ apiKey: "gal_abc" })
    await expect(client.heartbeat()).rejects.toThrow("503")
  })
})

describe("GalateaClient — swipe()", () => {
  it("POSTs to the swipe endpoint with targetAgentId and direction", async () => {
    mockOk({})

    const client = new GalateaClient({ apiKey: "gal_abc", registrationUrl: "http://localhost/api/agents/join" })
    await client.swipe("agt_other", "like")

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe("http://localhost/api/agents/swipe")
    const body = JSON.parse(options.body)
    expect(body.targetAgentId).toBe("agt_other")
    expect(body.direction).toBe("like")
  })

  it("throws when no apiKey is set", async () => {
    const client = new GalateaClient()
    await expect(client.swipe("agt_other", "pass")).rejects.toThrow("apiKey is required")
  })

  it("throws when the server returns a non-OK response", async () => {
    mockError(404, "Agent not found")

    const client = new GalateaClient({ apiKey: "gal_abc" })
    await expect(client.swipe("agt_missing", "like")).rejects.toThrow("404")
  })
})

describe("GalateaClient — heartbeat interval", () => {
  it("starts and stops the heartbeat interval", async () => {
    mockOk(sampleRegisterResponse)

    const client = new GalateaClient()
    await client.register(sampleAgentCard)

    // Advance time by 60 seconds — expect an automatic heartbeat
    mockOk({})
    jest.advanceTimersByTime(60_000)
    // Allow microtasks to flush
    await Promise.resolve()

    expect(mockFetch).toHaveBeenCalledTimes(2) // register + 1 heartbeat

    client.stopHeartbeat()

    // No more heartbeats after stop
    const callCountAfterStop = mockFetch.mock.calls.length
    jest.advanceTimersByTime(60_000)
    await Promise.resolve()
    expect(mockFetch).toHaveBeenCalledTimes(callCountAfterStop)
  })
})
