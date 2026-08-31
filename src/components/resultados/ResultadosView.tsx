import type { ResultadosConcurso } from "@/types/certamen";

type ResultadosViewProps = {
  resultados: ResultadosConcurso;
  readOnly?: boolean;
};

export function ResultadosView({ resultados, readOnly = false }: ResultadosViewProps) {
  const { concurso, rankingGeneral, porCategoria } = resultados;

  return (
    <div className="space-y-8">
      {readOnly ? (
        <p className="text-sm text-text-muted">
          Rankings calculados en tiempo real. No puedes modificar notas desde aqui.
        </p>
      ) : null}

      <div className="section-heading">
        <p className="section-eyebrow">Tabla general</p>
        <h1 className="sr-only">{concurso.nombre}</h1>
      </div>

      {/* Resumen general */}
      <section className="card-panel p-5">
        <h2 className="text-lg font-bold text-text">
          Puntaje total — Tabla de posiciones
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-unac-navy text-white">
                <th className="px-3 py-2 text-left">N°</th>
                <th className="px-3 py-2 text-left">Tuna</th>
                <th className="px-3 py-2 text-right">Puntaje</th>
                {porCategoria.map((rc) => (
                  <th
                    key={rc.categoria.id}
                    className="px-3 py-2 text-right text-xs"
                  >
                    {rc.categoria.nombre.replace("Mejor ", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankingGeneral.map((r, i) => (
                <tr key={r.participanteId} className="border-b border-border">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2 font-medium">
                    {r.participanteNombre}
                  </td>
                  <td className="px-3 py-2 text-right text-lg font-bold text-brand">
                    {r.puntajeTotal.toFixed(3)}
                  </td>
                  {r.porCategoria.map((pc) => (
                    <td
                      key={pc.categoriaId}
                      className="px-3 py-2 text-right text-text-muted"
                    >
                      {pc.puntaje.toFixed(3)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Podio */}
      <section className="grid gap-4 sm:grid-cols-3">
        {rankingGeneral.slice(0, 3).map((r, i) => (
          <div
            key={r.participanteId}
            className={`kpi-card text-center ${i === 0 ? "ring-2 ring-brand" : ""}`}
          >
            <p className="text-caption">
              {i === 0 ? "1er Lugar" : i === 1 ? "2do Lugar" : "3er Lugar"}
            </p>
            <p className="mt-2 text-lg font-bold">
              {r.participanteNombre}
            </p>
            <p className="mt-1 text-3xl font-bold text-brand">
              {r.puntajeTotal.toFixed(3)}
            </p>
          </div>
        ))}
      </section>

      {/* Por categoría */}
      {porCategoria.map((rc) => (
        <section key={rc.categoria.id} className="card-panel p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wide">
                {rc.categoria.nombre}
              </h2>
              {rc.ganador ? (
                <p className="mt-1 text-sm text-text-muted">
                  Ganador:{" "}
                  <span className="font-semibold text-text">
                    {rc.ganador.participanteNombre}
                  </span>{" "}
                  ({rc.ganador.puntaje.toFixed(3)})
                </p>
              ) : null}
            </div>
            <span className="status-pill bg-brand-soft text-text">
              Suma de jurados
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-page-bg">
                  <th className="px-3 py-2 text-left">N°</th>
                  <th className="px-3 py-2 text-left">Tuna</th>
                  <th className="px-3 py-2 text-right">Puntaje</th>
                </tr>
              </thead>
              <tbody>
                {rc.ranking.map((r, i) => (
                  <tr key={r.participanteId} className="border-b border-border">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{r.participanteNombre}</td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {r.puntaje.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
