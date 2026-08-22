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

export function canViewResultados(session: AppSession): boolean {
  return session.rol === "admin" || session.esPresidente;
}
