"use server";

import { getAppSession } from "@/lib/auth/session";
import { getCalificaciones, saveCalificacion, saveCalificaciones } from "@/lib/certamen/service";
import { revalidateCertamenPaths } from "@/lib/revalidate-paths";

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
    revalidateCertamenPaths();
  }

  return result;
}

type SaveScoresInput = {
  juradoId: string;
  participanteId: string;
  scores: Array<{ categoriaCriterioId: string; puntaje: number }>;
  escalaMin: number;
  escalaMax: number;
};

export async function saveScoresAction(input: SaveScoresInput) {
  const session = await getAppSession();

  if (!session.isDemo && !session.userId) {
    return { ok: false as const, error: "Sesion no valida." };
  }

  const juradoId =
    session.rol === "jurado" && session.juradoId
      ? session.juradoId
      : input.juradoId;

  const result = await saveCalificaciones({
    juradoId,
    participanteId: input.participanteId,
    scores: input.scores,
    escalaMin: input.escalaMin,
    escalaMax: input.escalaMax,
  });

  if (result.ok) {
    revalidateCertamenPaths();
  }

  return result;
}
