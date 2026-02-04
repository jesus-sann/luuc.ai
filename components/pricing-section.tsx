"use client";

import Link from "next/link";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PricingPlan {
  key: string;
  name: string;
  tagline: string;
  price: {
    usd: number;
    cop: number;
  };
  recommended?: boolean;
  features: string[];
  cta: string;
  ctaVariant?: "default" | "outline";
  badge?: string;
  trialDays?: number;
  icon: typeof Zap;
}

const plans: PricingPlan[] = [
  {
    key: "free",
    name: "Free",
    tagline: "Para probar la plataforma",
    price: {
      usd: 0,
      cop: 0,
    },
    icon: Zap,
    features: [
      "10 documentos por mes",
      "5 análisis por mes",
      "3 proveedores de IA",
      "5 idiomas de documento",
      "Exportar DOCX y PDF",
    ],
    cta: "Comenzar Gratis",
    ctaVariant: "outline",
    trialDays: 14,
  },
  {
    key: "plus",
    name: "Plus",
    tagline: "Para profesionales independientes",
    price: {
      usd: 29,
      cop: 120000,
    },
    recommended: true,
    badge: "Más Popular",
    icon: Crown,
    features: [
      "100 documentos por mes",
      "50 análisis por mes",
      "3 proveedores de IA",
      "5 idiomas de documento",
      "Exportar DOCX y PDF",
      "Base de conocimiento",
      "Soporte prioritario",
    ],
    cta: "Probar Plus Gratis",
    ctaVariant: "default",
    trialDays: 14,
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "Para firmas y equipos legales",
    price: {
      usd: 79,
      cop: 320000,
    },
    icon: Sparkles,
    features: [
      "Documentos ilimitados",
      "Análisis ilimitados",
      "3 proveedores de IA",
      "5 idiomas de documento",
      "Exportar DOCX y PDF",
      "Base de conocimiento",
      "Documentos de referencia",
      "Soporte prioritario 24/7",
      "Acceso API",
    ],
    cta: "Probar Pro Gratis",
    ctaVariant: "outline",
    trialDays: 14,
  },
];

interface PricingSectionProps {
  showHeader?: boolean;
  currency?: "USD" | "COP";
}

export function PricingSection({ showHeader = true, currency = "USD" }: PricingSectionProps) {
  const t = useTranslations();

  return (
    <section className="py-16">
      {showHeader && (
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Planes que escalan con tu equipo
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Comienza con 14 días de prueba gratis en cualquier plan. Sin tarjeta de crédito.
          </p>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.key}
              className={`relative flex flex-col ${
                plan.recommended
                  ? "border-2 border-blue-600 shadow-xl dark:border-blue-500"
                  : "border shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 text-xs font-medium text-white shadow-md">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <CardHeader className={plan.recommended ? "pt-8" : ""}>
                <div className="mb-2 flex items-center gap-2">
                  <div className={`rounded-lg p-2 ${
                    plan.key === "free" ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" :
                    plan.key === "plus" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" :
                    "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <CardDescription className="text-base">{plan.tagline}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {plan.price.usd === 0 ? "Gratis" : `$${currency === "USD" ? plan.price.usd : plan.price.cop.toLocaleString()}`}
                    </span>
                    {plan.price.usd > 0 && (
                      <span className="text-slate-500 dark:text-slate-400">
                        {currency === "USD" ? "USD" : "COP"}/mes
                      </span>
                    )}
                  </div>
                  {plan.price.usd > 0 && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {currency === "USD"
                        ? `~$${plan.price.cop.toLocaleString()} COP`
                        : `~$${plan.price.usd} USD`}
                    </p>
                  )}
                  {plan.trialDays && (
                    <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                      {plan.trialDays} días de prueba gratis
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 flex-1 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/register?plan=${plan.key}`} className="w-full">
                  <Button
                    variant={plan.ctaVariant}
                    size="lg"
                    className={`w-full ${
                      plan.recommended
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }`}
                  >
                    {plan.cta}
                    {plan.recommended && <Zap className="ml-2 h-4 w-4" />}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          ¿Necesitas un plan empresarial con características personalizadas?{" "}
          <Link href="mailto:contacto@luuc.ai" className="text-blue-600 hover:underline">
            Contáctanos
          </Link>
        </p>
      </div>
    </section>
  );
}
