"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createCategoriaAction,
  createCriterioAction,
  deleteCategoriaAction,
  deleteCriterioAction,
  updateCategoriaAction,
  updateCriterioAction,
} from "@/app/admin/actions";
import type { CategoriaConCriterios, CategoriaCriterio } from "@/types/certamen";

type CategoriasAdminClientProps = {
  concursoId: string;
  categorias: CategoriaConCriterios[];
};

type CategoriaForm = {
  nombre: string;
  descripcion: string;
  pesoTotal: string;
  orden: string;
};

type CriterioForm = {
  nombre: string;
  descripcion: string;
  peso: string;
  orden: string;
};

const emptyCategoria: CategoriaForm = {
  nombre: "",
  descripcion: "",
  pesoTotal: "0.2",
  orden: "",
};

const emptyCriterio: CriterioForm = {
  nombre: "",
  descripcion: "",
  peso: "0.33",
  orden: "",
};

export function CategoriasAdminClient({
  concursoId,
  categorias,
}: CategoriasAdminClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState<CategoriaForm>(emptyCategoria);
  const [editingCritId, setEditingCritId] = useState<string | null>(null);
  const [critForm, setCritForm] = useState<CriterioForm>(emptyCriterio);
  const [activeCategoriaId, setActiveCategoriaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function resetCatForm() {
    setEditingCatId(null);
    setCatForm(emptyCategoria);
    setError(null);
  }

  function startEditCategoria(cat: CategoriaConCriterios) {
    setEditingCatId(cat.id);
    setCatForm({
      nombre: cat.nombre,
      descripcion: cat.descripcion ?? "",
      pesoTotal: String(cat.pesoTotal),
      orden: String(cat.orden),
    });
    setError(null);
  }

  function resetCritForm() {
    setEditingCritId(null);
    setCritForm(emptyCriterio);
    setActiveCategoriaId(null);
    setError(null);
  }

  function startEditCriterio(crit: CategoriaCriterio, categoriaId: string) {
    setEditingCritId(crit.id);
    setActiveCategoriaId(categoriaId);
    setCritForm({
      nombre: crit.nombre,
      descripcion: crit.descripcion ?? "",
      peso: String(crit.peso),
      orden: String(crit.orden),
    });
    setError(null);
  }

  function startNewCriterio(categoriaId: string) {
    setEditingCritId(null);
    setActiveCategoriaId(categoriaId);
    setCritForm(emptyCriterio);
    setError(null);
  }

  function handleCategoriaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set("nombre", catForm.nombre);
    fd.set("descripcion", catForm.descripcion);
    fd.set("pesoTotal", catForm.pesoTotal);
    fd.set("orden", catForm.orden || "0");

    startTransition(async () => {
      const result = editingCatId
        ? await updateCategoriaAction((fd.set("id", editingCatId), fd))
        : await createCategoriaAction((fd.set("concursoId", concursoId), fd));

      if (result.ok) {
        resetCatForm();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleCriterioSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCategoriaId) return;
    setError(null);

    const fd = new FormData();
    fd.set("nombre", critForm.nombre);
    fd.set("descripcion", critForm.descripcion);
    fd.set("peso", critForm.peso);
    fd.set("orden", critForm.orden || "0");

    startTransition(async () => {
      const result = editingCritId
        ? await updateCriterioAction((fd.set("id", editingCritId), fd))
        : await createCriterioAction((fd.set("categoriaId", activeCategoriaId), fd));

      if (result.ok) {
        resetCritForm();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDeleteCategoria(id: string, nombre: string) {
    if (!confirm(`Eliminar "${nombre}"? Se borraran criterios y calificaciones.`)) return;

    startTransition(async () => {
      const result = await deleteCategoriaAction(id);
      if (result.ok) {
        if (editingCatId === id) resetCatForm();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDeleteCriterio(id: string, nombre: string) {
    if (!confirm(`Eliminar criterio "${nombre}"?`)) return;

    startTransition(async () => {
      const result = await deleteCriterioAction(id);
      if (result.ok) {
        if (editingCritId === id) resetCritForm();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCategoriaSubmit} className="card-panel space-y-4 p-5">
        <h3 className="text-base font-bold">
          {editingCatId ? "Editar categoria" : "Nueva categoria"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-label">Nombre</label>
            <input
              value={catForm.nombre}
              onChange={(e) => setCatForm((f) => ({ ...f, nombre: e.target.value }))}
              required
              className="input-field mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-label">Descripcion</label>
            <textarea
              value={catForm.descripcion}
              onChange={(e) => setCatForm((f) => ({ ...f, descripcion: e.target.value }))}
              rows={2}
              className="input-field mt-1.5"
            />
          </div>
          <div>
            <label className="text-label">Peso total (0–1)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={catForm.pesoTotal}
              onChange={(e) => setCatForm((f) => ({ ...f, pesoTotal: e.target.value }))}
              className="input-field mt-1.5"
            />
          </div>
          <div>
            <label className="text-label">Orden</label>
            <input
              type="number"
              min={1}
              value={catForm.orden}
              onChange={(e) => setCatForm((f) => ({ ...f, orden: e.target.value }))}
              className="input-field mt-1.5"
            />
          </div>
        </div>
        {error && !activeCategoriaId ? (
          <p className="rounded-xl bg-coral-soft px-3 py-2 text-sm text-coral">{error}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Guardando..." : editingCatId ? "Actualizar" : "Crear"}
          </button>
          {editingCatId ? (
            <button type="button" onClick={resetCatForm} className="btn-secondary" disabled={pending}>
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="space-y-4">
        {categorias.map((cat) => (
          <div key={cat.id} className="card-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{cat.nombre}</h3>
                <p className="text-sm text-text-muted">{cat.descripcion}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="status-pill bg-brand-soft text-text">
                  Peso: {(cat.pesoTotal * 100).toFixed(0)}%
                </span>
                <button
                  type="button"
                  onClick={() => startEditCategoria(cat)}
                  className="btn-secondary px-3 py-1.5 text-xs"
                  disabled={pending}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategoria(cat.id, cat.nombre)}
                  className="rounded-md border border-coral/30 bg-coral-soft px-3 py-1.5 text-xs font-semibold text-coral transition hover:bg-coral/10 disabled:opacity-60"
                  disabled={pending}
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-label">Criterios</p>
                <button
                  type="button"
                  onClick={() => startNewCriterio(cat.id)}
                  className="text-xs font-semibold text-unac-blue hover:underline"
                  disabled={pending}
                >
                  + Nuevo criterio
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {cat.criterios.map((crit) => (
                  <div key={crit.id} className="rounded-xl bg-page-bg px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="font-medium">{crit.nombre}</span>
                        {crit.descripcion ? (
                          <p className="mt-1 text-xs text-text-muted">{crit.descripcion}</p>
                        ) : null}
                        <p className="mt-1 text-caption">
                          Peso: {(crit.peso * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditCriterio(crit, cat.id)}
                          className="btn-secondary px-3 py-1.5 text-xs"
                          disabled={pending}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCriterio(crit.id, crit.nombre)}
                          className="rounded-md border border-coral/30 bg-coral-soft px-3 py-1.5 text-xs font-semibold text-coral transition hover:bg-coral/10 disabled:opacity-60"
                          disabled={pending}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {activeCategoriaId === cat.id ? (
              <form onSubmit={handleCriterioSubmit} className="mt-4 space-y-3 rounded-xl border border-border bg-white p-4">
                <h4 className="text-sm font-bold">
                  {editingCritId ? "Editar criterio" : "Nuevo criterio"}
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-label">Nombre</label>
                    <input
                      value={critForm.nombre}
                      onChange={(e) => setCritForm((f) => ({ ...f, nombre: e.target.value }))}
                      required
                      className="input-field mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-label">Descripcion</label>
                    <input
                      value={critForm.descripcion}
                      onChange={(e) => setCritForm((f) => ({ ...f, descripcion: e.target.value }))}
                      className="input-field mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-label">Peso (0–1)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={critForm.peso}
                      onChange={(e) => setCritForm((f) => ({ ...f, peso: e.target.value }))}
                      className="input-field mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-label">Orden</label>
                    <input
                      type="number"
                      min={1}
                      value={critForm.orden}
                      onChange={(e) => setCritForm((f) => ({ ...f, orden: e.target.value }))}
                      className="input-field mt-1.5"
                    />
                  </div>
                </div>
                {error ? (
                  <p className="rounded-xl bg-coral-soft px-3 py-2 text-sm text-coral">{error}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <button type="submit" disabled={pending} className="btn-primary">
                    {pending ? "Guardando..." : editingCritId ? "Actualizar" : "Crear"}
                  </button>
                  <button type="button" onClick={resetCritForm} className="btn-secondary" disabled={pending}>
                    Cancelar
                  </button>
                </div>
              </form>
            ) : null}

            <div className="mt-4">
              <p className="text-label">Jurados asignados</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {cat.jurados.map((j) => (
                  <span key={j.id} className="status-pill bg-blue-soft text-blue">
                    {j.nombre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
