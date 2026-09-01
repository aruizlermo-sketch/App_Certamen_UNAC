"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { saveScoresAction } from "@/app/jurado/actions";
import { ParticipanteConEscudo } from "@/components/participantes/EscudoParticipante";
import { calcularPuntajeDesdeBorrador } from "@/lib/certamen/aggregator";
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

function buildDraftFromSaved(
  categoria: CategoriaConCriterios,
  calificaciones: Calificacion[],
  juradoId: string,
  participanteId: string,
): Record<string, string> {
  const draft: Record<string, string> = {};
  for (const crit of categoria.criterios) {
    const saved = getScore(calificaciones, juradoId, participanteId, crit.id);
    if (saved) {
      draft[crit.id] = saved;
    }
  }
  return draft;
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
  const [draftScores, setDraftScores] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  const scoreOptions = buildScoreOptions(concurso.escalaMin, concurso.escalaMax);

  useEffect(() => {
    setDraftScores(
      buildDraftFromSaved(
        categoria,
        calificaciones,
        juradoId,
        participante.id,
      ),
    );
    setFeedback(null);
  }, [
    categoria,
    calificaciones,
    juradoId,
    participante.id,
  ]);

  const criteriosCompletados = categoria.criterios.filter(
    (crit) => draftScores[crit.id],
  ).length;

  const puntajePonderado = calcularPuntajeDesdeBorrador(
    categoria.criterios,
    draftScores,
  );
  const puntajeCompleto = criteriosCompletados === categoria.criterios.length;

  const hasSelection = criteriosCompletados > 0;

  function handleSelectScore(criterioId: string, value: string) {
    setDraftScores((prev) => ({ ...prev, [criterioId]: value }));
    setFeedback(null);
  }

  function handleSaveAll() {
    const scores = categoria.criterios
      .filter((crit) => draftScores[crit.id])
      .map((crit) => ({
        categoriaCriterioId: crit.id,
        puntaje: Number(draftScores[crit.id]),
      }));

    if (scores.length === 0) {
      setFeedback({
        type: "error",
        text: "Selecciona al menos una nota antes de guardar.",
      });
      return;
    }

    startTransition(async () => {
      const result = await saveScoresAction({
        juradoId,
        participanteId: participante.id,
        scores,
        escalaMin: concurso.escalaMin,
        escalaMax: concurso.escalaMax,
      });

      if (result.ok) {
        setFeedback({ type: "ok", text: "Calificaciones guardadas correctamente." });
        router.refresh();
        onSaved?.();
      } else {
        setFeedback({ type: "error", text: result.error });
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-caption">Calificando</p>
          <ParticipanteConEscudo
            nombre={participante.nombre}
            escudoUrl={participante.escudoUrl}
            size="md"
            nombreClassName="text-xl font-bold"
          />
          <p className="mt-0.5 text-sm font-medium text-unac-blue">
            {categoria.nombre}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="status-pill bg-blue-soft text-unac-blue">
            {criteriosCompletados}/{categoria.criterios.length} criterios
          </span>
          {puntajePonderado !== null ? (
            <span
              className={`status-pill font-semibold ${
                puntajeCompleto
                  ? "bg-brand-soft text-brand ring-1 ring-brand/30"
                  : "bg-page-bg text-text-muted"
              }`}
            >
              Nota ponderada: {puntajePonderado.toFixed(3)}
              {!puntajeCompleto ? "*" : ""}
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {categoria.criterios.map((crit) => {
          const current = draftScores[crit.id] ?? "";

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
                <div className="w-full">
                  <p className="text-caption">
                    Nota ({concurso.escalaMin}–{concurso.escalaMax})
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {scoreOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectScore(crit.id, opt)}
                        disabled={pending}
                        className={
                          current === opt
                            ? "btn-score btn-score-active"
                            : "btn-score"
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {puntajePonderado !== null ? (
        <div className="rounded-lg border border-brand/30 bg-brand-soft/40 px-4 py-3">
          <p className="text-sm text-text-muted">Tu nota ponderada total en esta categoria</p>
          <p className="mt-1 text-2xl font-bold text-brand">
            {puntajePonderado.toFixed(3)}
            {!puntajeCompleto ? (
              <span className="ml-2 text-sm font-normal text-text-muted">
                (parcial — faltan criterios)
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Suma de cada nota multiplicada por su peso (ej. 8.5×40% + 7.5×30% + 8×30%)
          </p>
        </div>
      ) : null}

      {feedback ? (
        <p
          className={`rounded-xl px-3 py-2 text-sm ${
            feedback.type === "ok"
              ? "bg-green-soft text-green"
              : "bg-coral-soft text-coral"
          }`}
        >
          {feedback.text}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-text-muted">
          {hasSelection
            ? "Revisa las notas y pulsa Guardar para confirmar."
            : "Selecciona las notas de cada criterio."}
        </p>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={pending || !hasSelection}
          className="btn-primary min-w-[140px]"
        >
          {pending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
