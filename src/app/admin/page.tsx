import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getConcursoCompleto } from "@/lib/certamen/service";

export default async function AdminPage() {
  await requireAdmin();
  const concurso = await getConcursoCompleto();

  if (!concurso) {
    return <p>No hay concurso configurado.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="section-eyebrow">Administracion</p>
        <h2 className="section-title">{concurso.nombre}</h2>
        <p className="mt-1 text-sm text-text-muted">
          Estado:{" "}
          <span className="status-pill bg-green-soft text-green">
            {concurso.estado}
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/categorias" className="card-panel block p-5 transition hover:ring-2 hover:ring-brand">
          <h3 className="text-base font-bold">
            Categorias
          </h3>
          <p className="mt-1 text-2xl font-bold">{concurso.categorias.length}</p>
          <p className="text-caption">Criterios y pesos por categoria</p>
        </Link>

        <Link href="/admin/participantes" className="card-panel block p-5 transition hover:ring-2 hover:ring-brand">
          <h3 className="text-base font-bold">
            Participantes
          </h3>
          <p className="mt-1 text-2xl font-bold">{concurso.participantes.length}</p>
          <p className="text-caption">Tunas inscritas</p>
        </Link>

        <Link href="/admin/jurados" className="card-panel block p-5 transition hover:ring-2 hover:ring-brand">
          <h3 className="text-base font-bold">
            Jurados
          </h3>
          <p className="mt-1 text-2xl font-bold">{concurso.jurados.length}</p>
          <p className="text-caption">Asignacion por categoria</p>
        </Link>
      </div>

      <div className="card-panel p-5">
        <h3 className="text-base font-bold">Donde configurar</h3>
        <p className="mt-2 text-sm text-text-muted">
          Las paginas de admin son de consulta. Para editar datos usa una de
          estas fuentes:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-unac-navy text-white">
                <th className="px-3 py-2 text-left">Que configurar</th>
                <th className="px-3 py-2 text-left">Ver en la app</th>
                <th className="px-3 py-2 text-left">Editar (demo)</th>
                <th className="px-3 py-2 text-left">Editar (produccion)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-3 py-2 font-medium">Participantes (tunas)</td>
                <td className="px-3 py-2">
                  <Link href="/admin/participantes" className="text-unac-blue hover:underline">
                    /admin/participantes
                  </Link>
                </td>
                <td className="px-3 py-2 text-caption">src/lib/certamen/mock-data.ts</td>
                <td className="px-3 py-2 text-caption">tabla participantes en Supabase</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Jurados</td>
                <td className="px-3 py-2">
                  <Link href="/admin/jurados" className="text-unac-blue hover:underline">
                    /admin/jurados
                  </Link>
                </td>
                <td className="px-3 py-2 text-caption">mock-data.ts → mockJurados</td>
                <td className="px-3 py-2 text-caption">tabla jurados + jurado_categorias</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Categorias</td>
                <td className="px-3 py-2">
                  <Link href="/admin/categorias" className="text-unac-blue hover:underline">
                    /admin/categorias
                  </Link>
                </td>
                <td className="px-3 py-2 text-caption">mock-data.ts → mockCategorias</td>
                <td className="px-3 py-2 text-caption">tabla categorias</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Criterios y pesos</td>
                <td className="px-3 py-2">
                  <Link href="/admin/categorias" className="text-unac-blue hover:underline">
                    /admin/categorias
                  </Link>
                </td>
                <td className="px-3 py-2 text-caption">mock-data.ts → mockCriterios</td>
                <td className="px-3 py-2 text-caption">tabla categoria_criterios</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Concurso y escala 1–10</td>
                <td className="px-3 py-2">/admin</td>
                <td className="px-3 py-2 text-caption">mock-data.ts → mockConcurso</td>
                <td className="px-3 py-2 text-caption">tabla concursos</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Seed completo UNAC 2026</td>
                <td className="px-3 py-2">—</td>
                <td className="px-3 py-2 text-caption">—</td>
                <td className="px-3 py-2 text-caption">supabase/schema.sql</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-panel p-5">
        <h3 className="text-base font-bold">
          Reglas de puntuacion
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-text-muted">
          <li>
            Escala de calificacion: {concurso.escalaMin} a {concurso.escalaMax}
          </li>
          <li>
            Por categoria: promedio de jurados por criterio, ponderado
            (40% / 30% / 30%)
          </li>
          <li>
            Puntaje total: suma de puntajes por categoria × peso (20% c/u)
          </li>
        </ul>
      </div>
    </div>
  );
}
