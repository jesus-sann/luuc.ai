"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Crown, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: 0,
    description: "Para probar la plataforma",
    icon: Zap,
    color: "bg-slate-100 text-slate-600",
    features: [
      "10 documentos por mes",
      "5 análisis por mes",
      "3 proveedores de IA",
      "5 idiomas de documento",
      "Exportar DOCX y PDF",
    ],
  },
  {
    key: "plus",
    name: "Plus",
    price: 29,
    description: "Para profesionales independientes",
    icon: Crown,
    color: "bg-blue-100 text-blue-600",
    popular: true,
    features: [
      "100 documentos por mes",
      "50 análisis por mes",
      "3 proveedores de IA",
      "5 idiomas de documento",
      "Exportar DOCX y PDF",
      "Base de conocimiento",
      "Soporte prioritario",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: 79,
    description: "Para firmas y equipos legales",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-600",
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
  },
];

export default function PlanesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>}>
      <PlanesContent />
    </Suspense>
  );
}

function PlanesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const currentPlan = (user?.user_metadata?.plan as string) || "free";

  const handleUpgrade = async (planKey: string) => {
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        alert(data.error || "Error al iniciar el pago");
        setLoadingPlan(null);
      }
    } catch {
      alert("Error de conexión");
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPlan("manage");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        alert(data.error || "Error al abrir el portal");
        setLoadingPlan(null);
      }
    } catch {
      alert("Error de conexión");
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/configuracion"
          className="mb-3 inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Configuración
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Planes y Facturación</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Elige el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          Tu plan ha sido actualizado exitosamente.
        </div>
      )}

      {canceled && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
          El proceso de pago fue cancelado. Puedes intentarlo de nuevo.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key;
          const Icon = plan.icon;

          return (
            <Card
              key={plan.key}
              className={`relative flex flex-col transition-all ${
                plan.popular
                  ? "border-blue-300 shadow-lg ring-1 ring-blue-200 dark:border-blue-700 dark:ring-blue-800"
                  : "hover:shadow-md"
              } ${isCurrent ? "border-green-300 dark:border-green-700" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                  Más popular
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className={`rounded-lg p-2 ${plan.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-slate-500">/mes</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" disabled>
                      Plan actual
                    </Button>
                    {currentPlan !== "free" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={handleManageSubscription}
                        disabled={loadingPlan === "manage"}
                      >
                        {loadingPlan === "manage" ? (
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        ) : null}
                        Administrar suscripción
                      </Button>
                    )}
                  </div>
                ) : plan.key === "free" ? (
                  <Button variant="outline" className="w-full" disabled>
                    Incluido
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={!!loadingPlan}
                  >
                    {loadingPlan === plan.key ? (
                      <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Procesando...</>
                    ) : (
                      `Actualizar a ${plan.name}`
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        Los pagos son procesados de forma segura por Stripe. Puedes cancelar en cualquier momento.
      </div>
    </div>
  );
}
