"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

import type { UserRol } from "@/types/certamen";

type AppShellGateProps = {
  children: ReactNode;
  userEmail?: string | null;
  userRol?: UserRol;
  esPresidente?: boolean;
};

export function AppShellGate({
  children,
  userEmail,
  userRol = "admin",
  esPresidente = false,
}: AppShellGateProps) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <AppShell
      userEmail={userEmail}
      userRol={userRol}
      esPresidente={esPresidente}
    >
      {children}
    </AppShell>
  );
}
