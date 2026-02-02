"use client";

import { Languages } from "lucide-react";
import { useEffect, useState } from "react";

const LOCALES = {
  es: "Español",
  en: "English",
} as const;

type Locale = keyof typeof LOCALES;

export function LanguageToggle({ variant = "sidebar" }: { variant?: "sidebar" | "compact" }) {
  const [locale, setLocale] = useState<Locale>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("luuc-locale") as Locale | null;
    if (saved && saved in LOCALES) {
      setLocale(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  if (!mounted) return null;

  const toggleLocale = () => {
    const next: Locale = locale === "es" ? "en" : "es";
    setLocale(next);
    localStorage.setItem("luuc-locale", next);
    document.documentElement.lang = next;
    // Dispatch custom event so other components can react
    window.dispatchEvent(new CustomEvent("locale-change", { detail: next }));
  };

  if (variant === "compact") {
    return (
      <button
        onClick={toggleLocale}
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label={`Cambiar idioma a ${locale === "es" ? "English" : "Español"}`}
      >
        <span className="text-xs font-semibold uppercase">{locale}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLocale}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      aria-label={`Cambiar idioma a ${locale === "es" ? "English" : "Español"}`}
    >
      <Languages className="h-5 w-5" />
      {LOCALES[locale]}
    </button>
  );
}

/**
 * Hook to get the current locale
 */
export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>("es");

  useEffect(() => {
    const saved = localStorage.getItem("luuc-locale") as Locale | null;
    if (saved && saved in LOCALES) {
      setLocale(saved);
    }

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<Locale>;
      setLocale(customEvent.detail);
    };

    window.addEventListener("locale-change", handler);
    return () => window.removeEventListener("locale-change", handler);
  }, []);

  return locale;
}
