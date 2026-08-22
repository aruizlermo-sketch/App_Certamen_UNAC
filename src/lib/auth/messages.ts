/** Mensaje unico para el cliente cuando el acceso es denegado (no revelar causa). */
export const ACCESS_DENIED_MESSAGE =
  "No tienes acceso a esta aplicacion. Contacta al organizador del certamen.";

export function hasLoginError(error: string | null | undefined): boolean {
  return Boolean(error);
}

/** Rutas internas permitidas tras login (evita open redirect). */
export function safeNextPath(next: string | null | undefined): string {
  const value = (next ?? "").trim();
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}
