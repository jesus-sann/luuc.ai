"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/pricing-section";

export default function PreciosPage() {
  const [currency, setCurrency] = useState<"USD" | "COP">("USD");
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="text-xl font-bold">Luuc.ai</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>
                Comenzar Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Precios transparentes para todos
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-slate-600">
          Elige el plan perfecto para tu equipo. Todos los planes incluyen 14 días de prueba gratuita.
        </p>

        {/* Currency Toggle */}
        <div className="mb-12 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${currency === "USD" ? "text-slate-900" : "text-slate-500"}`}>
            USD
          </span>
          <button
            onClick={() => setCurrency(currency === "USD" ? "COP" : "USD")}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              currency === "USD" ? "bg-blue-600" : "bg-slate-300"
            }`}
            aria-label="Toggle currency"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                currency === "COP" ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${currency === "COP" ? "text-slate-900" : "text-slate-500"}`}>
            COP
          </span>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <PricingSection showHeader={false} currency={currency} />
      </section>

      {/* FAQ Section */}
      <section className="border-t bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                ¿Qué incluye la prueba gratuita?
              </h3>
              <p className="text-slate-600">
                La prueba gratuita de 14 días incluye acceso completo a todas las funcionalidades del plan que elijas.
                No necesitas tarjeta de crédito para comenzar.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-slate-600">
                Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplicarán inmediatamente
                y se ajustará tu facturación de manera prorrateada.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-slate-600">
                Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), así como transferencias
                bancarias para planes anuales.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                ¿Ofrecen descuentos para planes anuales?
              </h3>
              <p className="text-slate-600">
                Sí, ofrecemos un descuento del 20% en todos los planes cuando pagas anualmente. Contáctanos para más
                información.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                ¿Necesito conocimientos técnicos para usar Luuc.ai?
              </h3>
              <p className="text-slate-600">
                No, Luuc.ai está diseñado para ser intuitivo y fácil de usar. Si sabes usar un procesador de textos,
                puedes usar Luuc.ai. Además, ofrecemos soporte y capacitación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            ¿Necesitas un plan empresarial?
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            Ofrecemos soluciones personalizadas con características avanzadas, integraciones a medida y soporte
            dedicado para grandes equipos.
          </p>
          <Link href="mailto:contacto@luuc.ai">
            <Button size="lg" variant="secondary" className="text-lg text-blue-600">
              Contactar con Ventas
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
                <span className="text-xs font-bold text-white">L</span>
              </div>
              <span className="text-sm font-semibold text-slate-700">Luuc.ai</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="/terminos" className="hover:text-slate-700">
                Términos de Servicio
              </Link>
              <Link href="/privacidad" className="hover:text-slate-700">
                Política de Privacidad
              </Link>
              <Link href="mailto:contacto@luuc.ai" className="hover:text-slate-700">
                Contacto
              </Link>
            </div>
            <p className="text-sm text-slate-400">&copy; {currentYear} Luuc.ai</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
