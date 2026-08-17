import type { AppSession } from "@/lib/auth/session";
import type { ConcursoCompleto } from "@/types/certamen";

export function resolveJuradoIdForSave(
  session: AppSession,
  clientJuradoId: string,
): string | null {
  if (session.isDemo) {
    return clientJuradoId || null;
  }

  if (session.rol === "admin") {
    return clientJuradoId || null;
  }

  return session.juradoId;
}

export function assertJuradoOwnsCategory(
  concurso: ConcursoCompleto,
  juradoId: string,
  categoriaCriterioId: string,
): { ok: true; categoriaId: string } | { ok: false; error: string } {
  for (const cat of concurso.categorias) {
    const criterio = cat.criterios.find((c) => c.id === categoriaCriterioId);
    if (!criterio) continue;

    const assigned = cat.jurados.some((j) => j.id === juradoId);
    if (!assigned) {
      return {
        ok: false,
        error: "No tienes permiso para calificar en esta categoria.",
      };
    }

    return { ok: true, categoriaId: cat.id };
  }

  return { ok: false, error: "Criterio no valido." };
}

export function filterCalificacionesForSession<
  T extends { juradoId: string },
>(items: T[], session: AppSession, activeJuradoId?: string): T[] {
  if (session.isDemo && activeJuradoId) {
    return items.filter((c) => c.juradoId === activeJuradoId);
  }

  if (session.rol === "admin") {
    return items;
  }

  if (session.juradoId) {
    return items.filter((c) => c.juradoId === session.juradoId);
  }

  return [];
}
