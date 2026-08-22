"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/login/actions";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

type LoginFormProps = {
  nextPath: string;
  authError?: string | null;
  authEmail?: string | null;
};

export function LoginForm({ nextPath, authError, authEmail }: LoginFormProps) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  const errorMessage =
    state.error ??
    (authError === "no-jurado"
      ? authEmail
        ? `La cuenta ${authEmail} no esta vinculada a un jurado activo. Pide al organizador que revise el email en Admin > Jurados o que resetee la vinculacion.`
        : "Tu cuenta no esta vinculada a un jurado. Contacta al organizador."
      : authError === "auth"
        ? "No se pudo completar el inicio de sesion. Intenta de nuevo."
        : null);

  return (
    <div className="space-y-5">
      <GoogleLoginButton nextPath={nextPath} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-text-muted">o con email</span>
        </div>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={nextPath} />

        <div>
          <label htmlFor="email" className="text-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input-field mt-1.5"
            placeholder="jurado@unac.edu.pe"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-label">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="input-field mt-1.5"
          />
        </div>

        {errorMessage ? (
          <p className="rounded-xl bg-coral-soft px-3 py-2 text-sm text-coral">
            {errorMessage}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
