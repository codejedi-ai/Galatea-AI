import "server-only"

/**
 * Server-only Supabase config readers.
 * Reads SERVER env vars to avoid exposing variable names in client bundles.
 */
export function getPublicSupabaseConfig() {
  // Prefer server-side envs. Fallbacks included if you have them set,
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL || // optional fallback
    process.env.NEXT_PUBLIC_SITE_URL // legacy fallback if previously used

  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // optional fallback

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY (or their NEXT_PUBLIC_* fallbacks) in your environment."
    )
  }

  return { url, anonKey }
}

export function hasSupabaseEnv() {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
}
