"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, DollarSign, Zap, BarChart3, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/breadcrumb";
import { useAuth } from "@/hooks/use-auth";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

interface DailyPoint {
  date: string;
  tokens: number;
  cost: number;
}

interface RecentCall {
  date: string;
  action: string;
  tokens: number;
  model: string;
  cost: number;
}

interface ActionStat {
  tokens: number;
  count: number;
}

interface TokenStats {
  lifetime: { tokens: number; cost: number };
  thisMonth: { tokens: number; cost: number };
  byAction: Record<string, ActionStat>;
  dailyUsage: DailyPoint[];
  recentCalls: RecentCall[];
  isCompanyView: boolean;
  pricingNote: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  generate: "Generación de documentos",
  custom_generate: "Generación personalizada",
  analyze: "Análisis de documentos",
};

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtCost(usd: number): string {
  if (usd < 0.01) return "< $0.01";
  return `$${usd.toFixed(2)}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Sparkline (inline SVG bar chart — no external lib needed)
// ────────────────────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: DailyPoint[] }) {
  if (!data.length) return null;

  const W = 600;
  const H = 80;
  const pad = 4;
  const max = Math.max(...data.map((d) => d.tokens), 1);
  const barW = Math.max(2, (W - pad * 2) / data.length - 2);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-20"
      aria-label="Gráfica de uso diario de tokens"
    >
      {data.map((d, i) => {
        const barH = Math.max(2, ((d.tokens / max) * (H - pad * 2)));
        const x = pad + i * ((W - pad * 2) / data.length);
        const y = H - pad - barH;
        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={2}
              className="fill-blue-500 dark:fill-blue-400 opacity-80 hover:opacity-100 transition-opacity"
            />
            <title>{`${d.date}: ${fmtTokens(d.tokens)} tokens`}</title>
          </g>
        );
      })}
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default function TokensPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/usage/tokens");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || "Error cargando datos");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const isAdmin = user?.role === "owner" || user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/configuracion">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Configuración
          </Button>
        </Link>
      </div>

      <Breadcrumb
        items={[
          { label: "Configuración", href: "/dashboard/configuracion" },
          { label: "Consumo de API" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-blue-500" />
            Consumo de API Anthropic
          </h1>
          <p className="text-slate-500 mt-1">
            {stats?.isCompanyView
              ? "Vista de empresa — consumo total del equipo"
              : "Tu consumo personal de tokens"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !stats && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      )}

      {stats && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  Tokens totales (histórico)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {fmtTokens(stats.lifetime.tokens)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  ≈ {fmtCost(stats.lifetime.cost)} USD estimado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Este mes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {fmtTokens(stats.thisMonth.tokens)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  ≈ {fmtCost(stats.thisMonth.cost)} USD estimado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Costo promedio por llamada
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const totalCalls = Object.values(stats.byAction).reduce((s, a) => s + a.count, 0);
                  const avgCost = totalCalls > 0 ? stats.lifetime.cost / totalCalls : 0;
                  const avgTokens = totalCalls > 0 ? stats.lifetime.tokens / totalCalls : 0;
                  return (
                    <>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {fmtCost(avgCost)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        ≈ {fmtTokens(Math.round(avgTokens))} tokens · {totalCalls.toLocaleString()} llamadas totales
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Daily chart */}
          {stats.dailyUsage.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Uso diario — últimos 30 días</CardTitle>
                <CardDescription>Tokens consumidos por día. Pasa el cursor sobre las barras para ver el detalle.</CardDescription>
              </CardHeader>
              <CardContent>
                <Sparkline data={stats.dailyUsage} />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>{stats.dailyUsage[0]?.date}</span>
                  <span>{stats.dailyUsage[stats.dailyUsage.length - 1]?.date}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* By action */}
          {Object.keys(stats.byAction).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consumo por tipo de operación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byAction)
                    .sort(([, a], [, b]) => b.tokens - a.tokens)
                    .map(([action, stat]) => {
                      const pct = stats.lifetime.tokens > 0
                        ? Math.round((stat.tokens / stats.lifetime.tokens) * 100)
                        : 0;
                      return (
                        <div key={action}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 dark:text-slate-300">
                              {ACTION_LABELS[action] || action}
                            </span>
                            <span className="text-slate-500">
                              {fmtTokens(stat.tokens)} · {stat.count} llamadas · ≈{fmtCost(tokensToCost(stat.tokens))}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent calls */}
          {stats.recentCalls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Llamadas recientes con tokens registrados</CardTitle>
                <CardDescription>
                  Solo se muestran llamadas con tokens &gt; 0. Las llamadas antes de esta actualización
                  pueden aparecer con 0 tokens.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                        <th className="pb-2 font-medium text-slate-500">Fecha</th>
                        <th className="pb-2 font-medium text-slate-500">Operación</th>
                        <th className="pb-2 font-medium text-slate-500 text-right">Tokens</th>
                        <th className="pb-2 font-medium text-slate-500 text-right">Costo est.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {stats.recentCalls.map((call, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-2 text-slate-500 whitespace-nowrap">{fmtDate(call.date)}</td>
                          <td className="py-2 text-slate-700 dark:text-slate-300">
                            {ACTION_LABELS[call.action] || call.action}
                          </td>
                          <td className="py-2 text-right font-mono text-slate-700 dark:text-slate-300">
                            {fmtTokens(call.tokens)}
                          </td>
                          <td className="py-2 text-right font-mono text-slate-500">
                            {fmtCost(call.cost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {stats.lifetime.tokens === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <Cpu className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="font-medium">No hay datos de consumo todavía</p>
                <p className="text-sm mt-1">
                  Los tokens se registran a partir de ahora en cada llamada al API.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pricing note */}
          <p className="text-xs text-slate-400 text-center pb-4">{stats.pricingNote}</p>
        </>
      )}
    </div>
  );
}

// Helper used inside the component (defined outside JSX to avoid re-creation)
function tokensToCost(tokens: number): number {
  const BLENDED_COST_PER_M = 3.0 * 0.6 + 15.0 * 0.4;
  return (tokens / 1_000_000) * BLENDED_COST_PER_M;
}
