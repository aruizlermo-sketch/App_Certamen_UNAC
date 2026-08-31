import { cache } from "react";
import { redirect } from "next/navigation";
import { canViewResultados, canViewNotasJurados } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import type { AppSession } from "@/types/auth";
import type { UserRol } from "@/types/certamen";

export type { AppSession } from "@/types/auth";

const demoSession: AppSession = {
  userId: null,
  email: null,
  rol: "admin",
  juradoId: null,
  juradoNombre: null,
  esPresidente: false,
  isDemo: true,
};

export const getAppSession = cache(async (): Promise<AppSession> => {
  if (!isSupabaseConfigured()) {
    return demoSession;
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      email: null,
      rol: "jurado",
      juradoId: null,
      juradoNombre: null,
      esPresidente: false,
      isDemo: false,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol, nombre")
    .eq("id", user.id)
    .maybeSingle();

  const rol: UserRol = profile?.rol === "admin" ? "admin" : "jurado";

  if (rol === "admin") {
    return {
      userId: user.id,
      email: user.email ?? null,
      rol: "admin",
      juradoId: null,
      juradoNombre: profile?.nombre ? String(profile.nombre) : null,
      esPresidente: false,
      isDemo: false,
    };
  }

  const { data: jurado } = await supabase
    .from("jurados")
    .select("id, nombre, es_presidente")
    .eq("user_id", user.id)
    .eq("activo", true)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    rol: "jurado",
    juradoId: jurado ? String(jurado.id) : null,
    juradoNombre: jurado ? String(jurado.nombre) : null,
    esPresidente: jurado ? Boolean(jurado.es_presidente) : false,
    isDemo: false,
  };
});

export async function requireAuth(): Promise<AppSession> {
  const session = await getAppSession();

  if (!session.isDemo && !session.userId) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin(): Promise<AppSession> {
  const session = await requireAuth();

  if (session.rol !== "admin") {
    redirect("/jurado");
  }

  return session;
}

export async function requireJurado(): Promise<AppSession> {
  const session = await requireAuth();

  if (session.rol === "admin") {
    return session;
  }

  if (!session.juradoId) {
    redirect("/login");
  }

  return session;
}

export async function requireResultadosAccess(): Promise<AppSession> {
  const session = await requireAuth();

  if (!canViewResultados(session)) {
    redirect(session.juradoId ? "/jurado" : "/login");
  }

  return session;
}

export async function requireNotasJuradosAccess(): Promise<AppSession> {
  const session = await requireAuth();

  if (!canViewNotasJurados(session)) {
    redirect(session.juradoId ? "/jurado" : "/login");
  }

  return session;
}

export { canViewResultados, canViewNotasJurados, canPrintResultados } from "@/lib/auth/guards";
