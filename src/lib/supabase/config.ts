export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const valid =
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      Boolean(parsed.hostname) &&
      (parsed.pathname === "/" || parsed.pathname === "") &&
      !url.includes("tu-proyecto") &&
      key.startsWith("eyJ");

    if (!valid) {
      return null;
    }

    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}
