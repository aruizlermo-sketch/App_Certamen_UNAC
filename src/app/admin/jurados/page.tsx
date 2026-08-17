import { JuradosAdminClient } from "@/components/admin/JuradosAdminClient";
import { requireAdmin } from "@/lib/auth/session";
import { getConcursoCompleto } from "@/lib/certamen/service";

export default async function JuradosAdminPage() {
  await requireAdmin();
  const concurso = await getConcursoCompleto();

  if (!concurso) return <p>Sin concurso.</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-eyebrow">Configuracion</p>
        <h2 className="section-title">Jurados</h2>
      </div>

      <JuradosAdminClient
        concursoId={concurso.id}
        jurados={concurso.jurados}
        categorias={concurso.categorias}
      />
    </div>
  );
}
