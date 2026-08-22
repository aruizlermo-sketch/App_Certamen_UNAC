"use client";

import { IconMoon, IconSun } from "@/components/icons/AppIcons";
import { useTheme } from "@/components/theme/ThemeProvider";

type ThemeToggleProps = {
  className?: string;
  showLabel?: boolean;
  inverse?: boolean;
};

export function ThemeToggle({
  className = "",
  showLabel = true,
  inverse = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const baseClass = inverse
    ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
    : "border-border bg-card text-text hover:bg-page-bg";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${baseClass} ${className}`}
    >
      {isDark ? (
        <IconSun className="h-4 w-4 shrink-0" />
      ) : (
        <IconMoon className="h-4 w-4 shrink-0" />
      )}
      {showLabel ? (
        <span className="hidden sm:inline">
          {isDark ? "Modo claro" : "Modo oscuro"}
        </span>
      ) : null}
    </button>
  );
}
