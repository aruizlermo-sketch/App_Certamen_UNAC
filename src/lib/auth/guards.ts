import { getAppSession } from "@/lib/auth/session";
import type { AppSession } from "@/types/auth";
import type { VoidResult } from "@/lib/result";
import { fail } from "@/lib/result";

export async function assertAdminSession(): Promise<VoidResult | null> {
  const session = await getAppSession();
  if (!session.isDemo && session.rol !== "admin") {
    return fail("No autorizado.");
  }
  return null;
}

/** Rankings del certamen: admin y cualquier jurado activo. */
export function canViewResultados(session: AppSession): boolean {
  return session.rol === "admin" || Boolean(session.juradoId);
}

/** Detalle nota por nota de todos los jurados. */
export function canViewNotasJurados(session: AppSession): boolean {
  return session.rol === "admin" || session.esPresidente;
}

/** Descargar PDF de resultados globales. */
export function canPrintResultados(session: AppSession): boolean {
  return session.rol === "admin" || session.esPresidente;
}

export type CalificacionesScope = "rankings" | "supervision";

export function canViewAllCalificaciones(
  session: AppSession,
  scope: CalificacionesScope,
): boolean {
  if (session.rol === "admin") return true;
  if (scope === "supervision") return session.esPresidente;
  return Boolean(session.juradoId);
}
