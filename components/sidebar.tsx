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

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Redactar", href: "/dashboard/redactar", icon: FileText },
  { name: "Revisar", href: "/dashboard/revisar", icon: Search },
  { name: "Knowledge Base", href: "/dashboard/knowledge-base", icon: BookOpen },
  { name: "Documentos", href: "/dashboard/documentos", icon: FolderOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900">
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
              key={item.name}
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

        <Link
          href="/dashboard/configuracion"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <Settings className="h-5 w-5" />
          Configuración
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
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
