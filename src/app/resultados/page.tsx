import { ResultadosPageContent } from "@/components/resultados/ResultadosPageContent";
import { requireResultadosAccess } from "@/lib/auth/session";
import { getResultados } from "@/lib/certamen/service";

export const dynamic = "force-dynamic";

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

  return (
    <ResultadosPageContent session={session} resultados={resultados} />
  );
}
