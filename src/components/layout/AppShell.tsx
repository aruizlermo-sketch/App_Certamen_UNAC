"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logoutAction } from "@/app/login/actions";
import { BrandHeader } from "@/components/brand/BrandMark";
import {
  IconChart,
  IconClipboard,
  IconGauge,
  IconMenu,
  IconStar,
  IconTrophy,
  IconUser,
  IconUsers,
} from "@/components/icons/AppIcons";

import type { UserRol } from "@/types/certamen";

type AppShellProps = {
  children: ReactNode;
  userEmail?: string | null;
  userRol?: UserRol;
};

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const topItem: NavItem = {
  href: "/",
  label: "Inicio",
  icon: <IconGauge className="h-4 w-4" />,
};

const adminNavGroups: NavGroup[] = [
  {
    title: "Concurso",
    items: [
      { href: "/admin", label: "Configuracion", icon: <IconClipboard className="h-4 w-4" /> },
      { href: "/jurado", label: "Calificar", icon: <IconStar className="h-4 w-4" /> },
      { href: "/resultados", label: "Resultados", icon: <IconTrophy className="h-4 w-4" /> },
    ],
  },
  {
    title: "Consultas",
    items: [
      { href: "/admin/participantes", label: "Participantes", icon: <IconUsers className="h-4 w-4" /> },
      { href: "/admin/jurados", label: "Jurados", icon: <IconUser className="h-4 w-4" /> },
      { href: "/admin/categorias", label: "Categorias", icon: <IconChart className="h-4 w-4" /> },
    ],
  },
];

const juradoNavGroups: NavGroup[] = [
  {
    title: "Concurso",
    items: [
      { href: "/jurado", label: "Calificar", icon: <IconStar className="h-4 w-4" /> },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-brand text-unac-navy font-semibold"
          : "text-white/75 hover:bg-sidebar-hover hover:text-white"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-md ${
          active ? "bg-unac-navy/10" : "bg-white/5"
        }`}
      >
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

function pageTitle(pathname: string) {
  if (pathname === "/") return "Inicio";
  if (pathname.startsWith("/admin/participantes")) return "Participantes";
  if (pathname.startsWith("/admin/jurados")) return "Jurados";
  if (pathname.startsWith("/admin/categorias")) return "Categorias";
  if (pathname.startsWith("/admin")) return "Configuracion";
  if (pathname.startsWith("/jurado")) return "Calificacion";
  if (pathname.startsWith("/resultados")) return "Resultados";
  return "Certamen UNAC";
}

export function AppShell({ children, userEmail, userRol = "admin" }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isJurado = userRol === "jurado";
  const navGroups = isJurado ? juradoNavGroups : adminNavGroups;

  return (
    <div className="min-h-full bg-page-bg">
      {/* Top bar estilo UNAC */}
      <div className="top-bar hidden items-center justify-between px-6 py-2 lg:flex">
        <p>Universidad Nacional del Callao — Sistema de Calificacion</p>
        <p className="text-white/70">unac.edu.pe</p>
      </div>

      <div className="flex min-h-[calc(100vh-36px)]">
        {open ? (
          <button
            type="button"
            aria-label="Cerrar menu"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-white transition-transform lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="border-b border-white/10 px-3 pb-5 pt-6">
            <div className="px-3">
              <BrandHeader />
            </div>
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
            {!isJurado ? (
              <NavLink
                item={topItem}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            ) : null}

            {navGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      onNavigate={() => setOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="space-y-3 border-t border-white/10 px-5 py-4">
            {userEmail ? (
              <div className="flex items-center gap-2 text-xs text-white/55">
                <IconUser className="h-4 w-4 shrink-0" />
                <p className="truncate" title={userEmail}>
                  {userEmail}
                </p>
              </div>
            ) : null}
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full rounded-md border border-white/15 px-3 py-2 text-left text-xs font-semibold text-white/80 transition hover:bg-sidebar-hover hover:text-white"
              >
                Cerrar sesion
              </button>
            </form>
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} UNAC
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-white px-4 py-4 shadow-sm sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Abrir menu"
                className="rounded-md border border-border bg-white p-2.5 text-text lg:hidden"
                onClick={() => setOpen(true)}
              >
                <IconMenu className="h-5 w-5" />
              </button>
              <div className="section-heading">
                <p className="section-eyebrow">Panel</p>
                <h1 className="text-lg font-bold text-text">
                  {pageTitle(pathname)}
                </h1>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
