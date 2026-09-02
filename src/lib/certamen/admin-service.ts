import { assertAdminSession } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  MOCK_CONCURSO_ID,
  mockCategorias,
  mockCriterios,
  mockJuradoCategorias,
  mockJurados,
  mockParticipantes,
} from "@/lib/certamen/mock-data";
import { fail, ok, type VoidResult } from "@/lib/result";
import { normalizeEmail, requireEmail, requireEscudoUrl, requireNombre } from "@/lib/validators";

function mapSupabaseError(message: string): string {
  if (message.includes("categorias_peso_total_check")) {
    return "Multiplicador no permitido por la base de datos. Ejecuta el script categoria-multiplicadores.sql en Supabase (permite valores como 3).";
  }
  return message;
}

// --- Participantes ---

export async function createParticipante(input: {
  concursoId: string;
  nombre: string;
  escudoUrl: string | null;
  orden: number;
}): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;
  const nombreError = requireNombre(input.nombre);
  if (nombreError) return nombreError;
  const escudoError = requireEscudoUrl(input.escudoUrl);
  if (escudoError) return escudoError;

  if (!isSupabaseConfigured()) {
    mockParticipantes.push({
      id: crypto.randomUUID(),
      concursoId: input.concursoId || MOCK_CONCURSO_ID,
      nombre: input.nombre,
      escudoUrl: input.escudoUrl,
      orden: input.orden,
      evaluacionCerrada: false,
    });
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("participantes").insert({
    concurso_id: input.concursoId,
    nombre: input.nombre,
    escudo_url: input.escudoUrl,
    orden: input.orden,
  });

  return error ? fail(error.message) : ok();
}

export async function updateParticipante(
  id: string,
  input: { nombre: string; escudoUrl: string | null; orden: number },
): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;
  const nombreError = requireNombre(input.nombre);
  if (nombreError) return nombreError;
  const escudoError = requireEscudoUrl(input.escudoUrl);
  if (escudoError) return escudoError;

  if (!isSupabaseConfigured()) {
    const item = mockParticipantes.find((p) => p.id === id);
    if (!item) return fail("Participante no encontrado.");
    item.nombre = input.nombre;
    item.escudoUrl = input.escudoUrl;
    item.orden = input.orden;
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("participantes")
    .update({
      nombre: input.nombre,
      escudo_url: input.escudoUrl,
      orden: input.orden,
    })
    .eq("id", id);

  return error ? fail(error.message) : ok();
}

export async function setParticipanteEvaluacionCerrada(
  id: string,
  evaluacionCerrada: boolean,
): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    const item = mockParticipantes.find((p) => p.id === id);
    if (!item) return fail("Participante no encontrado.");
    item.evaluacionCerrada = evaluacionCerrada;
    return ok();
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("participantes")
    .update({ evaluacion_cerrada: evaluacionCerrada })
    .eq("id", id)
    .select("id, evaluacion_cerrada")
    .maybeSingle();

  if (error) {
    const missingColumn =
      error.message.includes("evaluacion_cerrada") ||
      error.code === "PGRST204";
    if (missingColumn) {
      return fail(
        "Falta la columna en la base de datos. Ejecuta supabase/participante-evaluacion-cerrada.sql en el SQL Editor de Supabase.",
      );
    }
    return fail(error.message);
  }

  if (!data || Boolean(data.evaluacion_cerrada) !== evaluacionCerrada) {
    return fail(
      "No se pudo guardar el cierre de evaluacion. Ejecuta supabase/participante-evaluacion-cerrada.sql en el SQL Editor de Supabase.",
    );
  }

  return ok();
}

export async function deleteParticipante(id: string): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    const idx = mockParticipantes.findIndex((p) => p.id === id);
    if (idx === -1) return fail("Participante no encontrado.");
    mockParticipantes.splice(idx, 1);
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("participantes").delete().eq("id", id);
  return error ? fail(error.message) : ok();
}

