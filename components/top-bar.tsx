"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LanguageToggle } from "@/components/language-toggle";

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <div className="hidden h-12 flex-shrink-0 items-center justify-end gap-2 border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-gray-900 lg:flex">
      <LanguageToggle variant="compact" />
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label="Toggle theme"
      >
        {mounted ? (
          isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
        ) : (
          <div className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
