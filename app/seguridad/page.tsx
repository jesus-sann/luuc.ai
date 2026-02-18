import Link from "next/link";
import { ArrowLeft, Shield, Lock, Server, Eye, FileSignature, CheckCircle2, ExternalLink, Building2, Globe, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const securityFeatures = [
  {
    icon: Server,
    title: "Infraestructura Segura",
    description: "Supabase (AWS us-east-1) con cifrado AES-256 en reposo y TLS 1.3 en tránsito.",
  },
  {
    icon: Lock,
    title: "Aislamiento Multi-tenant",
    description: "Row Level Security (RLS) garantiza que los datos de cada empresa están completamente aislados.",
  },
  {
    icon: Shield,
    title: "Autenticación Robusta",
    description: "Autenticación segura con Supabase Auth, tokens JWT y sesiones protegidas.",
  },
  {
    icon: Eye,
    title: "Auditoría Completa",
    description: "Registro de todas las operaciones sensibles con IP, timestamp y usuario.",
  },
];

const faqs = [
  {
    question: "¿Dónde están almacenados mis datos?",
    answer: "Tus datos se almacenan en Supabase (infraestructura AWS us-east-1). Todos los datos están cifrados en reposo con AES-256 y en tránsito con TLS 1.3.",
  },
  {
    question: "¿La IA lee mis contratos?",
    answer: "Sí, la IA procesa tus documentos para generar y analizar contenido. Sin embargo, ningún dato se retiene ni se utiliza para entrenar modelos de IA. Tenemos acuerdos de procesamiento de datos (DPA) con Anthropic que garantizan esto.",
  },
  {
    question: "¿Alguien más puede ver mis documentos?",
    answer: "No. Implementamos aislamiento estricto por empresa usando Row Level Security (RLS) de PostgreSQL. Cada empresa solo puede acceder a sus propios datos. Ni siquiera los administradores de Luuc.ai pueden ver el contenido de tus documentos.",
  },
  {
    question: "¿Puedo eliminar mis datos?",
    answer: "Sí. Tienes derecho al olvido en cualquier momento. Puedes eliminar documentos individuales, análisis, o solicitar la eliminación completa de tu cuenta y todos los datos asociados contactando a soporte@luuc.ai.",
  },
  {
    question: "¿Puedo firmar un NDA con Luuc.ai?",
    answer: "Sí. Para empresas que lo requieran, ofrecemos un Acuerdo de Confidencialidad (NDA) estándar. Descarga la plantilla y envíala firmada a legal@luuc.ai para que procedamos con la firma bilateral.",
  },
  {
    question: "¿Qué estándares de seguridad siguen?",
    answer: "Seguimos las mejores prácticas de seguridad alineadas con SOC 2 e ISO 27001. Nuestra infraestructura (AWS/Supabase) cuenta con estas certificaciones, y aplicamos los mismos controles en nuestra capa de aplicación.",
  },
];

const complianceStandards = [
  {
    name: "SOC 2 Type II",
    description: "Controles de seguridad auditados",
    icon: BadgeCheck,
    status: "Alineado"
  },
  {
    name: "ISO 27001",
    description: "Gestión de seguridad de información",
    icon: Globe,
    status: "Alineado"
  },
  {
    name: "GDPR",
    description: "Protección de datos personales",
    icon: Shield,
    status: "Cumplimiento"
  },
  {
    name: "Ley 1581 de 2012",
    description: "Habeas Data Colombia",
    icon: Building2,
    status: "Cumplimiento"
  },
];

const encryptionStandards = [
  { name: "TLS 1.3", description: "Cifrado en tránsito" },
  { name: "AES-256", description: "Cifrado en reposo" },
  { name: "JWT", description: "Tokens seguros" },
  { name: "RLS", description: "Aislamiento de datos" },
];

export default function SeguridadPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>

        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
            Seguridad en Luuc.ai
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Entendemos que la confidencialidad es crítica para documentos legales.
            Por eso construimos Luuc.ai con seguridad empresarial desde el primer día.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="mb-16 grid gap-6 md:grid-cols-2">
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Compliance Standards */}
        <div className="mb-16">
          <h2 className="mb-2 text-center text-2xl font-bold text-slate-900 dark:text-white">
            Cumplimiento Normativo
          </h2>
          <p className="mb-8 text-center text-slate-600 dark:text-slate-400">
            Seguimos las mejores prácticas de seguridad y cumplimos con los estándares de la industria
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {complianceStandards.map((standard) => {
              const Icon = standard.icon;
              return (
                <div
                  key={standard.name}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {standard.name}
                      </h3>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {standard.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {standard.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Nota:</strong> Nuestra infraestructura (AWS, Supabase, Anthropic) cuenta con certificaciones
              SOC 2 Type II e ISO 27001. Aplicamos los mismos controles de seguridad en nuestra capa de aplicación
              y estamos trabajando en obtener nuestras propias certificaciones.
            </p>
          </div>
        </div>

        {/* Encryption Standards */}
        <div className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white">
            Estándares de Cifrado
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {encryptionStandards.map((standard) => (
              <div
                key={standard.name}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800"
              >
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {standard.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ({standard.description})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 dark:text-white">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* NDA Download */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-800 dark:bg-blue-950/30">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600">
            <FileSignature className="h-7 w-7 text-white" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            ¿Necesitas un NDA?
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-slate-600 dark:text-slate-400">
            Para empresas que requieren un acuerdo de confidencialidad formal antes
            de usar la plataforma, ofrecemos un NDA bilateral estándar.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <a href="/docs/nda-luuc-ai.pdf" download>
                <FileSignature className="mr-2 h-4 w-4" />
                Descargar NDA
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="mailto:legal@luuc.ai">
                <ExternalLink className="mr-2 h-4 w-4" />
                Contactar Legal
              </a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
            Envía el NDA firmado a legal@luuc.ai y te responderemos en 24-48 horas.
          </p>
        </div>

        {/* Related Pages */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/terminos"
            className="text-sm text-slate-500 hover:text-blue-600 hover:underline dark:text-slate-400"
          >
            Términos de Servicio
          </Link>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <Link
            href="/privacidad"
            className="text-sm text-slate-500 hover:text-blue-600 hover:underline dark:text-slate-400"
          >
            Política de Privacidad
          </Link>
        </div>

        {/* Contact */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            ¿Tienes más preguntas sobre seguridad?{" "}
            <a
              href="mailto:seguridad@luuc.ai"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              seguridad@luuc.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
