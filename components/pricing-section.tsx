import Link from "next/link";
import { Check, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PricingPlan {
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
}

const plans: PricingPlan[] = [
  {
    name: "Plan Básico",
    tagline: "Perfecto para comenzar",
    price: {
      usd: 29,
      cop: 120000,
    },
    features: [
      "20 documentos generados al mes",
      "Plantillas básicas de documentos",
      "Revisión básica de documentos",
      "Soporte por correo electrónico",
      "1 usuario",
      "Exportar en PDF y DOCX",
    ],
    cta: "Comenzar prueba gratis",
    ctaVariant: "outline",
  },
  {
    name: "Plan Plus",
    tagline: "Ideal para equipos en crecimiento",
    price: {
      usd: 79,
      cop: 320000,
    },
    recommended: true,
    badge: "Recomendado",
    features: [
      "100 documentos generados al mes",
      "Todas las plantillas disponibles",
      "Revisión avanzada con análisis detallado",
      "Detección de riesgos legales",
      "Soporte prioritario",
      "Hasta 5 usuarios",
      "Marca personalizada en documentos",
      "Historial ilimitado",
    ],
    cta: "Probar Plan Plus",
    ctaVariant: "default",
  },
  {
    name: "Plan Pro",
    tagline: "Todo lo que necesitas + Knowledge Base",
    price: {
      usd: 199,
      cop: 820000,
    },
    features: [
      "Documentos ilimitados",
      "Base de conocimiento completa",
      "IA entrenada con tus documentos",
      "Redacción personalizada avanzada",
      "Análisis predictivo de riesgos",
      "Analíticas empresariales",
      "Soporte dedicado",
      "Usuarios ilimitados",
      "Acceso API",
      "Integraciones personalizadas",
    ],
    cta: "Comenzar con Pro",
    ctaVariant: "outline",
  },
];

interface PricingSectionProps {
  showHeader?: boolean;
  currency?: "USD" | "COP";
}

export function PricingSection({ showHeader = true, currency = "USD" }: PricingSectionProps) {
  return (
    <section className="py-16">
      {showHeader && (
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Planes que escalan con tu equipo
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Comienza gratis y actualiza cuando necesites más. Todos los planes incluyen prueba de 14 días.
          </p>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${
              plan.recommended
                ? "border-2 border-blue-600 shadow-xl"
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
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-base">{plan.tagline}</CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">
                    ${currency === "USD" ? plan.price.usd : plan.price.cop.toLocaleString()}
                  </span>
                  <span className="text-slate-500">
                    {currency === "USD" ? "USD" : "COP"}/mes
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {currency === "USD"
                    ? `~$${plan.price.cop.toLocaleString()} COP`
                    : `~$${plan.price.usd} USD`}
                </p>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col">
              <ul className="mb-6 flex-1 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className="w-full">
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
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-slate-500">
          ¿Necesitas un plan empresarial con características personalizadas?{" "}
          <Link href="mailto:contacto@luuc.ai" className="text-blue-600 hover:underline">
            Contáctanos
          </Link>
        </p>
      </div>
    </section>
  );
}
