import { UsuariosAdminClient } from "@/components/admin/UsuariosAdminClient";
import { requireAdmin } from "@/lib/auth/session";
import { listAdminInvites } from "@/lib/certamen/admin-service";

export default async function UsuariosAdminPage() {
  await requireAdmin();
  const invites = await listAdminInvites();

  return (
    <div className="space-y-6">
      <div>
        <p className="section-eyebrow">Configuracion</p>
        <h2 className="section-title">Accesos por email</h2>
        <p className="mt-1 text-sm text-text-muted">
          Vincula jurados y administradores usando su correo, sin UUID.
        </p>
      </div>

      <UsuariosAdminClient invites={invites} />
    </div>
  );
}
