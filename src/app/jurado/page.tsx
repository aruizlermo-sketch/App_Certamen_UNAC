import { redirect } from "next/navigation";
import { JuradoPageClient } from "@/components/jurado/JuradoPageClient";
import { JuradoSelector } from "@/components/jurado/JuradoSelector";
import { requireJurado } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  getCalificaciones,
  getConcursoCompleto,
} from "@/lib/certamen/service";
import { mockJurados } from "@/lib/certamen/mock-data";

export default async function JuradoPage() {
  const session = await requireJurado();
  const concurso = await getConcursoCompleto();

  if (!concurso) {
    return <p>No hay concurso configurado.</p>;
  }

  if (!isSupabaseConfigured()) {
    return <JuradoSelector concurso={concurso} jurados={mockJurados} />;
  }

  if (session.rol === "admin") {
    redirect("/");
  }

  if (!session.juradoId) {
    return (
      <div className="card-panel p-6">
        <p className="text-text-muted">
          Tu usuario no esta vinculado a un jurado. Contacta al organizador.
        </p>
      </div>
    );
  }

  const calificaciones = await getCalificaciones(concurso.id);

  return (
    <JuradoPageClient
      concurso={concurso}
      calificaciones={calificaciones}
      juradoId={session.juradoId}
      juradoNombre={session.juradoNombre ?? "Jurado"}
    />
  );
}
