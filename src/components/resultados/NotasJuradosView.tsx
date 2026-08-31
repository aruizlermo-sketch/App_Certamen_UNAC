import { Fragment } from "react";
import { calcularPuntajeJurado } from "@/lib/certamen/aggregator";
import type { Calificacion, ConcursoCompleto } from "@/types/certamen";

type NotasJuradosViewProps = {
  concurso: ConcursoCompleto;
  calificaciones: Calificacion[];
  readOnly?: boolean;
};

function findScore(
  calificaciones: Calificacion[],
  juradoId: string,
  participanteId: string,
  criterioId: string,
) {
  const found = calificaciones.find(
    (c) =>
      c.juradoId === juradoId &&
      c.participanteId === participanteId &&
      c.categoriaCriterioId === criterioId,
  );
  return found ? found.puntaje.toFixed(1) : "—";
}

function formatPonderado(
  result: { puntaje: number; completo: boolean } | null,
) {
  if (!result) return "—";
  const value = result.puntaje.toFixed(3);
  return result.completo ? value : `${value}*`;
}

export function NotasJuradosView({
  concurso,
  calificaciones,
  readOnly = true,
}: NotasJuradosViewProps) {
  const allCriterios = concurso.categorias.flatMap((cat) => cat.criterios);

  return (
    <div className="space-y-6">
      {readOnly ? (
        <div className="info-banner">
          <strong>Solo lectura:</strong> puedes ver las notas de todos los jurados
          pero no modificarlas. Para calificar usa tu pantalla de Calificar.
        </div>
      ) : null}

      {concurso.categorias.map((cat) => (
        <section key={cat.id} className="card-panel p-5">
          <h2 className="text-lg font-bold">{cat.nombre}</h2>
          <p className="mt-1 text-sm text-text-muted">{cat.descripcion}</p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-unac-navy text-white">
                  <th className="px-3 py-2 text-left">Tuna</th>
                  {cat.jurados.map((j) => (
                    <th key={j.id} className="px-3 py-2 text-right text-xs">
                      {j.nombre}
                      {j.esPresidente ? " ★" : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cat.criterios.map((crit) => (
                  <Fragment key={crit.id}>
                    <tr className="bg-page-bg">
                      <td
                        colSpan={cat.jurados.length + 1}
                        className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted"
                      >
                        {crit.nombre}
                        <span className="ml-2 font-normal normal-case text-text-muted/80">
                          · Peso {(crit.peso * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                    {concurso.participantes.map((p) => (
                      <tr key={`${crit.id}-${p.id}`} className="border-b border-border">
                        <td className="px-3 py-2 pl-5 font-medium">{p.nombre}</td>
                        {cat.jurados.map((j) => (
                          <td key={j.id} className="px-3 py-2 text-right">
                            {findScore(calificaciones, j.id, p.id, crit.id)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-brand bg-brand-soft/30">
                  <td
                    colSpan={cat.jurados.length + 1}
                    className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-brand"
                  >
                    Nota final ponderada por jurado
                  </td>
                </tr>
                {concurso.participantes.map((p) => (
                  <tr
                    key={`final-${p.id}`}
                    className="border-b border-brand/20 bg-brand-soft/10"
                  >
                    <td className="px-3 py-2 pl-5 font-semibold">{p.nombre}</td>
                    {cat.jurados.map((j) => {
                      const result = calcularPuntajeJurado(
                        p.id,
                        cat.id,
                        j.id,
                        allCriterios,
                        calificaciones,
                      );
                      return (
                        <td
                          key={j.id}
                          className="px-3 py-2 text-right text-base font-bold text-brand"
                        >
                          {formatPonderado(result)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tfoot>
            </table>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Nota final = suma de (nota × peso) de cada criterio. * = incompleto.
          </p>
        </section>
      ))}
    </div>
  );
}
