import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Singleton browser client. Creating a new client on every component render
 * causes auth state to flicker (each instance has its own listener), which
 * leads to redirect loops and "logged out immediately" bugs.
 */
let browserClient: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;

  // Fall back to harmless placeholders when env is absent (e.g. during static
  // prerender at build time, where these client components are SSR'd but no
  // network calls run). Real values are used at runtime in the browser.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  browserClient = createBrowserClient(url, anonKey);

  return browserClient;
}