// --- Jurados ---

async function syncJuradoCategorias(juradoId: string, categoriaIds: string[]) {
  const supabase = await createServerClient();
  await supabase.from("jurado_categorias").delete().eq("jurado_id", juradoId);

  if (categoriaIds.length === 0) return;

  const { error } = await supabase.from("jurado_categorias").insert(
    categoriaIds.map((categoriaId) => ({
      jurado_id: juradoId,
      categoria_id: categoriaId,
    })),
  );

  if (error) throw new Error(error.message);
}

async function syncPresidente(
  concursoId: string,
  juradoId: string,
  esPresidente: boolean,
) {
  if (!isSupabaseConfigured()) {
    for (const j of mockJurados) {
      if (j.concursoId === concursoId) {
        j.esPresidente = esPresidente && j.id === juradoId;
      }
    }
    return;
  }

  const supabase = await createServerClient();
  if (esPresidente) {
    await supabase
      .from("jurados")
      .update({ es_presidente: false })
      .eq("concurso_id", concursoId);
    await supabase
      .from("jurados")
      .update({ es_presidente: true })
      .eq("id", juradoId);
  } else {
    await supabase
      .from("jurados")
      .update({ es_presidente: false })
      .eq("id", juradoId);
  }
}

export async function createJurado(input: {
  concursoId: string;
  nombre: string;
  email: string | null;
  activo: boolean;
  esPresidente: boolean;
  categoriaIds: string[];
}): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;
  const nombreError = requireNombre(input.nombre);
  if (nombreError) return nombreError;
  const email = normalizeEmail(input.email);

  if (!isSupabaseConfigured()) {
    const id = crypto.randomUUID();
    mockJurados.push({
      id,
      concursoId: input.concursoId || MOCK_CONCURSO_ID,
      nombre: input.nombre,
      email,
      userId: null,
      esPresidente: false,
      activo: input.activo,
    });
    for (const categoriaId of input.categoriaIds) {
      mockJuradoCategorias.push({ juradoId: id, categoriaId });
    }
    await syncPresidente(input.concursoId || MOCK_CONCURSO_ID, id, input.esPresidente);
    return ok();
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("jurados")
    .insert({
      concurso_id: input.concursoId,
      nombre: input.nombre,
      email,
      activo: input.activo,
    })
    .select("id")
    .single();

  if (error || !data) return fail(error?.message ?? "No se pudo crear el jurado.");

  try {
    await syncJuradoCategorias(String(data.id), input.categoriaIds);
    await syncPresidente(input.concursoId, String(data.id), input.esPresidente);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Error al asignar categorias.");
  }

  return ok();
}

export async function updateJurado(
  id: string,
  input: {
    nombre: string;
    email: string | null;
    activo: boolean;
    esPresidente: boolean;
    categoriaIds: string[];
  },
): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;
  const nombreError = requireNombre(input.nombre);
  if (nombreError) return nombreError;
  const email = normalizeEmail(input.email);

  if (!isSupabaseConfigured()) {
    const item = mockJurados.find((j) => j.id === id);
    if (!item) return fail("Jurado no encontrado.");
    item.nombre = input.nombre;
    item.email = email;
    item.activo = input.activo;
    for (let i = mockJuradoCategorias.length - 1; i >= 0; i--) {
      if (mockJuradoCategorias[i].juradoId === id) {
        mockJuradoCategorias.splice(i, 1);
      }
    }
    for (const categoriaId of input.categoriaIds) {
      mockJuradoCategorias.push({ juradoId: id, categoriaId });
    }
    await syncPresidente(item.concursoId, id, input.esPresidente);
    return ok();
  }

  const supabase = await createServerClient();
  const { data: existing } = await supabase
    .from("jurados")
    .select("concurso_id, email, user_id")
    .eq("id", id)
    .single();

  const prevEmail = existing?.email
    ? String(existing.email).trim().toLowerCase()
    : null;
  const emailChanged = prevEmail !== email;

  const { error } = await supabase
    .from("jurados")
    .update({
      nombre: input.nombre,
      email,
      activo: input.activo,
      ...(emailChanged ? { user_id: null } : {}),
    })
    .eq("id", id);

  if (error) return fail(error.message);

  try {
    await syncJuradoCategorias(id, input.categoriaIds);
    if (existing?.concurso_id) {
      await syncPresidente(String(existing.concurso_id), id, input.esPresidente);
    }
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Error al asignar categorias.");
  }

  return ok();
}

