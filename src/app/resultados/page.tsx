import Link from "next/link";
import { PrintResultadosButton } from "@/components/resultados/PrintResultadosButton";
import { ResultadosView } from "@/components/resultados/ResultadosView";
import {
  canPrintResultados,
  requireResultadosAccess,
} from "@/lib/auth/session";
import { getResultados } from "@/lib/certamen/service";

export default async function ResultadosPage() {
  const session = await requireResultadosAccess();
  const resultados = await getResultados();
  const isJurado = session.rol === "jurado";
  const canPrint = canPrintResultados(session);

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
        <div className="info-banner no-print">
          <strong>Vista de jurado:</strong> rankings del certamen en solo lectura.
          {session.esPresidente
            ? " Como presidente puedes imprimir el acta en PDF."
            : " Tus notas se editan solo desde Calificar."}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="section-heading">
          <p className="section-eyebrow">Resultados en vivo</p>
          <h2 className="section-title">{resultados.concurso.nombre}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={backHref} className="btn-secondary">
            {backLabel}
          </Link>
          {session.rol === "admin" ? (
            <Link href="/resultados/notas" className="btn-secondary">
              Notas por jurado
            </Link>
          ) : null}
          {canPrint ? <PrintResultadosButton /> : null}
        </div>
      </div>

      <div className="print-only mb-6 text-center">
        <p className="text-xs uppercase tracking-widest text-text-muted">
          Universidad Nacional del Callao
        </p>
        <h1 className="mt-2 text-2xl font-bold">{resultados.concurso.nombre}</h1>
        <p className="mt-1 text-sm text-text-muted">Acta de resultados — {new Date().toLocaleDateString("es-PE")}</p>
      </div>

      <ResultadosView resultados={resultados} readOnly={isJurado} />
    </div>
  );
}
