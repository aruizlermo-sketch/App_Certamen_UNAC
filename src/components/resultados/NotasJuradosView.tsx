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

function JuradosTableHeader({
  jurados,
}: {
  jurados: ConcursoCompleto["categorias"][number]["jurados"];
}) {
  return (
    <thead>
      <tr className="border-b border-border bg-unac-navy text-white">
        <th className="px-3 py-2 text-left">Tuna</th>
        {jurados.map((j) => (
          <th key={j.id} className="px-3 py-2 text-right text-xs">
            {j.nombre}
            {j.esPresidente ? " ★" : ""}
          </th>
        ))}
      </tr>
    </thead>
  );
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

      <p className="text-xs text-text-muted">
        Los criterios aparecen contraidos. Pulsa uno para ver las notas por tuna.
      </p>

      {concurso.categorias.map((cat) => (
        <section key={cat.id} className="card-panel p-5">
          <h2 className="text-lg font-bold">{cat.nombre}</h2>
          <p className="mt-1 text-sm text-text-muted">{cat.descripcion}</p>

          <div className="mt-4 space-y-2">
            {cat.criterios.map((crit) => (
              <details
                key={crit.id}
                className="group overflow-hidden rounded-lg border border-border bg-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-page-bg px-4 py-3 marker:content-none hover:bg-blue-soft/40 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold uppercase tracking-wide text-text">
                      {crit.nombre}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Peso {(crit.peso * 100).toFixed(0)}%
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-unac-blue transition group-open:rotate-180">
                    ▼
                  </span>
                </summary>

                <div className="overflow-x-auto border-t border-border">
                  <table className="min-w-full text-sm">
                    <JuradosTableHeader jurados={cat.jurados} />
                    <tbody>
                      {concurso.participantes.map((p) => (
                        <tr key={p.id} className="border-b border-border">
                          <td className="px-3 py-2 font-medium">{p.nombre}</td>
                          {cat.jurados.map((j) => (
                            <td key={j.id} className="px-3 py-2 text-right">
                              {findScore(calificaciones, j.id, p.id, crit.id)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border-2 border-brand/30">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-brand/30 bg-brand-soft/40">
                  <th
                    colSpan={cat.jurados.length + 1}
                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-brand"
                  >
                    Nota final ponderada por jurado
                  </th>
                </tr>
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
                {concurso.participantes.map((p) => (
                  <tr
                    key={`final-${p.id}`}
                    className="border-b border-brand/10 bg-brand-soft/10"
                  >
                    <td className="px-3 py-2 font-semibold">{p.nombre}</td>
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
              </tbody>
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
