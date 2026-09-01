"use client";

import { useEffect, useState } from "react";
import { loadCalificacionesAction } from "@/app/jurado/actions";
import { ScoringForm } from "@/components/jurado/ScoringForm";
import { ParticipanteTile } from "@/components/participantes/EscudoParticipante";
import type { Calificacion, ConcursoCompleto } from "@/types/certamen";
type JuradoPageClientProps = {
  concurso: ConcursoCompleto;
  calificaciones: Calificacion[];
  juradoId: string;
  juradoNombre: string;
  demoMode?: boolean;
};

function choiceClass(active: boolean) {
  return active ? "btn-choice btn-choice-active" : "btn-choice";
}

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

      <div className="card-panel space-y-6 p-5">
        <div>
          <p className="text-label">1. Tuna participante</p>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-6 sm:overflow-visible">
            {concurso.participantes.map((p) => (
              <ParticipanteTile
                key={p.id}
                nombre={p.nombre}
                escudoUrl={p.escudoUrl}
                orden={p.orden}
                active={participanteId === p.id}
                onClick={() => {
                  setParticipanteId(p.id);
                  setCategoriaId("");
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-label">2. Categoria</p>
          {!participanteId ? (
            <p className="mt-2 text-sm text-text-muted">
              Primero elige una tuna participante.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {categoriasAsignadas.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaId(cat.id)}
                  className={choiceClass(categoriaId === cat.id)}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          )}
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
        <div className="rounded-lg border border-dashed border-border bg-card/60 px-5 py-8 text-center text-sm text-text-muted">
          Selecciona una tuna y una categoria para comenzar a calificar.
        </div>
      )}
    </div>
  );
}
