import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Search,
  Check,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/pricing-section";

export default function LandingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="text-xl font-extrabold text-slate-900">
              Luuc<span className="text-blue-600">.ai</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Funcionalidades
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Precios
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button>
                Registrarse
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 pb-12 pt-20 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            IA especializada en derecho latinoamericano
          </div>

          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[52px]">
            Genera documentos legales en{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              segundos, no en horas
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-lg text-slate-500 sm:text-xl">
            Redacta contratos, NDAs, políticas y más con inteligencia artificial
            entrenada en normativa colombiana. Preciso, profesional, inmediato.
          </p>

          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="text-base">
                Empieza Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-base">
                Ver Funcionalidades
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              2,847 documentos generados
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              Cumple normativa colombiana
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              Sin tarjeta de crédito
            </span>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 text-center md:grid-cols-4">
          <div>
            <div className="text-3xl font-extrabold text-blue-600">80%</div>
            <p className="mt-1 text-sm text-slate-500">Menos tiempo en redacción</p>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-blue-600">95%</div>
            <p className="mt-1 text-sm text-slate-500">Precisión jurídica</p>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-blue-600">10K+</div>
            <p className="mt-1 text-sm text-slate-500">Documentos generados</p>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-blue-600">500+</div>
            <p className="mt-1 text-sm text-slate-500">Empresas confían en nosotros</p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-blue-600">
            Funcionalidades
          </p>
          <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-slate-900">
            Todo lo que necesitas para documentos legales
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-base text-slate-500">
            Desde la redacción hasta la revisión de riesgos, en una sola plataforma
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Redacción con IA</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Genera contratos, NDAs, políticas internas y más. Elige entre
                plantillas predefinidas o describe lo que necesitas con tus propias palabras.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Revisión de Riesgos</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Sube cualquier documento legal y recibe un análisis detallado de
                riesgos, cláusulas faltantes y recomendaciones de mejora.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Base de Conocimiento</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Sube los documentos de tu empresa para que la IA aprenda tu estilo,
                terminología y cláusulas preferidas. Resultados cada vez más precisos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-slate-50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-blue-600">
            Cómo Funciona
          </p>
          <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-slate-900">
            3 pasos para tu documento
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-base text-slate-500">
            Desde la idea hasta el documento listo en menos de 2 minutos
          </p>

          <div className="relative grid gap-8 md:grid-cols-3 md:gap-5">
            <div className="absolute left-[16.5%] right-[16.5%] top-6 hidden h-0.5 bg-slate-200 md:block" />

            <div className="relative z-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-md shadow-blue-600/30">
                1
              </div>
              <h3 className="mb-1 text-base font-bold text-slate-900">Elige o Describe</h3>
              <p className="text-sm text-slate-500">
                Selecciona una plantilla o describe en tus palabras qué documento necesitas
              </p>
            </div>

            <div className="relative z-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-md shadow-blue-600/30">
                2
              </div>
              <h3 className="mb-1 text-base font-bold text-slate-900">Personaliza con IA</h3>
              <p className="text-sm text-slate-500">
                La IA genera un borrador profesional adaptado a tu empresa y contexto legal
              </p>
            </div>

            <div className="relative z-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-md shadow-blue-600/30">
                3
              </div>
              <h3 className="mb-1 text-base font-bold text-slate-900">Descarga y Usa</h3>
              <p className="text-sm text-slate-500">
                Revisa, edita si quieres, y descarga en PDF o DOCX listo para firmar
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing (3 tiers) ── */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <PricingSection />
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-20 text-center">
        <h2 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          Deja de perder horas en documentos legales
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-base text-blue-100">
          Únete a cientos de empresas que ya usan Luuc.ai para automatizar su documentación jurídica
        </p>
        <Link href="/register">
          <Button
            size="lg"
            className="bg-white text-base font-bold text-blue-600 shadow-lg hover:bg-slate-50"
          >
            Crear Cuenta Gratis
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
                Automatización de documentos legales con inteligencia artificial para Latinoamérica.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Producto</h4>
              <div className="flex flex-col gap-2">
                <Link href="#features" className="text-sm text-slate-500 hover:text-slate-300">Funcionalidades</Link>
                <Link href="#pricing" className="text-sm text-slate-500 hover:text-slate-300">Precios</Link>
                <Link href="/register" className="text-sm text-slate-500 hover:text-slate-300">Plantillas</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Legal</h4>
              <div className="flex flex-col gap-2">
                <Link href="/terminos" className="text-sm text-slate-500 hover:text-slate-300">Términos de Uso</Link>
                <Link href="/privacidad" className="text-sm text-slate-500 hover:text-slate-300">Política de Privacidad</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Contacto</h4>
              <div className="flex flex-col gap-2">
                <Link href="mailto:contacto@luuc.ai" className="text-sm text-slate-500 hover:text-slate-300">contacto@luuc.ai</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
            <span>&copy; {currentYear} Luuc.ai. Todos los derechos reservados.</span>
            <span>Hecho en Colombia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
