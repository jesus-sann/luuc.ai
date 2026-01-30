import Link from "next/link";
import { ArrowRight, FileText, Search, Shield, Zap, Clock, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/pricing-section";

export default function LandingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="text-xl font-bold">Luuc.ai</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Funcionalidades
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Precios
            </Link>
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>
                Comenzar Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
          <div className="flex items-center gap-4 md:hidden">
            <Link href="/login">
              <Button variant="ghost" size="sm">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Comenzar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Tu Asistente Legal Potenciado por{" "}
            <span className="text-blue-600">Inteligencia Artificial</span>
          </h1>
          <p className="mb-8 text-xl text-slate-600">
            Redacta contratos, analiza documentos y gestiona riesgos legales en
            minutos, no en horas. Compliance as a Service para empresas modernas.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-lg">
                Probar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg">
                Ver Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-slate-400">
            Resultados que hablan por sí solos
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-slate-900">
                <Clock className="h-6 w-6 text-blue-600" />
                80%
              </div>
              <p className="mt-1 text-sm text-slate-500">Menos tiempo en redacción</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-slate-900">
                <CheckCircle className="h-6 w-6 text-green-600" />
                95%
              </div>
              <p className="mt-1 text-sm text-slate-500">Precisión en detección de riesgos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-slate-900">
                <FileText className="h-6 w-6 text-purple-600" />
                10K+
              </div>
              <p className="mt-1 text-sm text-slate-500">Documentos procesados</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-slate-900">
                <Users className="h-6 w-6 text-orange-600" />
                500+
              </div>
              <p className="mt-1 text-sm text-slate-500">Empresas confían en nosotros</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
          Todo lo que necesitas para tu gestión legal
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Redacción Inteligente</h3>
            <p className="text-slate-600">
              Genera contratos, NDAs, políticas y más con templates
              profesionales y personalización con IA.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Search className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Revisión Documental</h3>
            <p className="text-slate-600">
              Analiza contratos existentes, identifica riesgos y recibe
              recomendaciones de mejora instantáneas.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Gestión de Riesgos</h3>
            <p className="text-slate-600">
              Detecta cláusulas problemáticas, términos ambiguos y riesgos
              legales antes de firmar.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16">
        <PricingSection />
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Comienza a ahorrar tiempo hoy
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            Únete a empresas que ya automatizan su gestión legal con Luuc.ai
          </p>
          <Link href="/register">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg text-blue-600"
            >
              Crear Cuenta Gratis
              <Zap className="ml-2 h-5 w-5" />
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
            <p className="text-sm text-slate-400">
              &copy; {currentYear} Luuc.ai
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
