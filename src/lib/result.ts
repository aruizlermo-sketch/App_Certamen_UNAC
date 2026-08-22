export type VoidResult = { ok: true } | { ok: false; error: string };

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok(): VoidResult {
  return { ok: true };
}

export function fail(error: string): VoidResult {
  return { ok: false, error };
}

export function okData<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function failData<T>(error: string): ActionResult<T> {
  return { ok: false, error };
}
