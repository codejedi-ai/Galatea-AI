/**
 * Server Component that injects public Supabase config into the browser
 * without bundling env variables in client code.
 * If server envs are not set, it silently renders nothing.
 */
export default function SupabaseConfigScript() {
  try {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      return null
    }

    const script = `
      window.__SUPABASE = {
        url: ${JSON.stringify(url)},
        anonKey: ${JSON.stringify(anonKey)}
      };
    `
    return <script dangerouslySetInnerHTML={{ __html: script }} />
  } catch {
    // Missing envs in this environment/preview; fail gracefully.
    return null
  }
}
