import { NotasJuradosView } from "@/components/resultados/NotasJuradosView";
import { requireNotasJuradosAccess } from "@/lib/auth/session";
import { getCalificaciones, getConcursoCompleto } from "@/lib/certamen/service";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NotasJuradosPage() {
  const session = await requireNotasJuradosAccess();
  const concurso = await getConcursoCompleto();

  if (!concurso) {
    return <p className="text-text-muted">No hay concurso configurado.</p>;
  }

  const calificaciones = await getCalificaciones(concurso.id, {
    viewAll: true,
    scope: "supervision",
  });

  return (
    <div className="space-y-6">
      {session.esPresidente ? (
        <div className="info-banner">
          <strong>Modo presidente:</strong> supervision de las notas de todos
          los jurados. Los resultados globales estan en{" "}
          <Link href="/resultados" className="font-semibold underline">
            Resultados
          </Link>
          .
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-eyebrow">Supervision</p>
          <h2 className="section-title">Notas de jurado</h2>
          <p className="mt-1 text-sm text-text-muted">
            Vista detallada de las calificaciones de cada jurado.
            {session.esPresidente ? " Solo lectura." : ""}
          </p>
        </div>
        <Link href="/resultados" className="btn-secondary">
          Ver resultados globales
        </Link>
      </div>

      <NotasJuradosView
        concurso={concurso}
        calificaciones={calificaciones}
        readOnly={session.esPresidente || session.rol === "admin"}
      />
    </div>
  );
}
