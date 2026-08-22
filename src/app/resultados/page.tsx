import Link from "next/link";
import { ResultadosView } from "@/components/resultados/ResultadosView";
import { requireResultadosAccess } from "@/lib/auth/session";
import { getResultados } from "@/lib/certamen/service";

export default async function ResultadosPage() {
  const session = await requireResultadosAccess();
  const resultados = await getResultados();

  if (!resultados) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-text-muted">No hay resultados disponibles.</p>
      </div>
    );
  }

  const backHref = session.rol === "admin" ? "/" : "/jurado";
  const backLabel = session.rol === "admin" ? "Volver al panel" : "Volver a calificar";

  return (
    <div className="space-y-6">
      {session.esPresidente ? (
        <div className="rounded-xl border border-blue-soft bg-blue-soft px-4 py-3 text-sm text-text">
          <strong>Presidente del jurado:</strong> vista de resultados en solo
          lectura. Tus notas se editan solo desde Calificar.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="section-heading">
          <p className="section-eyebrow">Resultados en vivo</p>
          <h2 className="section-title">{resultados.concurso.nombre}</h2>
        </div>
        <Link href={backHref} className="btn-secondary">
          {backLabel}
        </Link>
        {session.rol === "admin" ? (
          <Link href="/resultados/notas" className="btn-secondary">
            Notas por jurado
          </Link>
        ) : null}
      </div>

      <ResultadosView resultados={resultados} readOnly={session.esPresidente} />
    </div>
  );
}
