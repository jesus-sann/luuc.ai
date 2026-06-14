import React from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Database, Lock, FileText, UserCheck, Trash2, Globe, Server, Mail, CheckCircle2 } from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "1. Información que Recopilamos",
    content: `Recopilamos información que nos proporcionas directamente:

**Datos de cuenta:**
• Nombre completo y correo electrónico
• Nombre de empresa (opcional)
• País y sector de la empresa

**Datos de uso:**
• Documentos que generas y analizas
• Información que subes a tu base de conocimiento
• Historial de actividad en la plataforma

**Datos técnicos:**
• Dirección IP y tipo de navegador
• Información del dispositivo
• Cookies y tecnologías similares`
  },
  {
    icon: Eye,
    title: "2. Cómo Usamos tu Información",
    content: `Utilizamos tu información para:

**Proporcionar el Servicio:**
• Generar y analizar documentos legales
• Personalizar documentos con datos de tu empresa
• Entrenar la IA con tu base de conocimiento

**Mejorar el Servicio:**
• Analizar patrones de uso (de forma agregada y anónima)
• Desarrollar nuevas funcionalidades
• Detectar y prevenir fraudes

**Comunicaciones:**
• Enviarte actualizaciones importantes del servicio
• Responder a tus consultas de soporte
• Enviarte comunicaciones de marketing (solo con tu consentimiento)`
  },
  {
    icon: Lock,
    title: "3. Seguridad de los Datos",
    content: `Implementamos medidas de seguridad robustas para proteger tu información:

**Cifrado:**
• AES-256 para datos en reposo
• TLS 1.3 para datos en tránsito

**Aislamiento:**
• Row Level Security (RLS) para separar datos por empresa
• Cada organización solo accede a sus propios datos

**Infraestructura:**
• Servidores en AWS (us-east-1) vía Supabase
• Backups automáticos diarios
• Monitoreo de seguridad 24/7

**Acceso:**
• Autenticación segura con Supabase Auth
• No almacenamos contraseñas en texto plano`
  },
  {
    icon: FileText,
    title: "4. Confidencialidad de Documentos",
    content: `Los documentos procesados a través de Luuc.ai son tratados con estricta confidencialidad:

**No compartimos:** Nunca vendemos, alquilamos ni compartimos el contenido de tus documentos con terceros.

**No entrenamos modelos:** Tus documentos NO se utilizan para entrenar modelos de IA. Este compromiso está garantizado directamente por los Términos Comerciales de Anthropic y su Data Processing Addendum (DPA), que entran en vigor automáticamente para todos los usuarios del API — no requieren ningún acuerdo adicional por parte de Luuc.ai. Puedes verificarlos directamente: [Términos Comerciales](https://www.anthropic.com/legal/commercial-terms) · [DPA de Anthropic](https://www.anthropic.com/legal/data-processing-addendum)

**Acceso limitado:** Ni siquiera los administradores de Luuc.ai pueden acceder al contenido de tus documentos sin tu autorización explícita.

**Retención temporal por procesamiento de IA:** Cuando un documento se procesa mediante Claude (Anthropic), los prompts y respuestas pueden ser retenidos temporalmente por Anthropic por hasta 30 días con fines de seguridad y detección de abuso, conforme a su política estándar. Luuc.ai está gestionando activamente la implementación de Zero Data Retention (ZDR) con Anthropic para eliminar incluso esta retención temporal.`
  },
  {
    icon: Server,
    title: "5. Proveedores y Certificaciones de Infraestructura",
    content: `Luuc.ai se apoya en proveedores de infraestructura de nivel empresarial con certificaciones independientes. Al igual que plataformas legales de referencia como Harvey.ai y Plaud.ai, no necesitamos construir seguridad desde cero — la heredamos de los mismos proveedores que usan los bufetes más grandes del mundo.

**Supabase — Base de datos y autenticación:**
• SOC 2 Type II certificado
• ISO 27001 certificado
• HIPAA compliant
• GDPR compliant
• Infraestructura sobre AWS us-east-1 (Virginia)

**Vercel — Hosting y CDN:**
• SOC 2 Type II certificado
• ISO 27001 certificado
• GDPR compliant

**Anthropic — Procesamiento de IA (Claude):**
• No entrena modelos con datos del API ([Términos Comerciales](https://www.anthropic.com/legal/commercial-terms))
• Data Processing Addendum (DPA) vigente por defecto ([DPA](https://www.anthropic.com/legal/data-processing-addendum))
• Retención temporal máxima de 30 días para monitoreo de seguridad

**AWS — Infraestructura subyacente:**
• SOC 1, SOC 2 y SOC 3 certificados
• ISO 27001, 27017 y 27018 certificados
• HIPAA, PCI DSS y FedRAMP compliant

**Stripe — Pagos:**
• PCI DSS Level 1 (el nivel más alto)
• Sin almacenamiento de datos de tarjetas en servidores de Luuc.ai

**Resend — Emails transaccionales:**
• Comunicaciones de servicio únicamente`
  },
  {
    icon: Lock,
    title: "6. Protección de la Confidencialidad Cliente-Abogado",
    content: `Luuc.ai está diseñado para cumplir con las obligaciones de confidencialidad de los abogados bajo las reglas deontológicas aplicables:

**ABA Model Rule 1.6 y equivalentes estatales:** Los documentos e información del cliente procesados en Luuc.ai nunca se comparten con terceros, no se usan para entrenar IA, y están protegidos por aislamiento técnico por firma (Row Level Security).

**Información de casos de inmigración — INA § 1367:** La información de beneficiarios de VAWA, Visa U y Visa T está protegida por confidencialidad federal. Luuc.ai no divulga esta información a ninguna entidad gubernamental ni tercero.

**Sin acceso humano al contenido de documentos:** El contenido de los documentos que generas o subes solo es procesado por los modelos de IA de Anthropic para devolver una respuesta. Ningún empleado de Luuc.ai puede leer el contenido de tus documentos.

**Audit logs inmutables:** Cada acción sobre documentos queda registrada en un log de auditoría protegido que no puede ser modificado ni eliminado, incluso por administradores del sistema.

**Aislamiento por organización:** Los datos de cada firma de abogados están completamente separados mediante Row Level Security (RLS) en base de datos. Es técnicamente imposible que los datos de una firma sean accesibles desde otra cuenta.`
  },
  {
    icon: UserCheck,
    title: "7. Tus Derechos",

    content: `Tienes los siguientes derechos sobre tus datos personales:

**Acceso:** Puedes solicitar una copia de todos los datos que tenemos sobre ti.

**Rectificación:** Puedes actualizar tu información personal en cualquier momento desde tu perfil.

**Eliminación:** Puedes solicitar la eliminación completa de tu cuenta y todos los datos asociados.

**Portabilidad:** Puedes exportar tus documentos generados en formatos estándar (PDF, DOCX).

**Oposición:** Puedes oponerte al uso de tus datos para fines de marketing.

Para ejercer estos derechos, contacta a privacidad@luuc.ai.`
  },
  {
    icon: Trash2,
    title: "8. Retención de Datos",
    content: `Conservamos tu información mientras tu cuenta esté activa:

**Cuenta activa:** Todos tus datos se conservan en Supabase (base de datos cifrada) para proporcionar el servicio.

**Cuenta eliminada:** Eliminamos todos tus datos personales y documentos dentro de 30 días.

**Datos anonimizados:** Podemos conservar datos agregados y anonimizados para análisis estadísticos.

**Obligaciones legales:** Podemos conservar ciertos datos si es requerido por ley (ej: registros de facturación).

**Procesamiento por IA — retención en Anthropic:** Los prompts enviados al API de Claude (Anthropic) durante la generación de documentos pueden ser retenidos temporalmente por Anthropic por hasta 30 días con fines de seguridad y monitoreo de abuso, conforme a su política estándar ([Términos Comerciales](https://www.anthropic.com/legal/commercial-terms)). Anthropic NO usa estos datos para entrenar modelos. Luuc.ai está en proceso de implementar Zero Data Retention (ZDR) para eliminar completamente esta retención temporal.`
  },
  {
    icon: Globe,
    title: "9. Transferencias Internacionales",
    content: `Tus datos pueden ser procesados en servidores ubicados fuera de Colombia:

**Ubicación de servidores:** AWS us-east-1 (Virginia, EE.UU.)

**Protecciones:** Implementamos salvaguardas apropiadas como cláusulas contractuales estándar y certificaciones de cumplimiento.

**Cumplimiento:** Cumplimos con la Ley 1581 de 2012 (Habeas Data Colombia) y el Reglamento General de Protección de Datos (GDPR) de la Unión Europea.`
  },
];

