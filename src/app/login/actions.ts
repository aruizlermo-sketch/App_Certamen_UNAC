"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/").trim() || "/";

  if (!email || !password) {
    return { error: "Ingresa email y contraseña." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
