import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Scale, Users, CreditCard, Shield, FileWarning, Mail } from "lucide-react";

const sections = [
  {
    icon: FileText,
    title: "1. Aceptación de los Términos",
    content: `Al acceder y utilizar Luuc.ai ("el Servicio"), aceptas estar sujeto a estos Términos de Servicio ("Términos"). Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.

Estos Términos constituyen un acuerdo legalmente vinculante entre tú y Luuc.ai S.A.S. ("nosotros", "nuestro" o "Luuc.ai"), con domicilio en Colombia.`
  },
  {
    icon: Scale,
    title: "2. Descripción del Servicio",
    content: `Luuc.ai es una plataforma de asistencia legal impulsada por inteligencia artificial que permite:

• Generación de documentos legales (contratos, NDAs, políticas, etc.)
• Revisión y análisis de riesgos en documentos existentes
• Almacenamiento y gestión de documentos

**IMPORTANTE:** El Servicio no constituye asesoría legal profesional. Los documentos generados son borradores que deben ser revisados por un abogado licenciado antes de su uso. Luuc.ai no reemplaza el consejo de un profesional del derecho.`
  },
  {
    icon: Users,
    title: "3. Registro y Cuenta",
    content: `Para usar el Servicio, debes:

• Proporcionar información veraz y actualizada
• Mantener la confidencialidad de tus credenciales de acceso
• Notificarnos inmediatamente sobre cualquier uso no autorizado
• Tener al menos 18 años de edad o la mayoría de edad legal en tu jurisdicción

Eres responsable de todas las actividades que ocurran bajo tu cuenta.`
  },
  {
    icon: CheckCircle2,
    title: "4. Uso Aceptable",
    content: `Te comprometes a usar el Servicio de manera responsable. No deberás:

• Usar el Servicio para actividades ilegales o fraudulentas
• Intentar acceder a datos de otros usuarios
• Reproducir, duplicar o revender el Servicio sin autorización
• Subir contenido malicioso, virus o código dañino
• Interferir con el funcionamiento del Servicio
• Generar documentos para fines que violen la ley aplicable`
  },
  {
    icon: FileWarning,
    title: "5. Propiedad Intelectual",
    content: `**Tu contenido:** Los documentos que generes a través de Luuc.ai son de tu propiedad. Nos otorgas una licencia limitada para procesar tu contenido únicamente con el fin de proporcionar el Servicio.

**Nuestro contenido:** La plataforma, su diseño, código fuente, marca, logotipos y algoritmos son propiedad exclusiva de Luuc.ai y están protegidos por leyes de propiedad intelectual.

**Plantillas:** Las plantillas base proporcionadas por Luuc.ai pueden usarse libremente para generar documentos, pero no pueden redistribuirse o comercializarse de forma independiente.`
  },
  {
    icon: CreditCard,
    title: "6. Planes y Pagos",
    content: `**Planes gratuitos:** El plan Free tiene límites de uso mensual. Al alcanzar los límites, deberás actualizar a un plan de pago para continuar usando el Servicio.

**Planes de pago:** Los pagos se procesan a través de Stripe. Los precios están expresados en USD y pueden estar sujetos a impuestos locales.

**Facturación:** La suscripción se renueva automáticamente. Puedes cancelar en cualquier momento desde tu panel de configuración.

**Reembolsos:** Ofrecemos reembolso completo dentro de los primeros 14 días si no estás satisfecho con el Servicio.`
  },
  {
    icon: AlertTriangle,
    title: "7. Limitación de Responsabilidad",
    content: `**Descargo de garantías:** El Servicio se proporciona "tal cual" sin garantías de ningún tipo. No garantizamos que los documentos generados sean legalmente válidos, completos o adecuados para cualquier propósito específico.

**Uso profesional:** Los usuarios deben consultar con un abogado licenciado antes de usar cualquier documento generado en transacciones legales reales.

**Límite de responsabilidad:** En ningún caso Luuc.ai será responsable por daños indirectos, incidentales, especiales o consecuentes. Nuestra responsabilidad total no excederá el monto pagado por el Servicio en los últimos 12 meses.`
  },
  {
    icon: Shield,
    title: "8. Privacidad y Seguridad",
    content: `El uso de tu información personal está regido por nuestra Política de Privacidad. Al usar el Servicio, aceptas nuestras prácticas de privacidad.

Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos, incluyendo cifrado AES-256, TLS 1.3 y aislamiento de datos por empresa.

Para más información, consulta nuestra página de Seguridad.`
  },
  {
    icon: FileText,
    title: "9. Modificaciones",
    content: `Nos reservamos el derecho de modificar estos Términos en cualquier momento. Te notificaremos sobre cambios materiales con al menos 30 días de anticipación a través del correo electrónico asociado a tu cuenta.

El uso continuado del Servicio después de la fecha efectiva de los cambios constituye tu aceptación de los Términos modificados.`
  },
  {
    icon: Scale,
    title: "10. Ley Aplicable y Disputas",
    content: `Estos Términos se rigen por las leyes de la República de Colombia. Cualquier disputa que surja de estos Términos o del uso del Servicio se resolverá:

1. Primero, mediante negociación directa de buena fe
2. Si no se resuelve en 30 días, mediante arbitraje administrado por el Centro de Arbitraje y Conciliación de la Cámara de Comercio de Bogotá

El lugar del arbitraje será Bogotá, Colombia, y el idioma será español.`
  },
];

export default function TerminosPage() {
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
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 dark:bg-slate-700">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
            Términos de Servicio
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Por favor lee estos términos cuidadosamente antes de usar Luuc.ai.
            Al usar el Servicio, aceptas estos términos.
          </p>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Última actualización: Febrero 2025
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Contenido
          </h2>
          <div className="grid gap-2 md:grid-cols-2">
            {sections.map((section, index) => (
              <a
                key={index}
                href={`#section-${index + 1}`}
                className="flex items-center gap-2 rounded-lg p-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                id={`section-${index + 1}`}
                className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
                <div className="prose prose-slate max-w-none text-slate-600 dark:text-slate-400">
                  {section.content.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-3 whitespace-pre-line">
                      {paragraph.split('**').map((part, j) =>
                        j % 2 === 1 ? (
                          <strong key={j} className="text-slate-900 dark:text-white">{part}</strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-800 dark:bg-blue-950/30">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            ¿Tienes Preguntas?
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-slate-600 dark:text-slate-400">
            Si tienes alguna duda sobre estos Términos de Servicio, no dudes en contactarnos.
          </p>
          <a
            href="mailto:legal@luuc.ai"
            className="inline-flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400"
          >
            <Mail className="h-4 w-4" />
            legal@luuc.ai
          </a>
        </div>

        {/* Related Pages */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/privacidad"
            className="text-sm text-slate-500 hover:text-blue-600 hover:underline dark:text-slate-400"
          >
            Política de Privacidad
          </Link>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <Link
            href="/seguridad"
            className="text-sm text-slate-500 hover:text-blue-600 hover:underline dark:text-slate-400"
          >
            Seguridad
          </Link>
        </div>
      </div>
    </div>
  );
}
