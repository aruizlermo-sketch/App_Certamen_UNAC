import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerClient } from "@/lib/supabase/server";
import { getAppSession } from "@/lib/auth/session";
import {
  MOCK_CONCURSO_ID,
  mockCategorias,
  mockCriterios,
  mockJuradoCategorias,
  mockJurados,
  mockParticipantes,
} from "@/lib/certamen/mock-data";

type Result = { ok: true } | { ok: false; error: string };

async function assertAdmin(): Promise<Result | null> {
  const session = await getAppSession();
  if (!session.isDemo && session.rol !== "admin") {
    return { ok: false, error: "No autorizado." };
  }
  return null;
}

function invalid(message: string): Result {
  return { ok: false, error: message };
}

// --- Participantes ---

export async function createParticipante(input: {
  concursoId: string;
  nombre: string;
  orden: number;
}): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;
  if (!input.nombre) return invalid("El nombre es obligatorio.");

  if (!isSupabaseConfigured()) {
    mockParticipantes.push({
      id: crypto.randomUUID(),
      concursoId: input.concursoId || MOCK_CONCURSO_ID,
      nombre: input.nombre,
      orden: input.orden,
    });
    return { ok: true };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("participantes").insert({
    concurso_id: input.concursoId,
    nombre: input.nombre,
    orden: input.orden,
  });

  return error ? invalid(error.message) : { ok: true };
}

export async function updateParticipante(
  id: string,
  input: { nombre: string; orden: number },
): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;
  if (!input.nombre) return invalid("El nombre es obligatorio.");

  if (!isSupabaseConfigured()) {
    const item = mockParticipantes.find((p) => p.id === id);
    if (!item) return invalid("Participante no encontrado.");
    item.nombre = input.nombre;
    item.orden = input.orden;
    return { ok: true };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("participantes")
    .update({ nombre: input.nombre, orden: input.orden })
    .eq("id", id);

  return error ? invalid(error.message) : { ok: true };
}

export async function deleteParticipante(id: string): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    const idx = mockParticipantes.findIndex((p) => p.id === id);
    if (idx === -1) return invalid("Participante no encontrado.");
    mockParticipantes.splice(idx, 1);
    return { ok: true };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("participantes").delete().eq("id", id);
  return error ? invalid(error.message) : { ok: true };
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

export async function createJurado(input: {
  concursoId: string;
  nombre: string;
  email: string | null;
  activo: boolean;
  categoriaIds: string[];
}): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;
  if (!input.nombre) return invalid("El nombre es obligatorio.");
  const email = input.email?.trim().toLowerCase() || null;

  if (!isSupabaseConfigured()) {
    const id = crypto.randomUUID();
    mockJurados.push({
      id,
      concursoId: input.concursoId || MOCK_CONCURSO_ID,
      nombre: input.nombre,
      email,
      userId: null,
      activo: input.activo,
    });
    for (const categoriaId of input.categoriaIds) {
      mockJuradoCategorias.push({ juradoId: id, categoriaId });
    }
    return { ok: true };
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

  if (error || !data) return invalid(error?.message ?? "No se pudo crear el jurado.");

  try {
    await syncJuradoCategorias(String(data.id), input.categoriaIds);
  } catch (e) {
    return invalid(e instanceof Error ? e.message : "Error al asignar categorias.");
  }

  return { ok: true };
}

export async function updateJurado(
  id: string,
  input: {
    nombre: string;
    email: string | null;
    activo: boolean;
    categoriaIds: string[];
  },
): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;
  if (!input.nombre) return invalid("El nombre es obligatorio.");
  const email = input.email?.trim().toLowerCase() || null;

  if (!isSupabaseConfigured()) {
    const item = mockJurados.find((j) => j.id === id);
    if (!item) return invalid("Jurado no encontrado.");
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
    return { ok: true };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("jurados")
    .update({ nombre: input.nombre, email, activo: input.activo })
    .eq("id", id);

  if (error) return invalid(error.message);

  try {
    await syncJuradoCategorias(id, input.categoriaIds);
  } catch (e) {
    return invalid(e instanceof Error ? e.message : "Error al asignar categorias.");
  }

  return { ok: true };
}

export async function deleteJurado(id: string): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    const idx = mockJurados.findIndex((j) => j.id === id);
    if (idx === -1) return invalid("Jurado no encontrado.");
    mockJurados.splice(idx, 1);
    for (let i = mockJuradoCategorias.length - 1; i >= 0; i--) {
      if (mockJuradoCategorias[i].juradoId === id) {
        mockJuradoCategorias.splice(i, 1);
      }
    }
    return { ok: true };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("jurados").delete().eq("id", id);
  return error ? invalid(error.message) : { ok: true };
}

// --- Categorias ---

