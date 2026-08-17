import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { linkUserByEmail } from "@/lib/auth/link-account";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await linkUserByEmail(user.id, user.email);
  }

  const session = await getAppSession();

  if (session.rol === "jurado" && !session.juradoId) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=no-jurado`);
  }

  const destination =
    session.rol === "jurado"
      ? "/jurado"
      : next.startsWith("/")
        ? next
        : "/";

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
