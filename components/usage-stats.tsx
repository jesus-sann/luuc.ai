"use client";

import { useEffect, useState } from "react";
import { FileText, Search, Calendar, Activity, Clock, Timer, TrendingUp } from "lucide-react";

interface UsageData {
  documentsGenerated: number;
  analysesCompleted: number;
  thisMonthDocuments: number;
  thisMonthAnalyses: number;
  timeSavedMinutes: number;
  recentActivity: { action: string; title: string; date: string }[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
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

  useEffect(() => {
    fetch("/api/usage/stats")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalActions = data.documentsGenerated + data.analysesCompleted;
  const thisMonthTotal = data.thisMonthDocuments + data.thisMonthAnalyses;

  const stats = [
    {
      label: "Documentos generados",
      value: data.documentsGenerated,
      icon: FileText,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Análisis completados",
      value: data.analysesCompleted,
      icon: Search,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Acciones este mes",
      value: thisMonthTotal,
      icon: Calendar,
      color: "text-violet-600 bg-violet-50 dark:bg-violet-950/30",
    },
    {
      label: "Tiempo ahorrado",
      value: formatTime(data.timeSavedMinutes),
      icon: Timer,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Tu actividad
        </h2>
        {totalActions > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            {totalActions} {totalActions === 1 ? "acción total" : "acciones totales"}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-100 p-3 dark:border-slate-700"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {s.value}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Efficiency insight */}
      {data.timeSavedMinutes > 0 && (
        <div className="mt-3 rounded-lg bg-gradient-to-r from-blue-50 to-emerald-50 px-4 py-2.5 dark:from-blue-950/20 dark:to-emerald-950/20">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Has ahorrado aproximadamente <span className="font-semibold text-blue-700 dark:text-blue-400">{formatTime(data.timeSavedMinutes)}</span> de trabajo manual con Luuc.ai
          </p>
        </div>
      )}

      {data.recentActivity.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            Actividad reciente
          </p>
          <div className="space-y-1.5">
            {data.recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300"
              >
                {item.action === "analyze" ? (
                  <Search className="h-3 w-3 flex-shrink-0 text-emerald-500" />
                ) : (
                  <FileText className="h-3 w-3 flex-shrink-0 text-blue-500" />
                )}
                <span className="flex-1 truncate">{item.title}</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="h-2.5 w-2.5" />
                  {timeAgo(item.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