export async function createCategoria(input: {
  concursoId: string;
  nombre: string;
  descripcion: string | null;
  pesoTotal: number;
  orden: number;
}): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;
  if (!input.nombre) return invalid("El nombre es obligatorio.");

  if (!isSupabaseConfigured()) {
    mockCategorias.push({
      id: crypto.randomUUID(),
      concursoId: input.concursoId || MOCK_CONCURSO_ID,
      nombre: input.nombre,
      descripcion: input.descripcion,
      pesoTotal: input.pesoTotal,
      orden: input.orden,
    });
    return { ok: true };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("categorias").insert({
    concurso_id: input.concursoId,
    nombre: input.nombre,
    descripcion: input.descripcion,
    peso_total: input.pesoTotal,
    orden: input.orden,
  });

  return error ? invalid(error.message) : { ok: true };
}

export async function updateCategoria(
  id: string,
  input: {
    nombre: string;
    descripcion: string | null;
    pesoTotal: number;
    orden: number;
  },
): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;
  if (!input.nombre) return invalid("El nombre es obligatorio.");

  if (!isSupabaseConfigured()) {
    const item = mockCategorias.find((c) => c.id === id);
    if (!item) return invalid("Categoria no encontrada.");
    item.nombre = input.nombre;
    item.descripcion = input.descripcion;
    item.pesoTotal = input.pesoTotal;
    item.orden = input.orden;
    return { ok: true };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("categorias")
    .update({
      nombre: input.nombre,
      descripcion: input.descripcion,
      peso_total: input.pesoTotal,
      orden: input.orden,
    })
    .eq("id", id);

  return error ? invalid(error.message) : { ok: true };
}

export async function deleteCategoria(id: string): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    const idx = mockCategorias.findIndex((c) => c.id === id);
    if (idx === -1) return invalid("Categoria no encontrada.");
    mockCategorias.splice(idx, 1);
    for (let i = mockCriterios.length - 1; i >= 0; i--) {
      if (mockCriterios[i].categoriaId === id) mockCriterios.splice(i, 1);
    }
    for (let i = mockJuradoCategorias.length - 1; i >= 0; i--) {
      if (mockJuradoCategorias[i].categoriaId === id) {
        mockJuradoCategorias.splice(i, 1);
      }
    }
    return { ok: true };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("categorias").delete().eq("id", id);
  return error ? invalid(error.message) : { ok: true };
}

// --- Criterios ---

export async function createCriterio(input: {
  categoriaId: string;
  nombre: string;
  descripcion: string | null;
  peso: number;
  orden: number;
}): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;
  if (!input.nombre) return invalid("El nombre es obligatorio.");

  if (!isSupabaseConfigured()) {
    mockCriterios.push({
      id: crypto.randomUUID(),
      categoriaId: input.categoriaId,
      nombre: input.nombre,
      descripcion: input.descripcion,
      peso: input.peso,
      orden: input.orden,
    });
    return { ok: true };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("categoria_criterios").insert({
    categoria_id: input.categoriaId,
    nombre: input.nombre,
    descripcion: input.descripcion,
    peso: input.peso,
    orden: input.orden,
  });

  return error ? invalid(error.message) : { ok: true };
}

export async function updateCriterio(
  id: string,
  input: {
    nombre: string;
    descripcion: string | null;
    peso: number;
    orden: number;
  },
): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;
  if (!input.nombre) return invalid("El nombre es obligatorio.");

  if (!isSupabaseConfigured()) {
    const item = mockCriterios.find((c) => c.id === id);
    if (!item) return invalid("Criterio no encontrado.");
    item.nombre = input.nombre;
    item.descripcion = input.descripcion;
    item.peso = input.peso;
    item.orden = input.orden;
    return { ok: true };
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

  return error ? invalid(error.message) : { ok: true };
}

export async function deleteCriterio(id: string): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;

  if (!isSupabaseConfigured()) {
    const idx = mockCriterios.findIndex((c) => c.id === id);
    if (idx === -1) return invalid("Criterio no encontrado.");
    mockCriterios.splice(idx, 1);
    return { ok: true };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("categoria_criterios").delete().eq("id", id);
  return error ? invalid(error.message) : { ok: true };
}

// --- Admin invites (acceso por email) ---

const mockAdminInvites: { email: string; nombre: string }[] = [];

export async function listAdminInvites(): Promise<{ email: string; nombre: string }[]> {
  const denied = await assertAdmin();
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
}): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return invalid("Ingresa un email valido.");
  }

  if (!isSupabaseConfigured()) {
    if (mockAdminInvites.some((i) => i.email === email)) {
      return invalid("Ese email ya tiene invitacion de admin.");
    }
    mockAdminInvites.push({ email, nombre: input.nombre.trim() || email });
    return { ok: true };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from("admin_invites").insert({
    email,
    nombre: input.nombre.trim() || email.split("@")[0],
  });

  return error ? invalid(error.message) : { ok: true };
}

export async function deleteAdminInvite(email: string): Promise<Result> {
  const denied = await assertAdmin();
  if (denied) return denied;

  const normalized = email.trim().toLowerCase();

  if (!isSupabaseConfigured()) {
    const idx = mockAdminInvites.findIndex((i) => i.email === normalized);
    if (idx === -1) return invalid("Invitacion no encontrada.");
    mockAdminInvites.splice(idx, 1);
    return { ok: true };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("admin_invites")
    .delete()
    .eq("email", normalized);

  return error ? invalid(error.message) : { ok: true };
}
