"use client";

import { useState } from "react";
import { JuradoPageClient } from "@/components/jurado/JuradoPageClient";
import type { ConcursoCompleto, Jurado } from "@/types/certamen";

type JuradoSelectorProps = {
  concurso: ConcursoCompleto;
  jurados: Jurado[];
};

export function JuradoSelector({ concurso, jurados }: JuradoSelectorProps) {
  const [juradoId, setJuradoId] = useState(jurados[0]?.id ?? "");

  const jurado = jurados.find((j) => j.id === juradoId);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-soft bg-blue-soft px-4 py-3 text-sm text-unac-navy">
        <strong>Modo demo:</strong> simula un jurado. En produccion cada
        jurado solo ve y edita sus propias notas.
      </div>

      <div>
        <label htmlFor="jurado-select" className="text-label">
          Simular jurado
        </label>
        <select
          id="jurado-select"
          value={juradoId}
          onChange={(e) => setJuradoId(e.target.value)}
          className="combobox mt-1.5 max-w-md"
        >
          {jurados.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nombre}
            </option>
          ))}
        </select>
      </div>

      {jurado ? (
        <JuradoPageClient
          concurso={concurso}
          calificaciones={[]}
          juradoId={jurado.id}
          juradoNombre={jurado.nombre}
          demoMode
        />
      ) : null}
    </div>
  );
}
