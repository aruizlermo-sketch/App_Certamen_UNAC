import Link from "next/link";
import { DownloadResultadosPdfButton } from "@/components/resultados/DownloadResultadosPdfButton";
import { ResultadosView } from "@/components/resultados/ResultadosView";
import {
  canPrintResultados,
  canViewNotasJurados,
  requireResultadosAccess,
} from "@/lib/auth/session";
import { getResultados } from "@/lib/certamen/service";

export default async function ResultadosPage() {
  const session = await requireResultadosAccess();
  const resultados = await getResultados();
  const isJurado = session.rol === "jurado";
  const canDownloadPdf = canPrintResultados(session);
  const canViewNotas = canViewNotasJurados(session);

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
      {isJurado ? (
        <div className="info-banner">
          <strong>Vista de jurado:</strong> rankings del certamen en solo lectura.
          {session.esPresidente ? (
            <>
              {" "}
              Como presidente puedes ver las notas de todos los jurados, los
              resultados globales y descargar el acta en PDF.
            </>
          ) : (
            " Tus notas se editan solo desde Calificar."
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="section-heading">
          <p className="section-eyebrow">Resultados en vivo</p>
          <h2 className="section-title">{resultados.concurso.nombre}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={backHref} className="btn-secondary">
            {backLabel}
          </Link>
          {canViewNotas ? (
            <Link href="/resultados/notas" className="btn-secondary">
              Notas de jurado
            </Link>
          ) : null}
          {canDownloadPdf ? (
            <DownloadResultadosPdfButton resultados={resultados} />
          ) : null}
        </div>
      </div>

      <ResultadosView resultados={resultados} readOnly={isJurado} />
    </div>
  );
}