export async function resetJuradoLink(id: string): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    const item = mockJurados.find((j) => j.id === id);
    if (!item) return fail("Jurado no encontrado.");
    item.userId = null;
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("jurados")
    .update({ user_id: null })
    .eq("id", id);

  return error ? fail(error.message) : ok();
}

export async function deleteJurado(id: string): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    const idx = mockJurados.findIndex((j) => j.id === id);
    if (idx === -1) return fail("Jurado no encontrado.");
    mockJurados.splice(idx, 1);
    for (let i = mockJuradoCategorias.length - 1; i >= 0; i--) {
      if (mockJuradoCategorias[i].juradoId === id) {
        mockJuradoCategorias.splice(i, 1);
      }
    }
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("jurados").delete().eq("id", id);
  return error ? fail(error.message) : ok();
}

// --- Categorias ---

export async function createCategoria(input: {
  concursoId: string;
  nombre: string;
  descripcion: string | null;
  multiplicador: number;
  tienePremio: boolean;
  orden: number;
}): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;
  const nombreError = requireNombre(input.nombre);
  if (nombreError) return nombreError;

  if (!isSupabaseConfigured()) {
    mockCategorias.push({
      id: crypto.randomUUID(),
      concursoId: input.concursoId || MOCK_CONCURSO_ID,
      nombre: input.nombre,
      descripcion: input.descripcion,
      multiplicador: input.multiplicador,
      tienePremio: input.tienePremio,
      orden: input.orden,
    });
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("categorias").insert({
    concurso_id: input.concursoId,
    nombre: input.nombre,
    descripcion: input.descripcion,
    peso_total: input.multiplicador,
    tiene_premio: input.tienePremio,
    orden: input.orden,
  });

  return error ? fail(mapSupabaseError(error.message)) : ok();
}

export async function updateCategoria(
  id: string,
  input: {
    nombre: string;
    descripcion: string | null;
    multiplicador: number;
    tienePremio: boolean;
    orden: number;
  },
): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;
  const nombreError = requireNombre(input.nombre);
  if (nombreError) return nombreError;

  if (!isSupabaseConfigured()) {
    const item = mockCategorias.find((c) => c.id === id);
    if (!item) return fail("Categoria no encontrada.");
    item.nombre = input.nombre;
    item.descripcion = input.descripcion;
    item.multiplicador = input.multiplicador;
    item.tienePremio = input.tienePremio;
    item.orden = input.orden;
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("categorias")
    .update({
      nombre: input.nombre,
      descripcion: input.descripcion,
      peso_total: input.multiplicador,
      tiene_premio: input.tienePremio,
      orden: input.orden,
    })
    .eq("id", id);

  return error ? fail(mapSupabaseError(error.message)) : ok();
}

export async function deleteCategoria(id: string): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    const idx = mockCategorias.findIndex((c) => c.id === id);
    if (idx === -1) return fail("Categoria no encontrada.");
    mockCategorias.splice(idx, 1);
    for (let i = mockCriterios.length - 1; i >= 0; i--) {
      if (mockCriterios[i].categoriaId === id) mockCriterios.splice(i, 1);
    }
    for (let i = mockJuradoCategorias.length - 1; i >= 0; i--) {
      if (mockJuradoCategorias[i].categoriaId === id) {
        mockJuradoCategorias.splice(i, 1);
      }
    }
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("categorias").delete().eq("id", id);
  return error ? fail(error.message) : ok();
}

