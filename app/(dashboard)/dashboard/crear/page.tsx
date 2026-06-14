"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Mail } from "lucide-react";
import { templates, IMMIGRATION_COVER_LETTER_SLUGS } from "@/lib/templates";
import { TemplateCard } from "@/components/template-card";
import { CoverLetterSelectorModal } from "@/components/cover-letter-selector-modal";
import { useTranslations } from "@/hooks/use-translations";

// Immigration first, then translation, then other categories alphabetically
const CATEGORY_ORDER = ["Inmigración", "Immigration — Translation"];

/**
 * Build the grouped template map at module level.
 * IMMIGRATION_COVER_LETTER_SLUGS templates are filtered OUT here because
 * they are represented by a single synthetic "grouped" card in the gallery.
 * This keeps the Inmigración section from flooding with 13 near-identical cards.
 */
const slugSet = new Set<string>(IMMIGRATION_COVER_LETTER_SLUGS);

const rawGrouped = templates.reduce((acc, template) => {
  // Exclude the individual cover letter templates — they appear as one grouped card
  if (slugSet.has(template.slug)) return acc;
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
  const router = useRouter();

  // Controls visibility of the case-type selector modal
  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false);

  // When the user picks a case type, navigate straight to the wizard for that slug.
  // Navigation pattern matches TemplateCard: /dashboard/crear/{slug}
  function handleCoverLetterSelect(slug: string) {
    router.push(`/dashboard/crear/${slug}`);
  }

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
                {/*
                 * Render individual template cards for non-cover-letter templates.
                 * The cover letter group injects a single synthetic card below.
                 */}
                {(categoryTemplates as typeof templates).map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}

                {/*
                 * Grouped Cover Letter card — only injected into the Inmigración section.
                 * Clicking it opens the CoverLetterSelectorModal instead of navigating
                 * directly to a template wizard. The count badge signals to María that
                 * this is a multi-type entry point.
                 */}
                {isImmigration && (
                  <button
                    type="button"
                    onClick={() => setCoverLetterModalOpen(true)}
                    className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-800"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-blue-100">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            Cover Letters de Inmigración
                          </h3>
                          {/* Count badge: lets María know this isn't a single-form template */}
                          <span className="shrink-0 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            13 tipos
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          I-751, I-485, I-130, VAWA, U-Visa, Asilo y más — 13 tipos de caso
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center gap-2 pt-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                        <Mail className="h-3 w-3" />
                        Cover Letter
                      </span>
                      <span>·</span>
                      <span>Selecciona el tipo</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Case-type selector modal — rendered once at the page level, not per-card,
          to avoid duplicate DOM nodes and portal stacking issues. */}
      <CoverLetterSelectorModal
        open={coverLetterModalOpen}
        onClose={() => setCoverLetterModalOpen(false)}
        onSelect={handleCoverLetterSelect}
      />
    </div>
  );
}
