"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createParticipanteAction,
  deleteParticipanteAction,
  updateParticipanteAction,
} from "@/app/admin/actions";
import type { Participante } from "@/types/certamen";

type ParticipantesAdminClientProps = {
  concursoId: string;
  participantes: Participante[];
};

type FormState = {
  nombre: string;
  orden: string;
};

const emptyForm: FormState = { nombre: "", orden: "" };

export function ParticipantesAdminClient({
  concursoId,
  participantes,
}: ParticipantesAdminClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  function startEdit(p: Participante) {
    setEditingId(p.id);
    setForm({ nombre: p.nombre, orden: String(p.orden) });
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set("nombre", form.nombre);
    fd.set("orden", form.orden || "0");

    startTransition(async () => {
      const result = editingId
        ? await updateParticipanteAction(
            (() => {
              fd.set("id", editingId);
              return fd;
            })(),
          )
        : await createParticipanteAction(
            (() => {
              fd.set("concursoId", concursoId);
              return fd;
            })(),
          );

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
      const result = await deleteParticipanteAction(id);
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
          {editingId ? "Editar participante" : "Nuevo participante"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <div>
            <label htmlFor="part-nombre" className="text-label">
              Nombre de la tuna
            </label>
            <input
              id="part-nombre"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              required
              className="input-field mt-1.5"
              placeholder="Tuna Universidad..."
            />
          </div>
          <div>
            <label htmlFor="part-orden" className="text-label">
              Orden N°
            </label>
            <input
              id="part-orden"
              type="number"
              min={1}
              value={form.orden}
              onChange={(e) => setForm((f) => ({ ...f, orden: e.target.value }))}
              className="input-field mt-1.5"
            />
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
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary"
              disabled={pending}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-page-bg">
              <th className="px-4 py-3 text-left">N°</th>
              <th className="px-4 py-3 text-left">Tuna</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {participantes.map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="px-4 py-3">{p.orden}</td>
                <td className="px-4 py-3 font-medium">{p.nombre}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="btn-secondary px-3 py-1.5 text-xs"
                      disabled={pending}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.nombre)}
                      className="rounded-md border border-coral/30 bg-coral-soft px-3 py-1.5 text-xs font-semibold text-coral transition hover:bg-coral/10 disabled:opacity-60"
                      disabled={pending}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
