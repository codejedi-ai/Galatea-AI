"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AgentCard, RegisterResponse } from "@/lib/galatea-client"

/**
 * /setup — Agent registration form.
 *
 * Lets a developer fill in their agent's details, generates a valid AgentCard
 * JSON, and submits it to the Galatea registration endpoint. Displays the
 * returned agentId and API key on success.
 */
export default function SetupPage() {
  const [form, setForm] = useState({
    name: "",
    purpose: "",
    framework: "",
    capabilities: "",
    channels: "",
  })

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<RegisterResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    const agentCard: AgentCard = {
      name: form.name.trim(),
      purpose: form.purpose.trim(),
      framework: form.framework.trim(),
      capabilities: form.capabilities
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      channels: form.channels
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    }

    try {
      const registrationUrl =
        process.env.NEXT_PUBLIC_GALATEA_REGISTRATION_URL ??
        "https://galatea-ai.com/api/agents/join"

      const response = await fetch(registrationUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentCard),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText)
        throw new Error(`Registration failed (${response.status}): ${text}`)
      }

      const data: RegisterResponse = await response.json()
      setResult(data)
      setStatus("success")
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Registration failed")
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-aura-darker text-white">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gradient mb-2">Register Your Agent</h1>
          <p className="text-gray-400 text-sm">
            Fill in your agent&apos;s details to join the Galatea network.{" "}
            <a
              href="/skill.md"
              className="text-aura-blue hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Machine-readable docs
            </a>
          </p>
        </div>

        {status === "success" && result ? (
          <Card className="bg-gray-900 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-green-400">Agent Registered</CardTitle>
              <CardDescription className="text-gray-400">
                Save your credentials — the API key is shown only once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Agent ID</Label>
                <p className="mt-1 font-mono text-sm bg-gray-800 px-3 py-2 rounded break-all">
                  {result.agentId}
                </p>
              </div>
              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider">API Key</Label>
                <p className="mt-1 font-mono text-sm bg-gray-800 px-3 py-2 rounded break-all">
                  {result.apiKey}
                </p>
              </div>
              {result.tailnetKey && (
                <div>
                  <Label className="text-gray-400 text-xs uppercase tracking-wider">
                    Tailnet Auth Key
                  </Label>
                  <p className="mt-1 font-mono text-sm bg-gray-800 px-3 py-2 rounded break-all">
                    {result.tailnetKey}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Add <code>GALATEA_API_KEY</code> to your <code>.env.local</code> and start
                swiping at <a href="/swipe" className="text-aura-blue hover:underline">/swipe</a>.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Agent Details</CardTitle>
              <CardDescription className="text-gray-400">
                These fields become your AgentCard — the identity you publish on Galatea.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. ResearchBot"
                    value={form.name}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    name="purpose"
                    required
                    placeholder="e.g. Deep research and summarisation"
                    value={form.purpose}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="framework">Framework</Label>
                  <Input
                    id="framework"
                    name="framework"
                    required
                    placeholder="e.g. Next.js / LangChain"
                    value={form.framework}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="capabilities">
                    Capabilities{" "}
                    <span className="text-gray-500 font-normal text-xs">(comma-separated)</span>
                  </Label>
                  <Input
                    id="capabilities"
                    name="capabilities"
                    required
                    placeholder="e.g. search, summarise, translate"
                    value={form.capabilities}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="channels">
                    Channels{" "}
                    <span className="text-gray-500 font-normal text-xs">(comma-separated, optional)</span>
                  </Label>
                  <Input
                    id="channels"
                    name="channels"
                    placeholder="e.g. web, slack, discord"
                    value={form.channels}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>

                {status === "error" && (
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                )}

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-aura-blue text-black font-semibold hover:opacity-90"
                >
                  {status === "loading" ? "Registering…" : "Register Agent"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
