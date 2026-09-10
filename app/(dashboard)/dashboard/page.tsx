"use client";

import Link from "next/link";
import {
  FileText,
  Search,
  BookOpen,
  ArrowRight,
  Shield,
  Sparkles,
  FileSignature,
  Mail,
  Globe,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LegalChat } from "@/components/legal-chat";
import { UsageStats } from "@/components/usage-stats";
import { useTranslations } from "@/hooks/use-translations";

// Hardcoded template categories for the "Documentos que puedes crear" showcase.
// Intentionally decoupled from lib/templates.ts so this display layer
// can evolve independently without pulling in the full template registry.
const DOCUMENT_CATEGORIES: {
  name: string;
  icon: React.ElementType<{ className?: string }>;
  colorKey: string;
  featured: boolean;
  docs: { label: string; href: string }[];
  seeAllHref: string | undefined;
  seeAllLabel: string | undefined;
}[] = [
  {
    name: "Contratos y Acuerdos",
    icon: FileSignature,
    colorKey: "blue",
    featured: false,
    docs: [
      {
        label: "NDA / Acuerdo de Confidencialidad",
        href: "/dashboard/crear/nda",
      },
      { label: "Contrato", href: "/dashboard/crear/contrato" },
    ],
    seeAllHref: undefined,
    seeAllLabel: undefined,
  },
  {
    name: "Comunicaciones Formales",
    icon: Mail,
    colorKey: "emerald",
    featured: false,
    docs: [
      {
        label: "Carta / Correo Electrónico",
        href: "/dashboard/crear/carta_correo",
      },
      { label: "Acta de Reunión", href: "/dashboard/crear/acta_reunion" },
    ],
    seeAllHref: undefined,
    seeAllLabel: undefined,
  },
  {
    name: "Políticas y Normativas",
    icon: Shield,
    colorKey: "purple",
    featured: false,
    docs: [
      { label: "Política Interna", href: "/dashboard/crear/politica_interna" },
    ],
    seeAllHref: undefined,
    seeAllLabel: undefined,
  },
  {
    name: "Reportes y Evaluaciones",
    icon: BarChart3,
    colorKey: "amber",
    featured: false,
    docs: [
      {
        label: "Reporte de Desempeño",
        href: "/dashboard/crear/performance_report",
      },
    ],
    seeAllHref: undefined,
    seeAllLabel: undefined,
  },
  {
    // Immigration is the primary use case for the pilot firm AGC Immigration —
    // give it a distinct indigo treatment and a "Piloto AGC" badge so it reads
    // as the hero category at a glance (Clarity over cleverness).
    name: "Inmigración (EE.UU.)",
    icon: Globe,
    colorKey: "indigo",
    featured: true,
    docs: [
      {
        label: "Cover Letter Consular",
        href: "/dashboard/crear/cover-letter-consular",
      },
      {
        label: "Cover Letter USCIS",
        href: "/dashboard/crear/cover-letter-uscis",
      },
      {
        label: "Personal Declaration",
        href: "/dashboard/crear/personal-declaration",
      },
      {
        label: "Legal Argument Brief",
        href: "/dashboard/crear/legal-argument",
      },
      { label: "Evidence Summary", href: "/dashboard/crear/evidence-summary" },
    ],
    // 20 immigration templates total; surface 5 here and link to the full grid
    seeAllHref: "/dashboard/crear",
    seeAllLabel: "+ 19 más",
  },
];

// Color tokens per category — defined as complete Tailwind strings so
// the class scanner can pick them up at build time (no dynamic interpolation).
const CAT_COLOR_MAP: Record<
  string,
  {
    iconBg: string;
    iconText: string;
    cardBorder: string;
    cardBg: string;
    chipBase: string;
    chipHover: string;
  }
> = {
  blue: {
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconText: "text-blue-600 dark:text-blue-400",
    cardBorder: "",
    cardBg: "",
    chipBase:
      "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    chipHover:
      "hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-400",
  },
  emerald: {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconText: "text-emerald-600 dark:text-emerald-400",
    cardBorder: "",
    cardBg: "",
    chipBase:
      "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    chipHover:
      "hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400",
  },
  purple: {
    iconBg: "bg-purple-50 dark:bg-purple-950/40",
    iconText: "text-purple-600 dark:text-purple-400",
    cardBorder: "",
    cardBg: "",
    chipBase:
      "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    chipHover:
      "hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:hover:border-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-400",
  },
  amber: {
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconText: "text-amber-600 dark:text-amber-400",
    cardBorder: "",
    cardBg: "",
    chipBase:
      "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    chipHover:
      "hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:border-amber-700 dark:hover:bg-amber-950/30 dark:hover:text-amber-400",
  },
  indigo: {
    iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    iconText: "text-indigo-600 dark:text-indigo-400",
    // Featured card gets a subtle gradient border treatment
    cardBorder: "border-indigo-200 dark:border-indigo-800",
    cardBg:
      "bg-gradient-to-br from-indigo-50/60 to-white dark:from-indigo-950/20 dark:to-slate-900",
    chipBase:
      "border-indigo-200 bg-indigo-50/50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300",
    chipHover:
      "hover:border-indigo-400 hover:bg-indigo-100 hover:text-indigo-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-200",
  },
};

