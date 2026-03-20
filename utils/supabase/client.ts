import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/config/supabase-config";

export const createClient = () => {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseKey) {
    // No backend configured — return a no-op client so the site renders in showcase mode.
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        refreshSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ data: null, error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
        eq: function() { return this },
        neq: function() { return this },
        single: async () => ({ data: null, error: null }),
        then: function(cb: any) { return Promise.resolve(cb({ data: null, error: null })) },
        catch: function() { return this },
      }),
      rpc: async () => ({ data: null, error: null }),
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
