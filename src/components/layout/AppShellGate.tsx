"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

import type { UserRol } from "@/types/certamen";

type AppShellGateProps = {
  children: ReactNode;
  userEmail?: string | null;
  userRol?: UserRol;
};

export function AppShellGate({ children, userEmail, userRol = "admin" }: AppShellGateProps) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <AppShell userEmail={userEmail} userRol={userRol}>
      {children}
    </AppShell>
  );
}
