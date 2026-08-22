"use server";

import { revalidatePath } from "next/cache";
import { getAppSession } from "@/lib/auth/session";
import {
  createCategoria,
  createCriterio,
  createJurado,
  createParticipante,
  createAdminInvite,
  deleteAdminInvite,
  deleteCategoria,
  deleteCriterio,
  deleteJurado,
  deleteParticipante,
  resetJuradoLink,
  updateCategoria,
  updateCriterio,
  updateJurado,
  updateParticipante,
} from "@/lib/certamen/admin-service";

type ActionResult = { ok: true } | { ok: false; error: string };

async function guardAdmin(): Promise<ActionResult | null> {
  const session = await getAppSession();
  if (!session.isDemo && session.rol !== "admin") {
    return { ok: false, error: "No autorizado." };
  }
  return null;
}

function revalidateAdminPaths() {
  revalidatePath("/admin/participantes");
  revalidatePath("/admin/jurados");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/usuarios");
  revalidatePath("/");
  revalidatePath("/jurado");
  revalidatePath("/resultados");
  revalidatePath("/resultados/notas");
}

export async function createParticipanteAction(formData: FormData): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await createParticipante({
    concursoId: String(formData.get("concursoId") ?? ""),
    nombre: String(formData.get("nombre") ?? "").trim(),
    orden: Number(formData.get("orden") ?? 0),
  });

  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function updateParticipanteAction(formData: FormData): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await updateParticipante(String(formData.get("id") ?? ""), {
    nombre: String(formData.get("nombre") ?? "").trim(),
    orden: Number(formData.get("orden") ?? 0),
  });

  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function deleteParticipanteAction(id: string): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await deleteParticipante(id);
  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function createJuradoAction(formData: FormData): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const categoriaIds = formData.getAll("categoriaIds").map(String);

  const result = await createJurado({
    concursoId: String(formData.get("concursoId") ?? ""),
    nombre: String(formData.get("nombre") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim() || null,
    activo: formData.get("activo") !== "false",
    esPresidente: formData.get("esPresidente") === "true",
    categoriaIds,
  });

  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function updateJuradoAction(formData: FormData): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const categoriaIds = formData.getAll("categoriaIds").map(String);

  const result = await updateJurado(String(formData.get("id") ?? ""), {
    nombre: String(formData.get("nombre") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim() || null,
    activo: formData.get("activo") !== "false",
    esPresidente: formData.get("esPresidente") === "true",
    categoriaIds,
  });

  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function deleteJuradoAction(id: string): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await deleteJurado(id);
  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function resetJuradoLinkAction(id: string): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await resetJuradoLink(id);
  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function createCategoriaAction(formData: FormData): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await createCategoria({
    concursoId: String(formData.get("concursoId") ?? ""),
    nombre: String(formData.get("nombre") ?? "").trim(),
    descripcion: String(formData.get("descripcion") ?? "").trim() || null,
    pesoTotal: Number(formData.get("pesoTotal") ?? 0.2),
    orden: Number(formData.get("orden") ?? 0),
  });

  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function updateCategoriaAction(formData: FormData): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await updateCategoria(String(formData.get("id") ?? ""), {
    nombre: String(formData.get("nombre") ?? "").trim(),
    descripcion: String(formData.get("descripcion") ?? "").trim() || null,
    pesoTotal: Number(formData.get("pesoTotal") ?? 0.2),
    orden: Number(formData.get("orden") ?? 0),
  });

  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function deleteCategoriaAction(id: string): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await deleteCategoria(id);
  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function createCriterioAction(formData: FormData): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await createCriterio({
    categoriaId: String(formData.get("categoriaId") ?? ""),
    nombre: String(formData.get("nombre") ?? "").trim(),
    descripcion: String(formData.get("descripcion") ?? "").trim() || null,
    peso: Number(formData.get("peso") ?? 0),
    orden: Number(formData.get("orden") ?? 0),
  });

  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function updateCriterioAction(formData: FormData): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await updateCriterio(String(formData.get("id") ?? ""), {
    nombre: String(formData.get("nombre") ?? "").trim(),
    descripcion: String(formData.get("descripcion") ?? "").trim() || null,
    peso: Number(formData.get("peso") ?? 0),
    orden: Number(formData.get("orden") ?? 0),
  });

  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function deleteCriterioAction(id: string): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await deleteCriterio(id);
  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function createAdminInviteAction(formData: FormData): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await createAdminInvite({
    email: String(formData.get("email") ?? ""),
    nombre: String(formData.get("nombre") ?? ""),
  });

  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}

export async function deleteAdminInviteAction(email: string): Promise<ActionResult> {
  const denied = await guardAdmin();
  if (denied) return denied;

  const result = await deleteAdminInvite(email);
  if (result.ok) revalidateAdminPaths();
  return result.ok ? { ok: true } : result;
}
