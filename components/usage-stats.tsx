"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Search, Clock, TrendingUp, Zap, Users, BarChart3, ArrowRight } from "lucide-react";

interface RecentItem {
  action: string;
  title: string;
  docType: string;
  date: string;
  id: string;
}

interface DocTypeCount {
  label: string;
  count: number;
}

interface TimeSavedCategory {
  category: string;
  minutes: number;
}

interface UsageData {
  documentsGenerated: number;
  analysesCompleted: number;
  thisMonthDocuments: number;
  thisMonthAnalyses: number;
  timeSavedMinutes: number;
  thisMonthTimeSavedMinutes: number;
  timeSavedByCategory: TimeSavedCategory[];
  estimatedCostSavedUSD: number;
  recentActivity: RecentItem[];
  topDocTypes: DocTypeCount[];
  uniqueUsers: number;
  monthLabel: string;
  isCompanyScope: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months > 1 ? "es" : ""}`;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function UsageStats() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/usage/stats")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Tu actividad</h2>
        <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
          No se pudo cargar la actividad. Recarga la página para intentarlo de nuevo.
        </p>
      </div>
    );
  }

  const totalActions = data.documentsGenerated + data.analysesCompleted;
  const maxCount = data.topDocTypes[0]?.count ?? 1;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {data.isCompanyScope ? "Actividad del equipo" : "Tu actividad"}
          </h2>
          {data.isCompanyScope && data.uniqueUsers > 1 && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
              <Users className="h-3 w-3" />
              {data.uniqueUsers} colaboradores
            </p>
          )}
        </div>
        {totalActions > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            {totalActions} {totalActions === 1 ? "documento total" : "documentos totales"}
          </div>
        )}
      </div>

      {/* Time saved — hero metric */}
      {data.timeSavedMinutes > 0 && (
        <div className="mb-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
          {/* Top row: total + cost */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <p className="text-2xl font-bold leading-none">{formatTime(data.timeSavedMinutes)}</p>
                <span className="text-sm font-medium text-blue-200">ahorrados en redacción</span>
              </div>
              <p className="mt-0.5 text-[11px] text-blue-200/80">
                Estimado según tiempos declarados del equipo paralegal
              </p>
            </div>
            {/* Cost equivalent */}
            {data.estimatedCostSavedUSD > 0 && (
              <div className="flex-shrink-0 rounded-lg bg-white/15 px-3 py-2 text-right">
                <p className="text-lg font-bold leading-none">
                  ${data.estimatedCostSavedUSD.toLocaleString("en-US")}
                </p>
                <p className="mt-0.5 text-[10px] text-blue-200">ahorro estimado</p>
                <p className="text-[9px] text-blue-200/70">@ $65/hr paralegal</p>
              </div>
            )}
          </div>

          {/* Sub-stats row */}
          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/20 pt-3">
            {/* This month */}
            {data.thisMonthTimeSavedMinutes > 0 && (
              <div className="rounded-md bg-white/10 px-2.5 py-1.5">
                <p className="text-[10px] text-blue-200/80 capitalize">{data.monthLabel}</p>
                <p className="text-sm font-semibold leading-none">{formatTime(data.thisMonthTimeSavedMinutes)}</p>
              </div>
            )}
            {/* Per category */}
            {data.timeSavedByCategory.map((c) => (
              <div key={c.category} className="rounded-md bg-white/10 px-2.5 py-1.5">
                <p className="text-[10px] text-blue-200/80">{c.category}</p>
                <p className="text-sm font-semibold leading-none">{formatTime(c.minutes)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-700">
          <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.documentsGenerated}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Documentos generados</p>
        </div>

        <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-700">
          <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
            <Search className="h-3.5 w-3.5" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.analysesCompleted}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Análisis completados</p>
        </div>

        <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-700">
          <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/30">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {data.thisMonthDocuments + data.thisMonthAnalyses}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
            {data.monthLabel}
          </p>
        </div>
      </div>

      {/* Document type breakdown */}
      {data.topDocTypes.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tipos más generados</p>
          </div>
          <div className="space-y-2">
            {data.topDocTypes.map((t) => (
              <div key={t.label} className="flex items-center gap-2">
                <span className="w-36 flex-shrink-0 truncate text-[11px] text-slate-600 dark:text-slate-300">
                  {t.label}
                </span>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${Math.round((t.count / maxCount) * 100)}%` }}
                    />
                  </div>
                  <span className="w-4 text-right text-[11px] font-medium text-slate-500">{t.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {data.recentActivity.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Documentos recientes</p>
            <Link
              href="/dashboard/documentos"
              className="flex items-center gap-0.5 text-[11px] text-blue-600 hover:underline dark:text-blue-400"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {data.recentActivity.map((item, i) => (
              <Link
                key={i}
                href="/dashboard/documentos"
                className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <FileText className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-700 dark:text-slate-200">{item.title}</p>
                  <p className="text-[10px] text-slate-400">{item.docType}</p>
                </div>
                <span className="flex-shrink-0 text-[11px] text-slate-400">{timeAgo(item.date)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
