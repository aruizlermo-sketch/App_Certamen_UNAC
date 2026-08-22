import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import { getAppSession } from "@/lib/auth/session";
import {
  assertJuradoOwnsCategory,
  canViewAllCalificaciones,
  filterCalificacionesForSession,
  resolveJuradoIdForSave,
} from "@/lib/auth/permissions";
import {
  buildConcursoCompleto,
  calcularResultados,
} from "@/lib/certamen/aggregator";
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
import type {
  Calificacion,
  ConcursoCompleto,
  ResultadosConcurso,
} from "@/types/certamen";

function mapConcurso(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    nombre: String(row.nombre),
    descripcion: row.descripcion ? String(row.descripcion) : null,
    escalaMin: Number(row.escala_min),
    escalaMax: Number(row.escala_max),
    estado: row.estado as "borrador" | "activo" | "cerrado",
  };
}

function mapCalificacion(row: Record<string, unknown>): Calificacion {
  return {
    id: String(row.id),
    juradoId: String(row.jurado_id),
    participanteId: String(row.participante_id),
    categoriaCriterioId: String(row.categoria_criterio_id),
    puntaje: Number(row.puntaje),
  };
}

export async function getConcursoCompleto(
  concursoId?: string,
): Promise<ConcursoCompleto | null> {
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

  const supabase = await createServerClient();

  const { data: concursoRow } = await supabase
    .from("concursos")
    .select("*")
    .eq("id", id)
    .single();

  if (!concursoRow) return null;

  const [
    { data: categorias },
    { data: criterios },
    { data: participantes },
    { data: jurados },
    { data: juradoCats },
  ] = await Promise.all([
    supabase.from("categorias").select("*").eq("concurso_id", id).order("orden"),
    supabase.from("categoria_criterios").select("*"),
    supabase.from("participantes").select("*").eq("concurso_id", id).order("orden"),
    supabase.from("jurados").select("*").eq("concurso_id", id),
    supabase.from("jurado_categorias").select("*"),
  ]);

  const categoriaIds = (categorias ?? []).map((c) => String(c.id));
  const criteriosFiltered = (criterios ?? []).filter((c) =>
    categoriaIds.includes(String(c.categoria_id)),
  );
  const juradoCatsFiltered = (juradoCats ?? []).filter((jc) =>
    categoriaIds.includes(String(jc.categoria_id)),
  );

  return buildConcursoCompleto(
    mapConcurso(concursoRow),
    (categorias ?? []).map((c) => ({
      id: String(c.id),
      concursoId: String(c.concurso_id),
      nombre: String(c.nombre),
      descripcion: c.descripcion ? String(c.descripcion) : null,
      pesoTotal: Number(c.peso_total),
      orden: Number(c.orden),
    })),
    criteriosFiltered.map((c) => ({
      id: String(c.id),
      categoriaId: String(c.categoria_id),
      nombre: String(c.nombre),
      descripcion: c.descripcion ? String(c.descripcion) : null,
      peso: Number(c.peso),
      orden: Number(c.orden),
    })),
    (participantes ?? []).map((p) => ({
      id: String(p.id),
      concursoId: String(p.concurso_id),
      nombre: String(p.nombre),
      orden: Number(p.orden),
    })),
    (jurados ?? []).map((j) => ({
      id: String(j.id),
      concursoId: String(j.concurso_id),
      nombre: String(j.nombre),
      email: j.email ? String(j.email) : null,
      userId: j.user_id ? String(j.user_id) : null,
      esPresidente: Boolean(j.es_presidente),
      activo: Boolean(j.activo),
    })),
    juradoCatsFiltered.map((jc) => ({
      juradoId: String(jc.jurado_id),
      categoriaId: String(jc.categoria_id),
    })),
  );
}

export async function getCalificaciones(
  concursoId?: string,
  options?: { forJuradoId?: string; viewAll?: boolean },
): Promise<Calificacion[]> {
  const id = concursoId ?? mockConcurso.id;
  const session = await getAppSession();
  const viewAll = options?.viewAll && canViewAllCalificaciones(session);

  if (!isSupabaseConfigured()) {
    return filterCalificacionesForSession(
      getMockCalificaciones(),
      session,
      { forJuradoId: options?.forJuradoId, viewAll },
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

  if (session.rol !== "admin" && !session.esPresidente) {
    return null;
  }

  const concurso = await getConcursoCompleto(concursoId);
  if (!concurso) return null;

  const calificaciones = await getCalificaciones(concurso.id, { viewAll: true });

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
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getAppSession();

  const juradoId = resolveJuradoIdForSave(session, input.juradoId);
  if (!juradoId) {
    return { ok: false, error: "No tienes permiso para calificar." };
  }

  if (input.puntaje < input.escalaMin || input.puntaje > input.escalaMax) {
    return {
      ok: false,
      error: `La nota debe estar entre ${input.escalaMin} y ${input.escalaMax}.`,
    };
  }

  const concurso = await getConcursoCompleto();
  if (!concurso) {
    return { ok: false, error: "Concurso no encontrado." };
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
    return { ok: true };
  }

  if (session.rol === "jurado" && session.juradoId !== juradoId) {
    return { ok: false, error: "No puedes calificar como otro jurado." };
  }

  if (session.esPresidente && session.juradoId !== juradoId) {
    return { ok: false, error: "Como presidente solo puedes editar tus propias notas." };
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
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function getJuradoByUserId(
  userId: string,
  concursoId?: string,
): Promise<{ id: string; nombre: string } | null> {
  const id = concursoId ?? mockConcurso.id;

  if (!isSupabaseConfigured()) {
    return mockJurados[0] ?? null;
  }

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("jurados")
    .select("id, nombre")
    .eq("concurso_id", id)
    .eq("user_id", userId)
    .maybeSingle();

  return data ? { id: String(data.id), nombre: String(data.nombre) } : null;
}

export async function listConcursos() {
  if (!isSupabaseConfigured()) {
    return [mockConcurso];
  }

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("concursos")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapConcurso);
}
