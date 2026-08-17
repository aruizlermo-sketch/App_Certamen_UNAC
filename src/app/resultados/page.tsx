import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandMark";
import { ResultadosView } from "@/components/resultados/ResultadosView";
import { requireAdmin } from "@/lib/auth/session";
import { getResultados } from "@/lib/certamen/service";

export default async function ResultadosPage() {
  await requireAdmin();
  const resultados = await getResultados();

  if (!resultados) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted">No hay resultados disponibles.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <div className="top-bar flex items-center justify-between px-6 py-2">
        <p>Universidad Nacional del Callao — Resultados en vivo</p>
        <p className="text-white/70">unac.edu.pe</p>
      </div>

      <header className="hero-banner px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <BrandLogo variant="light" />
          <Link
            href="/"
            className="rounded-md bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wide text-unac-navy transition hover:bg-brand/90"
          >
            Volver al panel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <ResultadosView resultados={resultados} />
      </main>
    </div>
  );
}
