"use client";

import { useEffect, useState } from "react";
import { FileText, Search, Clock, TrendingUp, Zap } from "lucide-react";

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

function formatDocType(slug: string): string {
  const labels: Record<string, string> = {
    generate: "Documento",
    generate_custom: "Documento personalizado",
    analyze: "Análisis de riesgos",
    "personal-declaration": "Declaración personal",
    "legal-argument": "Argumento legal",
    "evidence-summary": "Resumen de evidencia",
    "case-summary": "Resumen del caso",
    "cover-letter-uscis": "Cover letter USCIS",
    "cover-letter-consular": "Cover letter consular",
    "i360-vawa-cover-letter": "Cover letter VAWA",
    "i918-u-visa-cover-letter": "Cover letter U-Visa",
    "i589-cover-letter": "Cover letter I-589",
    "i130-cover-letter": "Cover letter I-130",
    "i485-cover-letter": "Cover letter I-485",
    "i751-cover-letter": "Cover letter I-751",
    "i129f-cover-letter": "Cover letter I-129F",
    "i765-cover-letter": "Cover letter I-765",
    "i131-cover-letter": "Cover letter I-131",
    "i539-cover-letter": "Cover letter I-539",
    "n400-cover-letter": "Cover letter N-400",
    "i485-245i-cover-letter": "Cover letter I-485 (245i)",
    "custom-immigration-cover-letter": "Cover letter (personalizada)",
    "certified-translation": "Traducción certificada",
    nda: "NDA",
    contrato: "Contrato",
    carta_correo: "Carta / Correo",
    acta_reunion: "Acta de reunión",
    politica_interna: "Política interna",
    performance_report: "Reporte de desempeño",
  };
  return labels[slug] || slug;
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
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Tu actividad</h2>
        {totalActions > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            {totalActions} {totalActions === 1 ? "acción total" : "acciones totales"}
          </div>
        )}
      </div>

      {/* Time saved — hero metric */}
      {data.timeSavedMinutes > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{formatTime(data.timeSavedMinutes)}</p>
            <p className="mt-0.5 text-[12px] text-blue-100">
              ahorrados en redacción — basado en tiempos del equipo paralegal
            </p>
          </div>
        </div>
      )}

      {/* Counts */}
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
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Este mes</p>
        </div>
      </div>

      {/* Recent activity */}
      {data.recentActivity.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Actividad reciente</p>
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
                <span className="flex-1 truncate">{formatDocType(item.title)}</span>
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
