import Link from "next/link";
import { ArrowRight, FileText, Search, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="text-xl font-bold">Luuc.ai</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/dashboard">
              <Button>
                Comenzar Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900">
            Tu Asistente Legal
            <span className="text-blue-600"> Potenciado por IA</span>
          </h1>
          <p className="mb-8 text-xl text-slate-600">
            Redacta contratos, analiza documentos y gestiona riesgos legales en
            minutos, no en horas. Compliance as a Service para empresas modernas.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg">
                Probar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16">
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

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Comienza a ahorrar tiempo hoy
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            Únete a empresas que ya automatizan su gestión legal con Luuc.ai
          </p>
          <Link href="/dashboard">
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
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          <p>&copy; 2024 Luuc.ai - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}