export default function DashboardPage() {
  const t = useTranslations();

  const FEATURES = [
    {
      title: t("features.crear.title"),
      description: t("features.crear.description"),
      // Concrete examples make the value proposition immediate for Carlos (business owner)
      example: "ej. NDA, contrato de servicios, carta formal",
      icon: FileText,
      href: "/dashboard/crear",
      color: "blue",
      badge: t("features.crear.badge"),
    },
    {
      title: t("features.revisar.title"),
      description: t("features.revisar.description"),
      example: "ej. detecta ambigüedades, cláusulas de riesgo",
      icon: Search,
      href: "/dashboard/revisar",
      color: "emerald",
      badge: t("features.revisar.badge"),
    },
    {
      title: t("features.knowledgeBase.title"),
      description: t("features.knowledgeBase.description"),
      example:
        "ej. sube tus contratos modelo para que la IA los use como referencia",
      icon: BookOpen,
      href: "/dashboard/knowledge-base",
      color: "amber",
      badge: t("features.knowledgeBase.badge"),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            {t("dashboard.badge")}
          </p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("dashboard.welcome")}
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {t("dashboard.description")}
        </p>
      </div>

      {/* How to use */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          {t("dashboard.startHere")}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const colorMap: Record<
              string,
              {
                bg: string;
                text: string;
                border: string;
                badgeBg: string;
                exampleText: string;
              }
            > = {
              blue: {
                bg: "bg-blue-50",
                text: "text-blue-600",
                border: "hover:border-blue-200",
                badgeBg: "bg-blue-100 text-blue-700",
                exampleText: "text-blue-500 dark:text-blue-500",
              },
              emerald: {
                bg: "bg-emerald-50",
                text: "text-emerald-600",
                border: "hover:border-emerald-200",
                badgeBg: "bg-emerald-100 text-emerald-700",
                exampleText: "text-emerald-500 dark:text-emerald-500",
              },
              amber: {
                bg: "bg-amber-50",
                text: "text-amber-600",
                border: "hover:border-amber-200",
                badgeBg: "bg-amber-100 text-amber-700",
                exampleText: "text-amber-500 dark:text-amber-500",
              },
            };
            const c = colorMap[feature.color];
            return (
              <Link key={i} href={feature.href}>
                <Card
                  className={`group h-full cursor-pointer transition-all ${c.border} hover:shadow-md`}
                >
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${c.bg}`}
                      >
                        <feature.icon className={`h-5 w-5 ${c.text}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${c.badgeBg}`}
                        >
                          {feature.badge}
                        </span>
                      </div>
                    </div>
                    <p className="mb-1.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>
                    {/* Concrete example — addresses María's "will it handle my real docs?" skepticism */}
                    <p className={`mb-3 text-xs leading-relaxed ${c.exampleText}`}>
                      {feature.example}
                    </p>
                    <div
                      className={`flex items-center text-sm font-medium ${c.text} opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100`}
                    >
                      {t("dashboard.open")}{" "}
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Document Showcase ──────────────────────────────────────────────── */}
      {/* Progressive disclosure: users see exactly what they can generate     */}
      {/* before committing to any action. Serves all three personas:          */}
      {/* María scans for her doc type, Carlos sees plain-language labels,     */}
      {/* Sofía spots templates by category instantly.                         */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Documentos que puedes crear
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {DOCUMENT_CATEGORIES.map((cat, i) => {
            const cc = CAT_COLOR_MAP[cat.colorKey];
            const Icon = cat.icon;
            return (
              <Card
                key={i}
                className={`group transition-all hover:shadow-md ${cc.cardBorder} ${cc.cardBg}`}
              >
                <CardContent className="p-5">
                  {/* Category header */}
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${cc.iconBg}`}
                    >
                      <Icon className={`h-4 w-4 ${cc.iconText}`} />
                    </div>
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      {cat.name}
                    </h3>
                    {/* Pilot badge — signals to AGC Immigration that this is their feature */}
                    {cat.featured && (
                      <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                        Piloto AGC
                      </span>
                    )}
                  </div>

                  {/* Document chips — each is a direct entry point into the generator */}
                  <div className="flex flex-wrap gap-2">
                    {cat.docs.map((doc, j) => (
                      <Link key={j} href={doc.href}>
                        <span
                          className={`group/chip flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all ${cc.chipBase} ${cc.chipHover}`}
                        >
                          {doc.label}
                          {/* Arrow appears on hover — Speed is a feature: instant affordance */}
                          <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover/chip:opacity-100" />
                        </span>
                      </Link>
                    ))}

                    {/* "See all" chip for categories with more templates than shown */}
                    {cat.seeAllHref && cat.seeAllLabel && (
                      <Link href={cat.seeAllHref}>
                        <span className="flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 transition-all hover:border-indigo-400 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/40">
                          {cat.seeAllLabel}
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="mt-6">
        <UsageStats />
      </div>

      {/* Legal Chat */}
      <div className="mt-6">
        <LegalChat />
      </div>

      {/* MVP note */}
      <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/30">
        <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-300">
          <span className="font-semibold">{t("dashboard.mvpNote")}</span>{" "}
          {t("dashboard.mvpDescription")}
        </p>
      </div>

      {/* Feedback CTA */}
      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t("dashboard.feedbackQuestion")}
        </p>
        <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
          <a href="mailto:feedback@luuc.ai">{t("dashboard.sendFeedback")}</a>
        </Button>
      </div>
    </div>
  );
}
