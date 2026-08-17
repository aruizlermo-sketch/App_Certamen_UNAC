import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/config";

export async function createServerClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("Supabase no esta configurado.");
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Se ignora en Server Components; el proxy refresca la sesion.
        }
      },
    },
  });
}
