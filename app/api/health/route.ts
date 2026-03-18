import { NextResponse } from "next/server"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ status: "ok", supabase: "not_configured" })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(`${url}/rest/v1/agents?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    // 200 = table exists and connected
    // 404 = project not found / paused
    // 401 = bad key
    // anything not 2xx = treat as not connected
    if (!res.ok) {
      return NextResponse.json({ status: "ok", supabase: "not_configured" })
    }

    return NextResponse.json({ status: "ok", supabase: "connected" })
  } catch {
    return NextResponse.json({ status: "ok", supabase: "not_configured" })
  }
}
