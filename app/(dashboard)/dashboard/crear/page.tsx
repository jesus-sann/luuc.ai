"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { templates } from "@/lib/templates";
import { TemplateCard } from "@/components/template-card";
import { useTranslations } from "@/hooks/use-translations";

// Immigration first, then other categories alphabetically
const CATEGORY_ORDER = ["Inmigración"];

const rawGrouped = templates.reduce((acc, template) => {
  if (!acc[template.category]) acc[template.category] = [];
  acc[template.category].push(template);
  return acc;
}, {} as Record<string, typeof templates>);

const groupedTemplates = Object.fromEntries(
  [
    ...CATEGORY_ORDER.filter((c) => rawGrouped[c]).map((c) => [c, rawGrouped[c]]),
    ...Object.entries(rawGrouped).filter(([c]) => !CATEGORY_ORDER.includes(c)),
  ]
);

export default function CrearPage() {
  const t = useTranslations();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
          {t("crear.badge")}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("crear.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("crear.description")}
        </p>
      </div>

      {/* Custom Creation — Featured Card */}
      <Link href="/dashboard/crear/personalizado">
        <div className="mb-10 flex items-center gap-4 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-white p-5 transition-all hover:border-purple-300 hover:shadow-md dark:border-purple-800 dark:from-purple-950/30 dark:via-blue-950/20 dark:to-slate-900">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {t("crear.custom")}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {t("crear.customDescription")}
            </p>
          </div>
          <div className="hidden items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 sm:flex">
            {t("crear.start")}
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>

      {/* Grouped Templates */}
      <div className="space-y-10">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
          const isImmigration = category === "Inmigración";
          const displayName = isImmigration ? "Immigration Documents" : category;
          return (
            <div key={category}>
              <div className="mb-4 flex items-center gap-3">
                {isImmigration && (
                  <span className="inline-flex items-center rounded-full bg-blue-900 px-2.5 py-0.5 text-xs font-semibold text-blue-200">
                    AGC Firm
                  </span>
                )}
                <h2 className={`text-sm font-semibold uppercase tracking-wider ${isImmigration ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                  {displayName}
                </h2>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(categoryTemplates as typeof templates).map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
