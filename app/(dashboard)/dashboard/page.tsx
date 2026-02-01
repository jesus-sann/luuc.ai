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

const FEATURES = [
  {
    title: "Redactar",
    description:
      "Genera contratos, NDAs, cartas, políticas y reportes usando plantillas inteligentes o redacción libre.",
    icon: FileText,
    href: "/dashboard/redactar",
    color: "blue",
    badge: "6 plantillas + modo libre",
  },
  {
    title: "Revisar",
    description:
      "Sube un documento legal y recibe un análisis de riesgos con score, hallazgos y recomendaciones.",
    icon: Search,
    href: "/dashboard/revisar",
    color: "emerald",
    badge: "PDF, DOCX, TXT",
  },
  {
    title: "Base de Conocimiento",
    description:
      "Sube los documentos de tu empresa para que la IA aprenda tu estilo y genere documentos personalizados.",
    icon: BookOpen,
    href: "/dashboard/knowledge-base",
    color: "amber",
    badge: "Próximamente",
  },
];

const CAPABILITIES = [
  {
    icon: Brain,
    title: "Claude AI",
    text: "Potenciado por Anthropic Claude — razonamiento legal avanzado en español",
  },
  {
    icon: Shield,
    title: "Privacidad",
    text: "Tus documentos no se usan para entrenar modelos. Datos cifrados en tránsito y reposo",
  },
  {
    icon: Zap,
    title: "Velocidad",
    text: "Genera borradores profesionales en segundos, no horas",
  },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            MVP Preview
          </p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Bienvenido a Luuc.ai
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">
          Esta es la versión MVP de tu asistente legal corporativo. Explora las
          herramientas disponibles, genera documentos reales y ayúdanos a mejorar
          la plataforma con tu feedback.
        </p>
      </div>

      {/* How to use */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Empieza aquí
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
                        <h3 className="font-semibold text-slate-900">
                          {feature.title}
                        </h3>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${c.badgeBg}`}
                        >
                          {feature.badge}
                        </span>
                      </div>
                    </div>
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500">
                      {feature.description}
                    </p>
                    <div
                      className={`flex items-center text-sm font-medium ${c.text} opacity-0 transition-opacity group-hover:opacity-100`}
                    >
                      Abrir <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tech capabilities */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Bajo el capó
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {CAPABILITIES.map((cap, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <cap.icon className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {cap.title}
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  {cap.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MVP note */}
      <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3">
        <p className="text-xs leading-relaxed text-blue-800">
          <span className="font-semibold">Nota MVP:</span> Estás usando una
          versión temprana de Luuc.ai. Los documentos generados son borradores
          que deben ser revisados por un profesional legal. Funcionalidades como
          historial, colaboración y exportación avanzada están en desarrollo.
        </p>
      </div>

      {/* Feedback CTA */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-600">
          ¿Tienes sugerencias o encontraste un problema?
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href="mailto:feedback@luuc.ai">Enviar Feedback</a>
        </Button>
      </div>
    </div>
  );
}
