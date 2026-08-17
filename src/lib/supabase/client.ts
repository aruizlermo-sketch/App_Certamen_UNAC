import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/config";

export function createBrowserClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("Supabase no esta configurado.");
  }

  return createSupabaseBrowserClient(env.url, env.key);
}
