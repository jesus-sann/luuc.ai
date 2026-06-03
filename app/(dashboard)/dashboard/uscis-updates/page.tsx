"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Globe, ExternalLink, AlertTriangle, FileText, Clock, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface USCISUpdate {
  id: string;
  title: string;
  summary: string;
  category: "Policy Change" | "Fee Update" | "Form Revision" | "Processing Time" | "Alert";
  effective_date: string | null;
  source_url: string | null;
  is_pinned: boolean;
  created_at: string;
}

const CATEGORIES = ["All", "Policy Change", "Fee Update", "Form Revision", "Processing Time", "Alert"] as const;
type CategoryFilter = typeof CATEGORIES[number];

const CATEGORY_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  "Policy Change":   { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",    icon: Globe },
  "Fee Update":      { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", icon: DollarSign },
  "Form Revision":   { color: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300", icon: FileText },
  "Processing Time": { color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",    icon: Clock },
  "Alert":           { color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",         icon: AlertTriangle },
};

function UpdateSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="mb-2 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-700/50" />
      <div className="mt-1 h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-700/50" />
    </div>
  );
}

export default function USCISUpdatesPage() {
  const [updates, setUpdates] = useState<USCISUpdate[]>([]);
  const [total, setTotal] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>("All");

  const fetchUpdates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/uscis-updates");
      const data = await res.json();
      if (data.success) {
        setUpdates(data.data.updates);
        setTotal(data.data.total);
        setLastRefreshed(data.data.last_refreshed);
      }
    } catch {
      setError("Failed to load updates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUpdates(); }, [fetchUpdates]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/uscis-updates", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchUpdates();
      } else {
        setError(data.error || "Refresh failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = category === "All" ? updates : updates.filter((u) => u.category === category);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header banner — AGC navy */}
      <div className="overflow-hidden rounded-2xl bg-[#0f2044]">
        <div className="px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-300" />
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                  USCIS Intelligence
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">USCIS Updates</h1>
              <p className="mt-1 text-sm text-blue-200/70">
                AI-curated feed of recent USCIS policy changes, fee updates, and alerts.
                {lastRefreshed && (
                  <span className="ml-2 text-blue-300/60">Last updated {timeAgo(lastRefreshed)}</span>
                )}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex-shrink-0 gap-2 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Fetching…" : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto border-t border-white/10 px-8 py-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-white text-[#0f2044]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => <UpdateSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 inline-flex rounded-full bg-slate-100 p-4 dark:bg-slate-700">
            <Globe className="h-8 w-8 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-900 dark:text-white">No updates yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Click <strong>Refresh</strong> to fetch the latest USCIS updates.
          </p>
          <Button onClick={handleRefresh} disabled={refreshing} className="mt-4 gap-2 bg-[#0f2044] text-white hover:bg-[#1a3566]">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Fetching…" : "Get Updates"}
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? "update" : "updates"}
            {category !== "All" && ` in ${category}`}
            {total > filtered.length && ` (${total} total)`}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((update) => {
              const cfg = CATEGORY_CONFIG[update.category] ?? CATEGORY_CONFIG["Alert"];
              const CatIcon = cfg.icon;
              return (
                <Card
                  key={update.id}
                  className={`overflow-hidden border transition-shadow hover:shadow-md ${
                    update.is_pinned ? "border-[#0f2044]/30 dark:border-blue-800" : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                        <CatIcon className="h-3 w-3" />
                        {update.category}
                      </span>
                      {update.effective_date && (
                        <span className="text-xs text-slate-400">
                          Effective {formatDate(update.effective_date)}
                        </span>
                      )}
                    </div>

                    <h3 className="mb-2 font-semibold leading-snug text-slate-900 dark:text-white">
                      {update.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {update.summary}
                    </p>

                    {update.source_url && (
                      <a
                        href={update.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#0f2044] hover:underline dark:text-blue-400"
                      >
                        uscis.gov
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    <p className="mt-3 text-[10px] text-slate-400">{timeAgo(update.created_at)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
