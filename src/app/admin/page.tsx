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
          <h3 className="text-base font-bold">Categorias</h3>
          <p className="mt-1 text-2xl font-bold">{concurso.categorias.length}</p>
          <p className="text-caption">Criterios y pesos por categoria</p>
        </Link>

        <Link href="/admin/participantes" className="card-panel block p-5 transition hover:ring-2 hover:ring-brand">
          <h3 className="text-base font-bold">Participantes</h3>
          <p className="mt-1 text-2xl font-bold">{concurso.participantes.length}</p>
          <p className="text-caption">Tunas inscritas</p>
        </Link>

        <Link href="/admin/jurados" className="card-panel block p-5 transition hover:ring-2 hover:ring-brand">
          <h3 className="text-base font-bold">Jurados</h3>
          <p className="mt-1 text-2xl font-bold">{concurso.jurados.length}</p>
          <p className="text-caption">Asignacion por categoria</p>
        </Link>

        <Link href="/admin/usuarios" className="card-panel block p-5 transition hover:ring-2 hover:ring-brand">
          <h3 className="text-base font-bold">Accesos</h3>
          <p className="mt-1 text-2xl font-bold">Admin</p>
          <p className="text-caption">Invitaciones por email</p>
        </Link>
      </div>

      <div className="card-panel p-5">
        <h3 className="text-base font-bold">Reglas de puntuacion</h3>
        <ul className="mt-3 space-y-2 text-sm text-text-muted">
          <li>
            Escala de calificacion: {concurso.escalaMin} a {concurso.escalaMax}
          </li>
          <li>
            Por categoria: suma de notas de jurados por criterio, ponderado
            (40% / 30% / 30%)
          </li>
          <li>
            Puntaje total: suma de puntajes por categoria
          </li>
        </ul>
      </div>
    </div>
  );
}
