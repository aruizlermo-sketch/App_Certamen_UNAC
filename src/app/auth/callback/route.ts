import { NextResponse } from "next/server";
import { linkUserByEmail } from "@/lib/auth/link-account";
import { getAppSession } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/messages";
import { createServerClient } from "@/lib/supabase/server";

function accessDeniedRedirect(origin: string) {
  return NextResponse.redirect(`${origin}/login?error=1`);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) {
    return accessDeniedRedirect(origin);
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return accessDeniedRedirect(origin);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await linkUserByEmail(user.id, user.email);
  }

  const session = await getAppSession();

  const hasAccess =
    session.rol === "admin" ||
    (session.rol === "jurado" && Boolean(session.juradoId));

  if (!hasAccess) {
    await supabase.auth.signOut();
    return accessDeniedRedirect(origin);
  }

  const destination =
    session.rol === "jurado" ? "/jurado" : next;

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";

  if (isLocal) {
    return NextResponse.redirect(`${origin}${destination}`);
  }

  if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${destination}`);
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
