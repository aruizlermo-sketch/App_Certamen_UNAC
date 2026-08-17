"use server";

import { revalidatePath } from "next/cache";
import { getAppSession } from "@/lib/auth/session";
import { getCalificaciones, saveCalificacion } from "@/lib/certamen/service";

export async function loadCalificacionesAction(juradoId: string) {
  return getCalificaciones(undefined, { forJuradoId: juradoId });
}

export async function saveScoreAction(formData: FormData) {
  const session = await getAppSession();

  if (!session.isDemo && !session.userId) {
    return { ok: false as const, error: "Sesion no valida." };
  }

  const clientJuradoId = String(formData.get("juradoId") ?? "");
  const juradoId =
    session.rol === "jurado" && session.juradoId
      ? session.juradoId
      : clientJuradoId;

  const result = await saveCalificacion({
    juradoId,
    participanteId: String(formData.get("participanteId") ?? ""),
    categoriaCriterioId: String(formData.get("categoriaCriterioId") ?? ""),
    puntaje: Number(formData.get("puntaje")),
    escalaMin: Number(formData.get("escalaMin") ?? 1),
    escalaMax: Number(formData.get("escalaMax") ?? 10),
  });

  if (result.ok) {
    revalidatePath("/jurado");
    if (session.rol === "admin") {
      revalidatePath("/resultados");
      revalidatePath("/");
    }
  }

  return result;
}
