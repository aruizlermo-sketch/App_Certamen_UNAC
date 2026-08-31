import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import { getAppSession } from "@/lib/auth/session";
import { canViewResultados, canViewAllCalificaciones } from "@/lib/auth/guards";
import {
  assertJuradoOwnsCategory,
  filterCalificacionesForSession,
  resolveJuradoIdForSave,
} from "@/lib/auth/permissions";
import {
  buildConcursoCompleto,
  calcularResultados,
} from "@/lib/certamen/aggregator";
import {
  mapCalificacion,
  mapCategoria,
  mapConcurso,
  mapCriterio,
  mapJurado,
  mapJuradoCategoria,
  mapParticipante,
} from "@/lib/certamen/mappers";
import {
  getMockCalificaciones,
  mockCategorias,
  mockConcurso,
  mockCriterios,
  mockJuradoCategorias,
  mockJurados,
  mockParticipantes,
  upsertMockCalificacion,
} from "@/lib/certamen/mock-data";
import { fail, ok, type VoidResult } from "@/lib/result";
import { validatePuntaje } from "@/lib/validators";
import type {
  Calificacion,
  ConcursoCompleto,
  ResultadosConcurso,
} from "@/types/certamen";

export const getConcursoCompleto = cache(async (
  concursoId?: string,
): Promise<ConcursoCompleto | null> => {
  const id = concursoId ?? mockConcurso.id;

  if (!isSupabaseConfigured()) {
    return buildConcursoCompleto(
      mockConcurso,
      mockCategorias,
      mockCriterios,
      mockParticipantes,
      mockJurados,
      mockJuradoCategorias,
    );
  }

  const session = await getAppSession();
  const useSupervisionRpc =
    session.esPresidente && session.rol !== "admin";

  const supabase = await createServerClient();

  const { data: concursoRow } = await supabase
    .from("concursos")
    .select("*")
    .eq("id", id)
    .single();

  if (!concursoRow) return null;

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .eq("concurso_id", id)
    .order("orden");

  const categoriaIds = (categorias ?? []).map((c) => String(c.id));

  const [
    { data: criterios },
    { data: participantes },
    juradosResult,
    juradoCatsResult,
  ] = await Promise.all([
    categoriaIds.length
      ? supabase
          .from("categoria_criterios")
          .select("*")
          .in("categoria_id", categoriaIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    supabase.from("participantes").select("*").eq("concurso_id", id).order("orden"),
    useSupervisionRpc
      ? supabase.rpc("supervision_jurados", { p_concurso_id: id })
      : supabase.from("jurados").select("*").eq("concurso_id", id),
    useSupervisionRpc
      ? supabase.rpc("supervision_jurado_categorias", { p_concurso_id: id })
      : categoriaIds.length
        ? supabase
            .from("jurado_categorias")
            .select("*")
            .in("categoria_id", categoriaIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
  ]);

  const jurados = juradosResult.data ?? [];
  const juradoCats = juradoCatsResult.data ?? [];

  return buildConcursoCompleto(
    mapConcurso(concursoRow),
    (categorias ?? []).map(mapCategoria),
    (criterios ?? []).map(mapCriterio),
    (participantes ?? []).map(mapParticipante),
    jurados.map(mapJurado),
    juradoCats.map(mapJuradoCategoria),
  );
});

export async function getCalificaciones(
  concursoId?: string,
  options?: {
    forJuradoId?: string;
    viewAll?: boolean;
    scope?: "rankings" | "supervision";
  },
): Promise<Calificacion[]> {
  const id = concursoId ?? mockConcurso.id;
  const session = await getAppSession();
  const scope = options?.scope ?? "rankings";
  const viewAll =
    options?.viewAll && canViewAllCalificaciones(session, scope);

  if (!isSupabaseConfigured()) {
    return filterCalificacionesForSession(
      getMockCalificaciones(),
      session,
      { forJuradoId: options?.forJuradoId, viewAll, scope },
    );
  }

  const supabase = await createServerClient();
  const concurso = await getConcursoCompleto(id);
  if (!concurso) return [];

  const criterioIds = concurso.categorias.flatMap((c) =>
    c.criterios.map((cr) => cr.id),
  );

  let query = supabase
    .from("calificaciones")
    .select("*")
    .in("categoria_criterio_id", criterioIds);

  if (!viewAll && session.rol === "jurado" && session.juradoId) {
    query = query.eq("jurado_id", session.juradoId);
  } else if (options?.forJuradoId) {
    query = query.eq("jurado_id", options.forJuradoId);
  }

  const { data } = await query;

  return (data ?? []).map(mapCalificacion);
}

export async function getResultados(
  concursoId?: string,
): Promise<ResultadosConcurso | null> {
  const session = await getAppSession();

  if (!canViewResultados(session)) {
    return null;
  }

  const concurso = await getConcursoCompleto(concursoId);
  if (!concurso) return null;

  const calificaciones = await getCalificaciones(concurso.id, {
    viewAll: true,
    scope: "rankings",
  });

  const categorias = concurso.categorias.map(({ criterios: _, jurados: __, ...cat }) => cat);
  const criterios = concurso.categorias.flatMap((c) => c.criterios);
  const juradoCategorias = concurso.categorias.flatMap((c) =>
    c.jurados.map((j) => ({ juradoId: j.id, categoriaId: c.id })),
  );

  return calcularResultados(
    concurso,
    categorias,
    criterios,
    concurso.participantes,
    juradoCategorias,
    calificaciones,
  );
}

export async function saveCalificacion(input: {
  juradoId: string;
  participanteId: string;
  categoriaCriterioId: string;
  puntaje: number;
  escalaMin: number;
  escalaMax: number;
}): Promise<VoidResult> {
  const session = await getAppSession();

  const juradoId = resolveJuradoIdForSave(session, input.juradoId);
  if (!juradoId) {
    return fail("No tienes permiso para calificar.");
  }

  const puntajeError = validatePuntaje(
    input.puntaje,
    input.escalaMin,
    input.escalaMax,
  );
  if (puntajeError) return puntajeError;

  const concurso = await getConcursoCompleto();
  if (!concurso) {
    return fail("Concurso no encontrado.");
  }

  const categoryCheck = assertJuradoOwnsCategory(
    concurso,
    juradoId,
    input.categoriaCriterioId,
  );
  if (!categoryCheck.ok) {
    return categoryCheck;
  }

  if (!isSupabaseConfigured()) {
    upsertMockCalificacion({
      juradoId,
      participanteId: input.participanteId,
      categoriaCriterioId: input.categoriaCriterioId,
      puntaje: input.puntaje,
    });
    return ok();
  }

  if (session.rol === "jurado" && session.juradoId !== juradoId) {
    return fail("No puedes calificar como otro jurado.");
  }

  if (session.esPresidente && session.juradoId !== juradoId) {
    return fail("Como presidente solo puedes editar tus propias notas.");
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("calificaciones").upsert(
    {
      jurado_id: juradoId,
      participante_id: input.participanteId,
      categoria_criterio_id: input.categoriaCriterioId,
      puntaje: input.puntaje,
    },
    { onConflict: "jurado_id,participante_id,categoria_criterio_id" },
  );

  if (error) {
    return fail(error.message);
  }

  return ok();
}

export async function saveCalificaciones(input: {
  juradoId: string;
  participanteId: string;
  scores: Array<{ categoriaCriterioId: string; puntaje: number }>;
  escalaMin: number;
  escalaMax: number;
}): Promise<VoidResult> {
  if (!input.scores.length) {
    return fail("No hay notas para guardar.");
  }

  const session = await getAppSession();

  const juradoId = resolveJuradoIdForSave(session, input.juradoId);
  if (!juradoId) {
    return fail("No tienes permiso para calificar.");
  }

  for (const score of input.scores) {
    const puntajeError = validatePuntaje(
      score.puntaje,
      input.escalaMin,
      input.escalaMax,
    );
    if (puntajeError) return puntajeError;
  }

  const concurso = await getConcursoCompleto();
  if (!concurso) {
    return fail("Concurso no encontrado.");
  }

  for (const score of input.scores) {
    const categoryCheck = assertJuradoOwnsCategory(
      concurso,
      juradoId,
      score.categoriaCriterioId,
    );
    if (!categoryCheck.ok) {
      return categoryCheck;
    }
  }

  if (!isSupabaseConfigured()) {
    for (const score of input.scores) {
      upsertMockCalificacion({
        juradoId,
        participanteId: input.participanteId,
        categoriaCriterioId: score.categoriaCriterioId,
        puntaje: score.puntaje,
      });
    }
    return ok();
  }

  if (session.rol === "jurado" && session.juradoId !== juradoId) {
    return fail("No puedes calificar como otro jurado.");
  }

  if (session.esPresidente && session.juradoId !== juradoId) {
    return fail("Como presidente solo puedes editar tus propias notas.");
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("calificaciones").upsert(
    input.scores.map((score) => ({
      jurado_id: juradoId,
      participante_id: input.participanteId,
      categoria_criterio_id: score.categoriaCriterioId,
      puntaje: score.puntaje,
    })),
    { onConflict: "jurado_id,participante_id,categoria_criterio_id" },
  );

  if (error) {
    return fail(error.message);
  }

  return ok();
}
