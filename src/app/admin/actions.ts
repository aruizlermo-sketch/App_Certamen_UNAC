"use server";

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
import { revalidateAdminPaths } from "@/lib/revalidate-paths";
import type { VoidResult } from "@/lib/result";

async function runAdminMutation(
  fn: () => Promise<VoidResult>,
): Promise<VoidResult> {
  const result = await fn();
  if (result.ok) revalidateAdminPaths();
  return result;
}

export async function createParticipanteAction(
  formData: FormData,
): Promise<VoidResult> {
  return runAdminMutation(() =>
    createParticipante({
      concursoId: String(formData.get("concursoId") ?? ""),
      nombre: String(formData.get("nombre") ?? "").trim(),
      orden: Number(formData.get("orden") ?? 0),
    }),
  );
}

export async function updateParticipanteAction(
  formData: FormData,
): Promise<VoidResult> {
  return runAdminMutation(() =>
    updateParticipante(String(formData.get("id") ?? ""), {
      nombre: String(formData.get("nombre") ?? "").trim(),
      orden: Number(formData.get("orden") ?? 0),
    }),
  );
}

export async function deleteParticipanteAction(id: string): Promise<VoidResult> {
  return runAdminMutation(() => deleteParticipante(id));
}

export async function createJuradoAction(formData: FormData): Promise<VoidResult> {
  const categoriaIds = formData.getAll("categoriaIds").map(String);

  return runAdminMutation(() =>
    createJurado({
      concursoId: String(formData.get("concursoId") ?? ""),
      nombre: String(formData.get("nombre") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || null,
      activo: formData.get("activo") !== "false",
      esPresidente: formData.get("esPresidente") === "true",
      categoriaIds,
    }),
  );
}

export async function updateJuradoAction(formData: FormData): Promise<VoidResult> {
  const categoriaIds = formData.getAll("categoriaIds").map(String);

  return runAdminMutation(() =>
    updateJurado(String(formData.get("id") ?? ""), {
      nombre: String(formData.get("nombre") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || null,
      activo: formData.get("activo") !== "false",
      esPresidente: formData.get("esPresidente") === "true",
      categoriaIds,
    }),
  );
}

export async function deleteJuradoAction(id: string): Promise<VoidResult> {
  return runAdminMutation(() => deleteJurado(id));
}

export async function resetJuradoLinkAction(id: string): Promise<VoidResult> {
  return runAdminMutation(() => resetJuradoLink(id));
}

export async function createCategoriaAction(formData: FormData): Promise<VoidResult> {
  return runAdminMutation(() =>
    createCategoria({
      concursoId: String(formData.get("concursoId") ?? ""),
      nombre: String(formData.get("nombre") ?? "").trim(),
      descripcion: String(formData.get("descripcion") ?? "").trim() || null,
      pesoTotal: Number(formData.get("pesoTotal") ?? 0.2),
      orden: Number(formData.get("orden") ?? 0),
    }),
  );
}

export async function updateCategoriaAction(formData: FormData): Promise<VoidResult> {
  return runAdminMutation(() =>
    updateCategoria(String(formData.get("id") ?? ""), {
      nombre: String(formData.get("nombre") ?? "").trim(),
      descripcion: String(formData.get("descripcion") ?? "").trim() || null,
      pesoTotal: Number(formData.get("pesoTotal") ?? 0.2),
      orden: Number(formData.get("orden") ?? 0),
    }),
  );
}

export async function deleteCategoriaAction(id: string): Promise<VoidResult> {
  return runAdminMutation(() => deleteCategoria(id));
}

export async function createCriterioAction(formData: FormData): Promise<VoidResult> {
  return runAdminMutation(() =>
    createCriterio({
      categoriaId: String(formData.get("categoriaId") ?? ""),
      nombre: String(formData.get("nombre") ?? "").trim(),
      descripcion: String(formData.get("descripcion") ?? "").trim() || null,
      peso: Number(formData.get("peso") ?? 0),
      orden: Number(formData.get("orden") ?? 0),
    }),
  );
}

export async function updateCriterioAction(formData: FormData): Promise<VoidResult> {
  return runAdminMutation(() =>
    updateCriterio(String(formData.get("id") ?? ""), {
      nombre: String(formData.get("nombre") ?? "").trim(),
      descripcion: String(formData.get("descripcion") ?? "").trim() || null,
      peso: Number(formData.get("peso") ?? 0),
      orden: Number(formData.get("orden") ?? 0),
    }),
  );
}

export async function deleteCriterioAction(id: string): Promise<VoidResult> {
  return runAdminMutation(() => deleteCriterio(id));
}

export async function createAdminInviteAction(formData: FormData): Promise<VoidResult> {
  return runAdminMutation(() =>
    createAdminInvite({
      email: String(formData.get("email") ?? ""),
      nombre: String(formData.get("nombre") ?? ""),
    }),
  );
}

export async function deleteAdminInviteAction(email: string): Promise<VoidResult> {
  return runAdminMutation(() => deleteAdminInvite(email));
}
