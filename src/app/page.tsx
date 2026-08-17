import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getConcursoCompleto, getResultados } from "@/lib/certamen/service";

export default async function HomePage() {
  const session = await getAppSession();

  if (!session.isDemo && session.rol === "jurado") {
    redirect("/jurado");
  }

  const concurso = await getConcursoCompleto();
  const resultados =
    session.rol === "admin" && concurso
      ? await getResultados(concurso.id)
      : null;
  const demoMode = !isSupabaseConfigured();

  return (
    <div className="space-y-6">
      {demoMode ? (
        <div className="rounded-xl border border-amber-soft bg-amber-soft px-4 py-3 text-sm text-amber-900">
          Modo demo — datos en memoria. Configura Supabase para produccion.
        </div>
      ) : null}

      <div className="section-heading">
        <p className="section-eyebrow">Certamen activo</p>
        <h2 className="section-title">{concurso?.nombre ?? "Sin concurso"}</h2>
        <p className="mt-1 text-sm text-text-muted">
          {concurso?.descripcion}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="kpi-card kpi-card-accent">
          <p className="text-caption">Participantes</p>
          <p className="mt-1 text-3xl font-bold text-unac-blue">
            {concurso?.participantes.length ?? 0}
          </p>
        </div>
        <div className="kpi-card kpi-card-accent">
          <p className="text-caption">Categorias</p>
          <p className="mt-1 text-3xl font-bold text-unac-blue">
            {concurso?.categorias.length ?? 0}
          </p>
        </div>
        <div className="kpi-card kpi-card-accent">
          <p className="text-caption">Jurados</p>
          <p className="mt-1 text-3xl font-bold text-unac-blue">
            {concurso?.jurados.length ?? 0}
          </p>
        </div>
        <div className="kpi-card kpi-card-accent">
          <p className="text-caption">Escala</p>
          <p className="mt-1 text-3xl font-bold text-unac-blue">
            {concurso ? `${concurso.escalaMin}–${concurso.escalaMax}` : "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-panel p-5">
          <h3 className="text-lg font-bold">Acciones rapidas</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/resultados" className="btn-primary">
              Ver resultados
            </Link>
            <Link href="/jurado" className="btn-secondary">
              Calificar
            </Link>
            <Link href="/admin" className="btn-secondary">
              Configuracion
            </Link>
          </div>
        </div>

        <div className="card-panel p-5">
          <h3 className="text-lg font-bold">Top 3 general</h3>
          {resultados && resultados.rankingGeneral.length > 0 ? (
            <ol className="mt-4 space-y-2">
              {resultados.rankingGeneral.slice(0, 3).map((r, i) => (
                <li
                  key={r.participanteId}
                  className="flex items-center justify-between rounded-xl bg-page-bg px-3 py-2"
                >
                  <span className="text-sm font-medium">
                    {i + 1}. {r.participanteNombre}
                  </span>
                  <span className="text-lg font-bold text-brand">
                    {r.puntajeTotal.toFixed(3)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-text-muted">
              Aun no hay calificaciones registradas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
