import { CategoriasAdminClient } from "@/components/admin/CategoriasAdminClient";
import { requireAdmin } from "@/lib/auth/session";
import { getConcursoCompleto } from "@/lib/certamen/service";

export default async function CategoriasAdminPage() {
  await requireAdmin();
  const concurso = await getConcursoCompleto();

  if (!concurso) return <p>Sin concurso.</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-eyebrow">Configuracion</p>
        <h2 className="section-title">Categorias y criterios</h2>
      </div>

      <CategoriasAdminClient
        concursoId={concurso.id}
        categorias={concurso.categorias}
      />
    </div>
  );
}
