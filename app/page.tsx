"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Search,
  Check,
  BookOpen,
  MessageSquare,
  Bot,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/pricing-section";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslations } from "@/hooks/use-translations";

export default function LandingPage() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              Luuc<span className="text-blue-600">.ai</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              {t("landing.nav.features")}
            </Link>
            <Link
              href="#demo"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              {t("landing.nav.demo")}
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              {t("landing.nav.pricing")}
            </Link>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle variant="compact" />
            <LanguageToggle variant="compact" />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm sm:size-default">
                {t("landing.nav.login")}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-sm sm:size-default">
                {t("landing.nav.register")}
                <ArrowRight className="ml-1.5 h-4 w-4 hidden sm:inline" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 px-4 pb-12 pt-20 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            {t("landing.hero.badge")}
          </div>

          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[52px]">
            {t("landing.hero.title")}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("landing.hero.titleHighlight")}
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-lg text-slate-500 dark:text-slate-400 sm:text-xl">
            {t("landing.hero.description")}
          </p>

          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="text-base">
                {t("landing.hero.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-base">
                {t("landing.hero.secondaryCta")}
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              {t("landing.hero.stat1")}
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              {t("landing.hero.stat2")}
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              {t("landing.hero.stat3")}
            </span>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="border-y border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 text-center md:grid-cols-4">
          <div>
            <div className="text-3xl font-extrabold text-blue-600">80%</div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("landing.social.stat1")}</p>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-blue-600">95%</div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("landing.social.stat2")}</p>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-blue-600">10K+</div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("landing.social.stat3")}</p>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-blue-600">500+</div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("landing.social.stat4")}</p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-blue-600">
            {t("landing.features.label")}
          </p>
          <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("landing.features.title")}
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-base text-slate-500 dark:text-slate-400">
            {t("landing.features.description")}
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 transition-all hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{t("landing.features.drafting.title")}</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {t("landing.features.drafting.description")}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 transition-all hover:-translate-y-0.5 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{t("landing.features.review.title")}</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {t("landing.features.review.description")}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 transition-all hover:-translate-y-0.5 hover:border-green-200 dark:hover:border-green-700 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/50">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{t("landing.features.knowledge.title")}</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {t("landing.features.knowledge.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-slate-50 dark:bg-slate-900 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-blue-600">
            {t("landing.howItWorks.label")}
          </p>
          <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("landing.howItWorks.title")}
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-base text-slate-500 dark:text-slate-400">
            {t("landing.howItWorks.description")}
          </p>

          <div className="relative grid gap-8 md:grid-cols-3 md:gap-5">
            <div className="absolute left-[16.5%] right-[16.5%] top-6 hidden h-0.5 bg-slate-200 dark:bg-slate-700 md:block" />

            <div className="relative z-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-md shadow-blue-600/30">
                1
              </div>
              <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">{t("landing.howItWorks.step1.title")}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("landing.howItWorks.step1.description")}
              </p>
            </div>

            <div className="relative z-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-md shadow-blue-600/30">
                2
              </div>
              <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">{t("landing.howItWorks.step2.title")}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("landing.howItWorks.step2.description")}
              </p>
            </div>

            <div className="relative z-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-md shadow-blue-600/30">
                3
              </div>
              <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">{t("landing.howItWorks.step3.title")}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("landing.howItWorks.step3.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo ── */}
      <section id="demo" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-blue-600">
            {t("landing.demo.label")}
          </p>
          <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("landing.demo.title")}
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-center text-base text-slate-500 dark:text-slate-400">
            {t("landing.demo.description")}
          </p>

          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl">
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("landing.demo.assistant")}</p>
                <p className="text-xs text-green-500">{t("landing.demo.online")}</p>
              </div>
            </div>

            {/* Chat messages */}
            <div className="space-y-4 p-5">
              {/* User message */}
              <div className="flex justify-end">
                <div className="flex items-start gap-2">
                  <div className="max-w-sm rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-sm text-white">
                    <div className="mb-1 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 opacity-70" />
                      <span className="text-xs font-medium opacity-80">You</span>
                    </div>
                    {t("landing.demo.userMessage")}
                  </div>
                </div>
              </div>

              {/* AI response */}
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="max-w-lg rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    <p className="mb-3 font-medium text-slate-900 dark:text-white">
                      {t("landing.demo.aiResponse")}
                    </p>
                    <div className="space-y-2 rounded-lg bg-white dark:bg-slate-800 p-3 text-xs">
                      <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                        <span><strong>{t("landing.demo.type")}</strong> {t("landing.demo.typeValue")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                        <span><strong>{t("landing.demo.jurisdiction")}</strong> {t("landing.demo.jurisdictionValue")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                        <span><strong>{t("landing.demo.term")}</strong> {t("landing.demo.termValue")}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                        <span><strong>{t("landing.demo.clauses")}</strong> {t("landing.demo.clausesValue")}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                        <FileText className="mr-1 h-3 w-3" />
                        {t("landing.demo.downloadPdf")}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {t("landing.demo.editDoc")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input bar (decorative) */}
            <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-5 py-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-400">
                {t("landing.demo.inputPlaceholder")}
                <ArrowRight className="ml-auto h-4 w-4 text-blue-400" />
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            {t("landing.demo.disclaimer")}
          </p>
        </div>
      </section>

      {/* ── Pricing (3 tiers) ── */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <PricingSection />
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-20 text-center">
        <h2 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          {t("landing.hero.title")} {t("landing.hero.titleHighlight")}
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-base text-blue-100">
          {t("landing.hero.description")}
        </p>
        <Link href="/register">
          <Button
            size="lg"
            className="bg-white text-base font-bold text-blue-600 shadow-lg hover:bg-slate-50"
          >
            {t("landing.hero.cta")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 px-4 pb-8 pt-12 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600">
                  <span className="text-sm font-bold text-white">L</span>
                </div>
                <span className="text-lg font-extrabold text-slate-300">
                  Luuc<span className="text-blue-400">.ai</span>
                </span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {t("landing.hero.description")}
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">{t("landing.footer.product")}</h4>
              <div className="flex flex-col gap-2">
                <Link href="#features" className="text-sm text-slate-500 hover:text-slate-300">{t("landing.nav.features")}</Link>
                <Link href="#pricing" className="text-sm text-slate-500 hover:text-slate-300">{t("landing.nav.pricing")}</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">{t("landing.footer.legal")}</h4>
              <div className="flex flex-col gap-2">
                <Link href="/terminos" className="text-sm text-slate-500 hover:text-slate-300">{t("landing.footer.terms")}</Link>
                <Link href="/privacidad" className="text-sm text-slate-500 hover:text-slate-300">{t("landing.footer.privacy")}</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">{t("landing.footer.contact")}</h4>
              <div className="flex flex-col gap-2">
                <Link href="mailto:contacto@luuc.ai" className="text-sm text-slate-500 hover:text-slate-300">contacto@luuc.ai</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
            <span>&copy; {currentYear} {t("landing.footer.copyright")}</span>
            <span>{t("landing.footer.madeIn")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
