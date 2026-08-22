"use client";

import { useState } from "react";
import { JuradoPageClient } from "@/components/jurado/JuradoPageClient";
import type { Calificacion, ConcursoCompleto, Jurado } from "@/types/certamen";

type JuradoSelectorProps = {
  concurso: ConcursoCompleto;
  jurados: Jurado[];
  calificaciones?: Calificacion[];
  adminMode?: boolean;
};

function choiceClass(active: boolean) {
  return active ? "btn-choice btn-choice-active" : "btn-choice";
}

export function JuradoSelector({
  concurso,
  jurados,
  calificaciones = [],
  adminMode = false,
}: JuradoSelectorProps) {
  const [juradoId, setJuradoId] = useState(jurados[0]?.id ?? "");

  const jurado = jurados.find((j) => j.id === juradoId);
  const demoMode = !adminMode;

  return (
    <div className="space-y-6">
      <div
        className={`rounded-xl px-4 py-3 text-sm ${
          adminMode
            ? "border border-blue-soft bg-blue-soft text-text"
            : "border border-amber-soft bg-amber-soft text-amber-900"
        }`}
      >
        {adminMode ? (
          <>
            <strong>Vista general:</strong> selecciona un jurado para ver o
            editar sus calificaciones.
          </>
        ) : (
          <>
            <strong>Modo demo:</strong> simula un jurado. En produccion cada
            jurado solo ve y edita sus propias notas.
          </>
        )}
      </div>

      <div>
        <p className="text-label">Jurado</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {jurados.map((j) => (
            <button
              key={j.id}
              type="button"
              onClick={() => setJuradoId(j.id)}
              className={choiceClass(juradoId === j.id)}
            >
              {j.nombre}
            </button>
          ))}
        </div>
      </div>

      {jurado ? (
        <JuradoPageClient
          concurso={concurso}
          calificaciones={calificaciones}
          juradoId={jurado.id}
          juradoNombre={jurado.nombre}
          demoMode={demoMode}
        />
      ) : null}
    </div>
  );
}
