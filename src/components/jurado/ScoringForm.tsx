"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { saveScoreAction } from "@/app/jurado/actions";
import type {
  Calificacion,
  CategoriaConCriterios,
  Concurso,
  Participante,
} from "@/types/certamen";

type ScoringFormProps = {
  concurso: Concurso;
  categoria: CategoriaConCriterios;
  participante: Participante;
  juradoId: string;
  calificaciones: Calificacion[];
  onSaved?: () => void;
};

function getScore(
  calificaciones: Calificacion[],
  juradoId: string,
  participanteId: string,
  criterioId: string,
): string {
  const found = calificaciones.find(
    (c) =>
      c.juradoId === juradoId &&
      c.participanteId === participanteId &&
      c.categoriaCriterioId === criterioId,
  );
  return found ? String(found.puntaje) : "";
}

function buildScoreOptions(min: number, max: number): string[] {
  const options: string[] = [];
  for (let v = min; v <= max; v += 0.5) {
    options.push(String(Number(v.toFixed(1))));
  }
  return options;
}

export function ScoringForm({
  concurso,
  categoria,
  participante,
  juradoId,
  calificaciones,
  onSaved,
}: ScoringFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const scoreOptions = buildScoreOptions(concurso.escalaMin, concurso.escalaMax);

  const criteriosCompletados = categoria.criterios.filter(
    (crit) =>
      getScore(calificaciones, juradoId, participante.id, crit.id) !== "",
  ).length;

  function handleSave(criterioId: string, value: string) {
    if (!value) return;
    const puntaje = Number(value);
    if (Number.isNaN(puntaje)) return;

    const fd = new FormData();
    fd.set("juradoId", juradoId);
    fd.set("participanteId", participante.id);
    fd.set("categoriaCriterioId", criterioId);
    fd.set("puntaje", String(puntaje));
    fd.set("escalaMin", String(concurso.escalaMin));
    fd.set("escalaMax", String(concurso.escalaMax));

    startTransition(async () => {
      const result = await saveScoreAction(fd);
      if (result.ok) {
        router.refresh();
        onSaved?.();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-caption">Calificando</p>
          <h2 className="text-xl font-bold">{participante.nombre}</h2>
          <p className="mt-0.5 text-sm font-medium text-unac-blue">
            {categoria.nombre}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-pill bg-blue-soft text-unac-blue">
            {criteriosCompletados}/{categoria.criterios.length} criterios
          </span>
          {pending ? (
            <span className="status-pill bg-brand-soft text-text">Guardando...</span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {categoria.criterios.map((crit) => {
          const current = getScore(
            calificaciones,
            juradoId,
            participante.id,
            crit.id,
          );

          return (
            <div
              key={crit.id}
              className="rounded-lg border border-border bg-page-bg p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text">{crit.nombre}</p>
                  {crit.descripcion ? (
                    <p className="mt-1 text-xs text-text-muted">
                      {crit.descripcion}
                    </p>
                  ) : null}
                  <p className="mt-1 text-caption">
                    Peso: {(crit.peso * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="w-full sm:w-40">
                  <label htmlFor={`score-${crit.id}`} className="text-caption">
                    Nota ({concurso.escalaMin}–{concurso.escalaMax})
                  </label>
                  <select
                    id={`score-${crit.id}`}
                    value={current}
                    onChange={(e) => handleSave(crit.id, e.target.value)}
                    className="combobox mt-1"
                  >
                    <option value="">— Nota —</option>
                    {scoreOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
