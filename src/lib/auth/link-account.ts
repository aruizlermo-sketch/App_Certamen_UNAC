import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";

/** Vincula jurado/admin por email tras login. Idempotente. */
export async function linkUserByEmail(userId: string, email: string | null | undefined) {
  if (!isSupabaseConfigured() || !email?.trim()) return;

  const supabase = await createServerClient();
  await supabase.rpc("link_user_by_email", {
    p_user_id: userId,
    p_email: email.trim(),
  });
}
