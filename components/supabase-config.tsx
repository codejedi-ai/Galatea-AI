/**
 * Server Component that injects public Supabase config into the browser
 * without bundling env variables in client code.
 * If server envs are not set, it silently renders nothing.
 */
import { getPublicSupabaseConfig } from "@/lib/supabase/config"

export default function SupabaseConfigScript() {
  try {
    const { url, anonKey } = getPublicSupabaseConfig()

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
