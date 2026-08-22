import { LoginForm } from "@/app/login/LoginForm";
import { BrandLogo } from "@/components/brand/BrandMark";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Link from "next/link";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string; email?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") ? params.next : "/";
  const authError = params.error ?? null;
  const authEmail = params.email ?? null;

  return (
    <div className="min-h-screen bg-page-bg">
      <div className="top-bar flex items-center justify-between px-6 py-2">
        <p>Universidad Nacional del Callao</p>
        <p className="text-white/70">unac.edu.pe</p>
      </div>

      <div className="hero-banner px-6 py-10 text-center text-white">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <BrandLogo variant="light" />
          <h1 className="mt-6 text-2xl font-bold uppercase tracking-wide">
            Certamen de Tunas
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Sistema de calificacion — UNAC 2026
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-8 max-w-md px-4 pb-10">
        <div className="rounded-lg border border-border bg-card p-8 shadow-[0_8px_32px_rgba(7,41,77,0.12)]">
          {isSupabaseConfigured() ? (
            <LoginForm
              nextPath={nextPath}
              authError={authError}
              authEmail={authEmail}
            />
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-text-muted">
                Modo demo activo — Supabase no configurado.
              </p>
              <Link href="/" className="btn-primary inline-flex w-full">
                Entrar al demo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
