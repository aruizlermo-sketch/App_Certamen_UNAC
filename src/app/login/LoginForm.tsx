"use client";

import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { ACCESS_DENIED_MESSAGE } from "@/lib/auth/messages";

type LoginFormProps = {
  nextPath: string;
  showAccessDenied?: boolean;
};

export function LoginForm({ nextPath, showAccessDenied = false }: LoginFormProps) {
  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-text-muted">
        Usa tu cuenta de Google autorizada por el organizador.
      </p>

      <GoogleLoginButton nextPath={nextPath} />

      {showAccessDenied ? (
        <p className="rounded-xl bg-coral-soft px-3 py-2 text-sm text-coral">
          {ACCESS_DENIED_MESSAGE}
        </p>
      ) : null}
    </div>
  );
}
