import { ParticipantesAdminClient } from "@/components/admin/ParticipantesAdminClient";
import { requireAdmin } from "@/lib/auth/session";
import { getConcursoCompleto } from "@/lib/certamen/service";

export default async function ParticipantesAdminPage() {
  await requireAdmin();
  const concurso = await getConcursoCompleto();

  if (!concurso) return <p>Sin concurso.</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-eyebrow">Configuracion</p>
        <h2 className="section-title">Participantes</h2>
      </div>

      <ParticipantesAdminClient
        concursoId={concurso.id}
        participantes={concurso.participantes}
      />
    </div>
  );
}
