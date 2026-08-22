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

export function NotasJuradosView({
  concurso,
  calificaciones,
  readOnly = true,
}: NotasJuradosViewProps) {
  return (
    <div className="space-y-6">
      {readOnly ? (
        <div className="rounded-xl border border-blue-soft bg-blue-soft px-4 py-3 text-sm text-unac-navy">
          <strong>Solo lectura:</strong> puedes ver las notas de todos los jurados
          pero no modificarlas. Para calificar usa tu pantalla de Calificar.
        </div>
      ) : null}

      {concurso.categorias.map((cat) => (
        <section key={cat.id} className="card-panel p-5">
          <h2 className="text-lg font-bold">{cat.nombre}</h2>
          <p className="mt-1 text-sm text-text-muted">{cat.descripcion}</p>

          {cat.criterios.map((crit) => (
            <div key={crit.id} className="mt-5">
              <p className="text-label">{crit.nombre}</p>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-page-bg">
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
                      <tr key={p.id} className="border-b border-border">
                        <td className="px-3 py-2 font-medium">{p.nombre}</td>
                        {cat.jurados.map((j) => (
                          <td key={j.id} className="px-3 py-2 text-right font-semibold">
                            {findScore(calificaciones, j.id, p.id, crit.id)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
