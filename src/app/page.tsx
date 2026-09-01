import { redirect } from "next/navigation";
import { ResultadosPageContent } from "@/components/resultados/ResultadosPageContent";
import { getAppSession, requireResultadosAccess } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getResultados } from "@/lib/certamen/service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getAppSession();

  if (!session.isDemo && session.rol === "jurado") {
    redirect("/jurado");
  }

  const authSession = await requireResultadosAccess();
  const resultados = await getResultados();

  if (!resultados) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-text-muted">No hay resultados disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isSupabaseConfigured() ? (
        <div className="rounded-xl border border-amber-soft bg-amber-soft px-4 py-3 text-sm text-amber-900">
          Modo demo — datos en memoria. Configura Supabase para produccion.
        </div>
      ) : null}

      <ResultadosPageContent
        session={authSession}
        resultados={resultados}
        showBackButton={false}
      />
    </div>
  );
}