// --- Criterios ---

export async function createCriterio(input: {
  categoriaId: string;
  nombre: string;
  descripcion: string | null;
  peso: number;
  orden: number;
}): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;
  const nombreError = requireNombre(input.nombre);
  if (nombreError) return nombreError;

  if (!isSupabaseConfigured()) {
    mockCriterios.push({
      id: crypto.randomUUID(),
      categoriaId: input.categoriaId,
      nombre: input.nombre,
      descripcion: input.descripcion,
      peso: input.peso,
      orden: input.orden,
    });
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("categoria_criterios").insert({
    categoria_id: input.categoriaId,
    nombre: input.nombre,
    descripcion: input.descripcion,
    peso: input.peso,
    orden: input.orden,
  });

  return error ? fail(error.message) : ok();
}

export async function updateCriterio(
  id: string,
  input: {
    nombre: string;
    descripcion: string | null;
    peso: number;
    orden: number;
  },
): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;
  const nombreError = requireNombre(input.nombre);
  if (nombreError) return nombreError;

  if (!isSupabaseConfigured()) {
    const item = mockCriterios.find((c) => c.id === id);
    if (!item) return fail("Criterio no encontrado.");
    item.nombre = input.nombre;
    item.descripcion = input.descripcion;
    item.peso = input.peso;
    item.orden = input.orden;
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("categoria_criterios")
    .update({
      nombre: input.nombre,
      descripcion: input.descripcion,
      peso: input.peso,
      orden: input.orden,
    })
    .eq("id", id);

  return error ? fail(error.message) : ok();
}

export async function deleteCriterio(id: string): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    const idx = mockCriterios.findIndex((c) => c.id === id);
    if (idx === -1) return fail("Criterio no encontrado.");
    mockCriterios.splice(idx, 1);
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("categoria_criterios").delete().eq("id", id);
  return error ? fail(error.message) : ok();
}

// --- Admin invites (acceso por email) ---

const mockAdminInvites: { email: string; nombre: string }[] = [];

export async function listAdminInvites(): Promise<{ email: string; nombre: string }[]> {
  const denied = await assertAdminSession();
  if (denied) return [];

  if (!isSupabaseConfigured()) {
    return [...mockAdminInvites];
  }

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("admin_invites")
    .select("email, nombre")
    .order("email");

  return (data ?? []).map((row) => ({
    email: String(row.email),
    nombre: String(row.nombre ?? ""),
  }));
}

export async function createAdminInvite(input: {
  email: string;
  nombre: string;
}): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;

  const emailCheck = requireEmail(input.email);
  if (!emailCheck.ok) return emailCheck;
  const email = emailCheck.email;

  if (!isSupabaseConfigured()) {
    if (mockAdminInvites.some((i) => i.email === email)) {
      return fail("Ese email ya tiene invitacion de admin.");
    }
    mockAdminInvites.push({ email, nombre: input.nombre.trim() || email });
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("admin_invites").insert({
    email,
    nombre: input.nombre.trim() || email.split("@")[0],
  });

  return error ? fail(error.message) : ok();
}

export async function deleteAdminInvite(email: string): Promise<VoidResult> {
  const denied = await assertAdminSession();
  if (denied) return denied;

  const normalized = normalizeEmail(email);
  if (!normalized) return fail("Ingresa un email valido.");

  if (!isSupabaseConfigured()) {
    const idx = mockAdminInvites.findIndex((i) => i.email === normalized);
    if (idx === -1) return fail("Invitacion no encontrada.");
    mockAdminInvites.splice(idx, 1);
    return ok();
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("admin_invites")
    .delete()
    .eq("email", normalized);

  return error ? fail(error.message) : ok();
}
