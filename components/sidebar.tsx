"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Search,
  FolderOpen,
  Home,
  LogOut,
  Settings,
  Loader2,
  User,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslations } from "@/hooks/use-translations";

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const t = useTranslations();

  const navigation = [
    { name: t("sidebar.dashboard"), href: "/dashboard", icon: Home },
    { name: t("sidebar.crear"), href: "/dashboard/crear", icon: FileText },
    { name: t("sidebar.revisar"), href: "/dashboard/revisar", icon: Search },
    { name: t("sidebar.knowledgeBase"), href: "/dashboard/knowledge-base", icon: BookOpen },
    { name: t("sidebar.documentos"), href: "/dashboard/documentos", icon: FolderOpen },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 dark:bg-slate-950 dark:border-r dark:border-slate-800">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-lg font-bold text-white">L</span>
          </div>
          <span className="text-xl font-bold text-white">Luuc.ai</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-700 p-3">
        {/* User Info */}
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
              <User className="h-4 w-4 text-slate-300" />
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-white">
                {user.user_metadata?.full_name || "Usuario"}
              </p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
        )}

        <ThemeToggle />
        <LanguageToggle />

        <Link
          href="/dashboard/configuracion"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <Settings className="h-5 w-5" />
          {t("sidebar.configuracion")}
        </Link>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
          {t("sidebar.cerrarSesion")}
        </button>
      </div>
    </div>
  );
}
