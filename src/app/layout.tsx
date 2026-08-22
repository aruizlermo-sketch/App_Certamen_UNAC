import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShellGate } from "@/components/layout/AppShellGate";
import { getAppSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Certamen UNAC | Calificacion",
  description: "Sistema de calificacion para concurso de tunas universitarias — UNAC",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userEmail: string | null = null;
  let userRol: "admin" | "jurado" = "admin";
  let esPresidente = false;

  if (isSupabaseConfigured()) {
    try {
      const session = await getAppSession();
      userEmail = session.email;
      userRol = session.rol;
      esPresidente = session.esPresidente;
    } catch {
      userEmail = null;
    }
  } else {
    const session = await getAppSession();
    userRol = session.rol;
    esPresidente = session.esPresidente;
  }

  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-page-bg font-sans">
        <AppShellGate
          userEmail={userEmail}
          userRol={userRol}
          esPresidente={esPresidente}
        >
          {children}
        </AppShellGate>
      </body>
    </html>
  );
}
