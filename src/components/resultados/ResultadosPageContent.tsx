import Link from "next/link";
import { DownloadResultadosPdfButton } from "@/components/resultados/DownloadResultadosPdfButton";
import { ResultadosView } from "@/components/resultados/ResultadosView";
import {
  canPrintResultados,
  canViewNotasJurados,
  type AppSession,
} from "@/lib/auth/session";
import type { ResultadosConcurso } from "@/types/certamen";

type ResultadosPageContentProps = {
  session: AppSession;
  resultados: ResultadosConcurso;
  showBackButton?: boolean;
};

export function ResultadosPageContent({
  session,
  resultados,
  showBackButton = true,
}: ResultadosPageContentProps) {
  const isJurado = session.rol === "jurado";
  const canDownloadPdf = canPrintResultados(session);
  const canViewNotas = canViewNotasJurados(session);
  const backHref = session.rol === "admin" ? "/admin" : "/jurado";
  const backLabel =
    session.rol === "admin" ? "Configuracion" : "Volver a calificar";

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
          {showBackButton ? (
            <Link href={backHref} className="btn-secondary">
              {backLabel}
            </Link>
          ) : null}
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
