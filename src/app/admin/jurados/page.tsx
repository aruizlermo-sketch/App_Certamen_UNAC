import { requireAdmin } from "@/lib/auth/session";
import { getConcursoCompleto } from "@/lib/certamen/service";

export default async function JuradosAdminPage() {
  await requireAdmin();
  const concurso = await getConcursoCompleto();

  if (!concurso) return <p>Sin concurso.</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-eyebrow">Configuracion</p>
        <h2 className="section-title">Jurados</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {concurso.jurados.map((j) => {
          const categorias = concurso.categorias.filter((cat) =>
            cat.jurados.some((jj) => jj.id === j.id),
          );

          return (
            <div key={j.id} className="card-panel p-5">
              <h3 className="text-base font-bold">
                {j.nombre}
              </h3>
              <p className="mt-2 text-caption">Categorias asignadas:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {categorias.map((cat) => (
                  <span
                    key={cat.id}
                    className="status-pill bg-brand-soft text-text"
                  >
                    {cat.nombre}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
