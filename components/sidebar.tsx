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
  User as UserIcon,
  BookOpen,
  Zap,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/hooks/use-translations";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

function TrialSection({ user }: { user: User }) {
  const trialEndsAt = user.user_metadata?.trial_ends_at;
  const currentPlan = (user.user_metadata?.plan as string) || "free";

  // Show upgrade button for free users
  if (currentPlan === "free" || !trialEndsAt) {
    return (
      <div className="px-3 pb-3">
        <Link
          href="/dashboard/configuracion/planes"
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2.5 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700"
        >
          <Zap className="h-4 w-4" />
          Actualizar Plan
        </Link>
      </div>
    );
  }

  const trialEnd = new Date(trialEndsAt);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isExpired = daysLeft === 0;

  if (isExpired) {
    return (
      <div className="px-3 pb-3">
        <div className="rounded-lg bg-red-900/50 p-3">
          <p className="text-xs font-medium text-red-300">Prueba expirada</p>
          <Link
            href="/dashboard/configuracion/planes"
            className="mt-2 flex items-center justify-center gap-1.5 rounded bg-red-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            <Zap className="h-3 w-3" />
            Actualizar ahora
          </Link>
        </div>
      </div>
    );
  }

  const urgencyColor = daysLeft <= 3 ? "text-orange-400" : daysLeft <= 7 ? "text-yellow-400" : "text-blue-400";
  const bgColor = daysLeft <= 3 ? "bg-orange-900/30" : daysLeft <= 7 ? "bg-yellow-900/30" : "bg-blue-900/30";

  return (
    <div className="px-3 pb-3">
      <div className={`rounded-lg ${bgColor} p-3`}>
        <p className={`text-xs font-medium ${urgencyColor}`}>
          {daysLeft} {daysLeft === 1 ? "día" : "días"} de prueba
        </p>
        <p className="mt-0.5 text-[10px] text-slate-400">
          Plan {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
        </p>
        <Link
          href="/dashboard/configuracion/planes"
          className="mt-2 flex items-center justify-center gap-1.5 rounded bg-slate-700 px-2 py-1.5 text-xs font-medium text-white hover:bg-slate-600"
        >
          <Zap className="h-3 w-3" />
          Ver planes
        </Link>
      </div>
    </div>
  );
}

function useFirmBranding() {
  const [firm, setFirm] = useState<{ name: string; logo_url: string | null; primary_color: string } | null>(null);
  useEffect(() => {
    fetch("/api/company/setup")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setFirm({ name: d.data.name, logo_url: d.data.logo_url || null, primary_color: d.data.primary_color || "#0f2044" });
        }
      })
      .catch(() => {});
  }, []);
  return firm;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const t = useTranslations();
  const firm = useFirmBranding();
  const [signingOut, setSigningOut] = useState(false);

  const navigation = [
    { name: t("sidebar.dashboard"), href: "/dashboard", icon: Home, tourId: null },
    { name: t("sidebar.crear"), href: "/dashboard/crear", icon: FileText, tourId: "create" },
    { name: t("sidebar.revisar"), href: "/dashboard/revisar", icon: Search, tourId: "review" },
    { name: t("sidebar.knowledgeBase"), href: "/dashboard/knowledge-base", icon: BookOpen, tourId: "knowledge" },
    { name: t("sidebar.documentos"), href: "/dashboard/documentos", icon: FolderOpen, tourId: null },
    { name: "USCIS Updates", href: "/dashboard/uscis-updates", icon: Globe, tourId: null },
  ];

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 dark:bg-slate-950 dark:border-r dark:border-slate-800">
      {/* Logo / Firm branding */}
      <div className="flex h-16 flex-col justify-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          {firm?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={firm.logo_url} alt={firm.name} className="h-7 max-w-[140px] object-contain" />
          ) : (
            <>
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: firm?.primary_color || "#2563eb" }}
              >
                <span className="text-sm font-bold text-white">
                  {firm?.name ? firm.name[0].toUpperCase() : "L"}
                </span>
              </div>
              <span className="truncate text-[15px] font-bold text-white">
                {firm?.name || "Luuc.ai"}
              </span>
            </>
          )}
        </Link>
        <p className="mt-0.5 pl-9 text-[9px] font-medium uppercase tracking-widest text-slate-500">
          Powered by Luuc.ai
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.tourId || undefined}
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

      {/* Trial Banner / Upgrade */}
      {user && <TrialSection user={user} />}

      {/* Bottom section */}
      <div className="border-t border-slate-700 p-3">
        {/* User Info */}
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
              <UserIcon className="h-4 w-4 text-slate-300" />
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
          {t("sidebar.configuracion")}
        </Link>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          {signingOut ? (
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
