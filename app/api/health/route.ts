import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ status: "ok", supabase: "not_configured" })
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from("agents").select("id").limit(1)
    if (error) throw error
    return NextResponse.json({ status: "ok", supabase: "connected" })
  } catch {
    return NextResponse.json({ status: "ok", supabase: "not_configured" })
  }
}
