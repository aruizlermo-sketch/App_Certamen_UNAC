"use client";

import { useEffect, useState } from "react";
import { loadCalificacionesAction } from "@/app/jurado/actions";
import { ScoringForm } from "@/components/jurado/ScoringForm";
import type { Calificacion, ConcursoCompleto } from "@/types/certamen";

type JuradoPageClientProps = {
  concurso: ConcursoCompleto;
  calificaciones: Calificacion[];
  juradoId: string;
  juradoNombre: string;
  demoMode?: boolean;
};

export function JuradoPageClient({
  concurso,
  calificaciones: initialCalificaciones,
  juradoId,
  juradoNombre,
  demoMode = false,
}: JuradoPageClientProps) {
  const categoriasAsignadas = concurso.categorias.filter((cat) =>
    cat.jurados.some((j) => j.id === juradoId),
  );

  const [participanteId, setParticipanteId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [calificaciones, setCalificaciones] = useState(initialCalificaciones);

  useEffect(() => {
    if (demoMode) {
      loadCalificacionesAction(juradoId).then(setCalificaciones);
    } else {
      setCalificaciones(initialCalificaciones);
    }
  }, [demoMode, juradoId, initialCalificaciones]);

  const participante = concurso.participantes.find((p) => p.id === participanteId);
  const categoria = categoriasAsignadas.find((c) => c.id === categoriaId);

  if (categoriasAsignadas.length === 0) {
    return (
      <div className="card-panel p-6 text-center">
        <p className="text-text-muted">
          No tienes categorias asignadas como jurado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="section-heading">
        <p className="section-eyebrow">Jurado: {juradoNombre}</p>
        <h2 className="section-title">Calificacion</h2>
        <p className="mt-1 text-sm text-text-muted">
          Solo puedes ver y editar tus propias notas.
        </p>
      </div>

      <div className="card-panel p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="participante-select" className="text-label">
              1. Tuna participante
            </label>
            <select
              id="participante-select"
              value={participanteId}
              onChange={(e) => {
                setParticipanteId(e.target.value);
                setCategoriaId("");
              }}
              className="combobox mt-2"
            >
              <option value="">— Selecciona una tuna —</option>
              {concurso.participantes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="categoria-select" className="text-label">
              2. Categoria
            </label>
            <select
              id="categoria-select"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              disabled={!participanteId}
              className="combobox mt-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {participanteId
                  ? "— Selecciona una categoria —"
                  : "— Primero elige una tuna —"}
              </option>
              {categoriasAsignadas.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {participante && categoria ? (
        <div className="card-panel p-5">
          <p className="mb-4 text-label">3. Ingresa las notas por criterio</p>
          <ScoringForm
            concurso={concurso}
            categoria={categoria}
            participante={participante}
            juradoId={juradoId}
            calificaciones={calificaciones}
            onSaved={() => {
              if (demoMode) {
                loadCalificacionesAction(juradoId).then(setCalificaciones);
              }
            }}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-white/60 px-5 py-8 text-center text-sm text-text-muted">
          Selecciona una tuna y una categoria para comenzar a calificar.
        </div>
      )}
    </div>
  );
}
