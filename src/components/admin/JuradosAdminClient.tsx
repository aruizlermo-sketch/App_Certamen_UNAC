"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createJuradoAction,
  deleteJuradoAction,
  resetJuradoLinkAction,
  updateJuradoAction,
} from "@/app/admin/actions";
import type { CategoriaConCriterios, Jurado } from "@/types/certamen";

type JuradosAdminClientProps = {
  concursoId: string;
  jurados: Jurado[];
  categorias: CategoriaConCriterios[];
};

type FormState = {
  nombre: string;
  email: string;
  activo: boolean;
  esPresidente: boolean;
  categoriaIds: string[];
};

function choiceClass(active: boolean) {
  return active ? "btn-choice btn-choice-active" : "btn-choice";
}

export function JuradosAdminClient({
  concursoId,
  jurados,
  categorias,
}: JuradosAdminClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    nombre: "",
    email: "",
    activo: true,
    esPresidente: false,
    categoriaIds: [],
  });
  const [error, setError] = useState<string | null>(null);

  const presidenteActual = jurados.find((j) => j.esPresidente);

  function resetForm() {
    setEditingId(null);
    setForm({ nombre: "", email: "", activo: true, esPresidente: false, categoriaIds: [] });
    setError(null);
  }

  function startEdit(j: Jurado) {
    const cat = categorias.filter((c) => c.jurados.some((jj) => jj.id === j.id));
    setEditingId(j.id);
    setForm({
      nombre: j.nombre,
      email: j.email ?? "",
      activo: j.activo,
      esPresidente: j.esPresidente,
      categoriaIds: cat.map((c) => c.id),
    });
    setError(null);
  }

  function toggleCategoria(categoriaId: string) {
    setForm((f) => ({
      ...f,
      categoriaIds: f.categoriaIds.includes(categoriaId)
        ? f.categoriaIds.filter((id) => id !== categoriaId)
        : [...f.categoriaIds, categoriaId],
    }));
  }

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set("nombre", form.nombre);
    fd.set("email", form.email);
    fd.set("activo", form.activo ? "true" : "false");
    fd.set("esPresidente", form.esPresidente ? "true" : "false");
    for (const id of form.categoriaIds) {
      fd.append("categoriaIds", id);
    }
    return fd;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const fd = buildFormData();
      const result = editingId
        ? await updateJuradoAction((fd.set("id", editingId), fd))
        : await createJuradoAction((fd.set("concursoId", concursoId), fd));

      if (result.ok) {
        resetForm();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDelete(id: string, nombre: string) {
    if (!confirm(`Eliminar "${nombre}"? Se borraran sus calificaciones.`)) return;

    startTransition(async () => {
      const result = await deleteJuradoAction(id);
      if (result.ok) {
        if (editingId === id) resetForm();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleResetLink(id: string, nombre: string) {
    if (
      !confirm(
        `Resetear vinculo de "${nombre}"? El jurado debera volver a entrar con Google o email para vincularse.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await resetJuradoLinkAction(id);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card-panel space-y-4 p-5">
        <h3 className="text-base font-bold">
          {editingId ? "Editar jurado" : "Nuevo jurado"}
        </h3>
        <div>
          <label htmlFor="jur-nombre" className="text-label">
            Nombre
          </label>
          <input
            id="jur-nombre"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            required
            className="input-field mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="jur-email" className="text-label">
            Email de acceso
          </label>
          <input
            id="jur-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="input-field mt-1.5"
            placeholder="jurado@unac.edu.pe"
          />
          <p className="mt-1 text-xs text-text-muted">
            Al iniciar sesion con este correo, se vincula automaticamente al jurado.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
            className="h-4 w-4 rounded border-border"
          />
          Jurado activo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.esPresidente}
            onChange={(e) => setForm((f) => ({ ...f, esPresidente: e.target.checked }))}
            className="h-4 w-4 rounded border-border"
          />
          Presidente del jurado (solo uno por concurso)
        </label>
        {form.esPresidente && presidenteActual && presidenteActual.id !== editingId ? (
          <p className="text-xs text-amber-900 rounded-lg bg-amber-soft px-3 py-2">
            Reemplazara a <strong>{presidenteActual.nombre}</strong> como presidente.
          </p>
        ) : null}
        <div>
          <p className="text-label">Categorias asignadas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategoria(cat.id)}
                className={choiceClass(form.categoriaIds.includes(cat.id))}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
        {error ? (
          <p className="rounded-xl bg-coral-soft px-3 py-2 text-sm text-coral">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="btn-secondary" disabled={pending}>
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {jurados.map((j) => {
          const assigned = categorias.filter((cat) =>
            cat.jurados.some((jj) => jj.id === j.id),
          );

          return (
            <div key={j.id} className="card-panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold">{j.nombre}</h3>
                  {j.email ? (
                    <p className="mt-1 text-sm text-text-muted">{j.email}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`status-pill ${
                        j.activo ? "bg-green-soft text-green" : "bg-coral-soft text-coral"
                      }`}
                    >
                      {j.activo ? "Activo" : "Inactivo"}
                    </span>
                    <span
                      className={`status-pill ${
                        j.userId ? "bg-blue-soft text-unac-blue" : "bg-page-bg text-text-muted"
                      }`}
                    >
                      {j.userId ? "Cuenta vinculada" : "Sin vincular"}
                    </span>
                    {j.esPresidente ? (
                      <span className="status-pill bg-brand-soft text-unac-navy-dark">
                        Presidente
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(j)}
                    className="btn-secondary px-3 py-1.5 text-xs"
                    disabled={pending}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(j.id, j.nombre)}
                    className="rounded-md border border-coral/30 bg-coral-soft px-3 py-1.5 text-xs font-semibold text-coral transition hover:bg-coral/10 disabled:opacity-60"
                    disabled={pending}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <p className="mt-3 text-caption">Categorias asignadas:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {assigned.length > 0 ? (
                  assigned.map((cat) => (
                    <span key={cat.id} className="status-pill bg-brand-soft text-text">
                      {cat.nombre}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-text-muted">Sin categorias</span>
                )}
              </div>
              {j.userId ? (
                <button
                  type="button"
                  onClick={() => handleResetLink(j.id, j.nombre)}
                  className="mt-4 text-xs font-semibold text-text-muted underline-offset-2 hover:text-unac-blue hover:underline disabled:opacity-60"
                  disabled={pending}
                >
                  Resetear vinculo de cuenta
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
