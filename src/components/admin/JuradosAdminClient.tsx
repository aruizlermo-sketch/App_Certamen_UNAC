"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createJuradoAction,
  deleteJuradoAction,
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
  activo: boolean;
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
    activo: true,
    categoriaIds: [],
  });
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setEditingId(null);
    setForm({ nombre: "", activo: true, categoriaIds: [] });
    setError(null);
  }

  function startEdit(j: Jurado) {
    const cat = categorias.filter((c) => c.jurados.some((jj) => jj.id === j.id));
    setEditingId(j.id);
    setForm({
      nombre: j.nombre,
      activo: j.activo,
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
    fd.set("activo", form.activo ? "true" : "false");
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
            className="h-4 w-4 rounded border-border"
          />
          Jurado activo
        </label>
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
                  <span
                    className={`status-pill mt-2 ${
                      j.activo ? "bg-green-soft text-green" : "bg-coral-soft text-coral"
                    }`}
                  >
                    {j.activo ? "Activo" : "Inactivo"}
                  </span>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
