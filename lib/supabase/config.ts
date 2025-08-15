import "server-only"

/**
 * Server-only Supabase config readers.
 * Reads ONLY server env vars to avoid exposing variable names in client bundles.
 */
export function getPublicSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment.",
    )
  }

  return { url, anonKey }
}

export function hasSupabaseEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
}
