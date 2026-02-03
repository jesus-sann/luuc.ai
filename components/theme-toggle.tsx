"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/use-translations";

export function ThemeToggle({ variant = "sidebar" }: { variant?: "sidebar" | "compact" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  if (variant === "compact") {
    return (
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      {isDark ? t("sidebar.modoClaro") : t("sidebar.modoOscuro")}
    </button>
  );
}
