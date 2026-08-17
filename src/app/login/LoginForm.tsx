"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/login/actions";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
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

      {state.error ? (
        <p className="rounded-xl bg-coral-soft px-3 py-2 text-sm text-coral">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
