"use client";

import Link from "next/link";
import {
  FileText,
  Search,
  BookOpen,
  ArrowRight,
  Zap,
  Shield,
  Brain,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LegalChat } from "@/components/legal-chat";
import { useTranslations } from "@/hooks/use-translations";

export default function DashboardPage() {
  const t = useTranslations();

  const FEATURES = [
    {
      title: t("features.crear.title"),
      description: t("features.crear.description"),
      icon: FileText,
      href: "/dashboard/crear",
      color: "blue",
      badge: t("features.crear.badge"),
    },
    {
      title: t("features.revisar.title"),
      description: t("features.revisar.description"),
      icon: Search,
      href: "/dashboard/revisar",
      color: "emerald",
      badge: t("features.revisar.badge"),
    },
    {
      title: t("features.knowledgeBase.title"),
      description: t("features.knowledgeBase.description"),
      icon: BookOpen,
      href: "/dashboard/knowledge-base",
      color: "amber",
      badge: t("features.knowledgeBase.badge"),
    },
  ];

  const CAPABILITIES = [
    {
      icon: Brain,
      title: t("capabilities.claudeAI.title"),
      text: t("capabilities.claudeAI.text"),
    },
    {
      icon: Shield,
      title: t("capabilities.privacy.title"),
      text: t("capabilities.privacy.text"),
    },
    {
      icon: Zap,
      title: t("capabilities.speed.title"),
      text: t("capabilities.speed.text"),
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
            const colorMap: Record<string, { bg: string; text: string; border: string; badgeBg: string }> = {
              blue: { bg: "bg-blue-50", text: "text-blue-600", border: "hover:border-blue-200", badgeBg: "bg-blue-100 text-blue-700" },
              emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "hover:border-emerald-200", badgeBg: "bg-emerald-100 text-emerald-700" },
              amber: { bg: "bg-amber-50", text: "text-amber-600", border: "hover:border-amber-200", badgeBg: "bg-amber-100 text-amber-700" },
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
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>
                    <div
                      className={`flex items-center text-sm font-medium ${c.text} opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100`}
                    >
                      {t("dashboard.open")} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tech capabilities */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          {t("dashboard.underTheHood")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {CAPABILITIES.map((cap, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <cap.icon className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {cap.title}
                </p>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {cap.text}
                </p>
              </div>
            </div>
          ))}
        </div>
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
