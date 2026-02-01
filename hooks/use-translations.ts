"use client";

import { useEffect, useState } from "react";
import esMessages from "@/messages/es.json";
import enMessages from "@/messages/en.json";

type Locale = "es" | "en";
type Messages = typeof esMessages;

const messages: Record<Locale, Messages> = {
  es: esMessages,
  en: enMessages,
};

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return the key if not found
    }
  }

  return typeof current === "string" ? current : path;
}

/**
 * Hook to get translations based on current locale.
 * Usage: const t = useTranslations();
 *        t("sidebar.crear") → "Crear" or "Create"
 */
export function useTranslations() {
  const [locale, setLocale] = useState<Locale>("es");

  useEffect(() => {
    const saved = localStorage.getItem("luuc-locale") as Locale | null;
    if (saved && saved in messages) {
      setLocale(saved);
    }

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<Locale>;
      if (customEvent.detail in messages) {
        setLocale(customEvent.detail);
      }
    };

    window.addEventListener("locale-change", handler);
    return () => window.removeEventListener("locale-change", handler);
  }, []);

  const t = (key: string): string => {
    return getNestedValue(messages[locale] as unknown as Record<string, unknown>, key);
  };

  return t;
}
