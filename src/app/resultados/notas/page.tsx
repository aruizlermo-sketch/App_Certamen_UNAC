import { NotasJuradosView } from "@/components/resultados/NotasJuradosView";
import { requireNotasJuradosAccess } from "@/lib/auth/session";
import { getCalificaciones, getConcursoCompleto } from "@/lib/certamen/service";

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
      <div>
        <p className="section-eyebrow">Supervision</p>
        <h2 className="section-title">Notas por jurado</h2>
        <p className="mt-1 text-sm text-text-muted">
          Vista detallada de las calificaciones de cada jurado.
          {session.esPresidente ? " Modo presidente — solo lectura." : ""}
        </p>
      </div>

      <NotasJuradosView
        concurso={concurso}
        calificaciones={calificaciones}
        readOnly={session.esPresidente}
      />
    </div>
  );
}