function renderLine(line: string, lineIndex: number) {
  // Parse markdown links [text](url) and **bold** within a single line
  const linkPattern = /(\[([^\]]+)\]\(([^)]+)\))/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(line)) !== null) {
    if (match.index > last) {
      parts.push(...renderBold(line.slice(last, match.index), `${lineIndex}-pre-${last}`));
    }
    parts.push(
      <a
        key={`${lineIndex}-link-${match.index}`}
        href={match[3]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-600 underline hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
      >
        {match[2]}
      </a>
    );
    last = match.index + match[0].length;
  }
  if (last < line.length) {
    parts.push(...renderBold(line.slice(last), `${lineIndex}-post-${last}`));
  }
  return parts;
}

function renderBold(text: string, key: string): React.ReactNode[] {
  return text.split("**").map((part, j) =>
    j % 2 === 1 ? (
      <strong key={`${key}-b-${j}`} className="text-slate-900 dark:text-white">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default function PrivacidadPage() {
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
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600">
            <Eye className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
            Política de Privacidad
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Tu privacidad es importante para nosotros. Esta política explica cómo
            recopilamos, usamos y protegemos tu información.
          </p>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Última actualización: Junio 2026
          </p>
        </div>

        {/* Key Points */}
        <div className="mb-12 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
          <h2 className="mb-4 text-lg font-semibold text-green-900 dark:text-green-300">
            Puntos Clave
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-300">
                Tus documentos NO se usan para entrenar IA
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-300">
                Datos cifrados en tránsito y reposo
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-300">
                Aislamiento total entre empresas
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-300">
                Puedes eliminar tus datos cuando quieras
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-300">
                DPA con Anthropic vigente por defecto bajo sus Términos Comerciales
              </span>
            </div>
          </div>
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
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
                <div className="prose prose-slate max-w-none text-slate-600 dark:text-slate-400">
                  {section.content.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-3 whitespace-pre-line">
                      {renderLine(paragraph, i)}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-2xl border border-purple-200 bg-purple-50 p-8 text-center dark:border-purple-800 dark:bg-purple-950/30">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-600">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            ¿Tienes Preguntas sobre Privacidad?
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-slate-600 dark:text-slate-400">
            Si tienes alguna duda sobre cómo manejamos tu información, no dudes en contactarnos.
          </p>
          <a
            href="mailto:privacidad@luuc.ai"
            className="inline-flex items-center gap-2 text-purple-600 hover:underline dark:text-purple-400"
          >
            <Mail className="h-4 w-4" />
            privacidad@luuc.ai
          </a>
        </div>

        {/* Related Pages */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/terminos"
            className="text-sm text-slate-500 hover:text-purple-600 hover:underline dark:text-slate-400"
          >
            Términos de Servicio
          </Link>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <Link
            href="/seguridad"
            className="text-sm text-slate-500 hover:text-purple-600 hover:underline dark:text-slate-400"
          >
            Seguridad
          </Link>
        </div>
      </div>
    </div>
  );
}
