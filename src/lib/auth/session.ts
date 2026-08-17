import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import { mockJurados } from "@/lib/certamen/mock-data";
import { linkUserByEmail } from "@/lib/auth/link-account";
import type { UserRol } from "@/types/certamen";

export type AppSession = {
  userId: string | null;
  email: string | null;
  rol: UserRol;
  juradoId: string | null;
  juradoNombre: string | null;
  isDemo: boolean;
};

const demoSession: AppSession = {
  userId: null,
  email: null,
  rol: "admin",
  juradoId: null,
  juradoNombre: null,
  isDemo: true,
};

export async function getAppSession(): Promise<AppSession> {
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
      isDemo: false,
    };
  }

  await linkUserByEmail(user.id, user.email);

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
      isDemo: false,
    };
  }

  const { data: jurado } = await supabase
    .from("jurados")
    .select("id, nombre")
    .eq("user_id", user.id)
    .eq("activo", true)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    rol: "jurado",
    juradoId: jurado ? String(jurado.id) : null,
    juradoNombre: jurado ? String(jurado.nombre) : null,
    isDemo: false,
  };
}

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

/** En demo, simula sesión de un jurado concreto. */
export function demoJuradoSession(juradoId: string): AppSession {
  const jurado = mockJurados.find((j) => j.id === juradoId);
  return {
    ...demoSession,
    rol: "jurado",
    juradoId,
    juradoNombre: jurado?.nombre ?? null,
  };
}

export function isAdmin(session: AppSession): boolean {
  return session.rol === "admin";
}

export function canViewResultados(session: AppSession): boolean {
  return session.rol === "admin";
}

export function canAccessAdmin(session: AppSession): boolean {
  return session.rol === "admin";
}
