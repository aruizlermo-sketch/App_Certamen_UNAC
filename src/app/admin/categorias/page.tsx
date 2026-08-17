import { requireAdmin } from "@/lib/auth/session";
import { getConcursoCompleto } from "@/lib/certamen/service";

export default async function CategoriasAdminPage() {
  await requireAdmin();
  const concurso = await getConcursoCompleto();

  if (!concurso) return <p>Sin concurso.</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-eyebrow">Configuracion</p>
        <h2 className="section-title">Categorias y criterios</h2>
      </div>

      <div className="space-y-4">
        {concurso.categorias.map((cat) => (
          <div key={cat.id} className="card-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">
                  {cat.nombre}
                </h3>
                <p className="text-sm text-text-muted">{cat.descripcion}</p>
              </div>
              <span className="status-pill bg-brand-soft text-text">
                Peso en total: {(cat.pesoTotal * 100).toFixed(0)}%
              </span>
            </div>

            <div className="mt-4">
              <p className="text-label">Criterios</p>
              <div className="mt-2 space-y-2">
                {cat.criterios.map((crit) => (
                  <div
                    key={crit.id}
                    className="rounded-xl bg-page-bg px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{crit.nombre}</span>
                      <span className="text-caption">
                        Peso: {(crit.peso * 100).toFixed(0)}%
                      </span>
                    </div>
                    {crit.descripcion ? (
                      <p className="mt-1 text-xs text-text-muted">
                        {crit.descripcion}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-label">Jurados asignados</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {cat.jurados.map((j) => (
                  <span
                    key={j.id}
                    className="status-pill bg-blue-soft text-blue"
                  >
                    {j.nombre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
