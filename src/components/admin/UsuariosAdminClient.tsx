"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createAdminInviteAction,
  deleteAdminInviteAction,
} from "@/app/admin/actions";
import type { AdminInvite } from "@/types/certamen";

type UsuariosAdminClientProps = {
  invites: AdminInvite[];
};

export function UsuariosAdminClient({ invites }: UsuariosAdminClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set("email", email);
    fd.set("nombre", nombre);

    startTransition(async () => {
      const result = await createAdminInviteAction(fd);
      if (result.ok) {
        setEmail("");
        setNombre("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDelete(inviteEmail: string) {
    if (!confirm(`Quitar acceso admin a ${inviteEmail}?`)) return;

    startTransition(async () => {
      const result = await deleteAdminInviteAction(inviteEmail);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="info-banner">
        Asigna correos de <strong>administrador</strong>. Cuando esa persona entre
        con Google, recibira rol admin automaticamente.
      </div>

      <form onSubmit={handleSubmit} className="card-panel space-y-4 p-5">
        <h3 className="text-base font-bold">Invitar administrador</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-email" className="text-label">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field mt-1.5"
              placeholder="admin@unac.edu.pe"
            />
          </div>
          <div>
            <label htmlFor="admin-nombre" className="text-label">
              Nombre (opcional)
            </label>
            <input
              id="admin-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-field mt-1.5"
              placeholder="Anthony"
            />
          </div>
        </div>
        {error ? (
          <p className="rounded-xl bg-coral-soft px-3 py-2 text-sm text-coral">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Guardando..." : "Agregar admin"}
        </button>
      </form>

      <div className="card-panel p-5">
        <h3 className="text-base font-bold">Administradores pendientes</h3>
        <p className="mt-1 text-sm text-text-muted">
          Se activan al primer inicio de sesion con ese correo.
        </p>
        {invites.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {invites.map((invite) => (
              <li
                key={invite.email}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-page-bg px-4 py-3"
              >
                <div>
                  <p className="font-medium">{invite.email}</p>
                  {invite.nombre ? (
                    <p className="text-sm text-text-muted">{invite.nombre}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(invite.email)}
                  disabled={pending}
                  className="rounded-md border border-coral/30 bg-coral-soft px-3 py-1.5 text-xs font-semibold text-coral transition hover:bg-coral/10 disabled:opacity-60"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-text-muted">
            No hay invitaciones pendientes.
          </p>
        )}
      </div>
    </div>
  );
}
