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

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-page-bg">
              <th className="px-4 py-3 text-left">N°</th>
              <th className="px-4 py-3 text-left">Tuna</th>
            </tr>
          </thead>
          <tbody>
            {concurso.participantes.map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="px-4 py-3">{p.orden}</td>
                <td className="px-4 py-3 font-medium">{p.nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
