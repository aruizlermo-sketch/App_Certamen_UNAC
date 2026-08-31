import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShellGate } from "@/components/layout/AppShellGate";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getAppSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { THEME_STORAGE_KEY } from "@/lib/theme/storage";
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
    <html lang="es" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k="${THEME_STORAGE_KEY}";if(localStorage.getItem(k)==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-page-bg font-sans">
        <ThemeProvider>
          <AppShellGate
            userEmail={userEmail}
            userRol={userRol}
            esPresidente={esPresidente}
          >
            {children}
          </AppShellGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
