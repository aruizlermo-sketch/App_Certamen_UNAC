import type { VoidResult } from "@/lib/result";

export function normalizeEmail(value: string | null | undefined): string | null {
  const email = value?.trim().toLowerCase() ?? "";
  return email || null;
}

export function requireEscudoUrl(
  value: string | null | undefined,
): VoidResult | null {
  const url = value?.trim() ?? "";
  if (!url) return null;
  if (!url.startsWith("/escudos/") || url.includes("..")) {
    return {
      ok: false,
      error: "La ruta del escudo debe ser /escudos/nombre.png (dentro de public/escudos).",
    };
  }
  return null;
}

export function requireNombre(
  value: string,
  label = "El nombre",
): VoidResult | null {
  if (!value.trim()) {
    return { ok: false, error: `${label} es obligatorio.` };
  }
  return null;
}

export function requireEmail(
  value: string | null | undefined,
): { ok: true; email: string } | { ok: false; error: string } {
  const email = normalizeEmail(value);
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Ingresa un email valido." };
  }
  return { ok: true, email };
}

export function validatePuntaje(
  puntaje: number,
  escalaMin: number,
  escalaMax: number,
): VoidResult | null {
  if (puntaje < escalaMin || puntaje > escalaMax) {
    return {
      ok: false,
      error: `La nota debe estar entre ${escalaMin} y ${escalaMax}.`,
    };
  }
  return null;
}
