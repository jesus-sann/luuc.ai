import React from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Database, Lock, FileText, UserCheck, Trash2, Globe, Server, Mail, CheckCircle2, AlertTriangle, Handshake } from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "1. Responsable y Encargado del Tratamiento",
    content: `**Responsable del Tratamiento (frente a los usuarios de la Plataforma):**
BLP Consulting Group S.A.S., con domicilio en Colombia, operando bajo la marca comercial Luuc.ai.
Correo de contacto: privacidad@luuc.ai

**Encargado del Tratamiento (cuando el Usuario carga datos de sus propios clientes):**
Cuando el Usuario — por ejemplo, una firma de abogados — carga información de sus clientes a la Plataforma, BLP actúa como Encargado del Tratamiento conforme a la Ley 1581 de 2012. El Usuario es el Responsable del Tratamiento de esos datos y es responsable de haber obtenido las autorizaciones pertinentes de sus propios clientes.

Esta doble calidad está regulada en detalle en la Sección 6 de los Términos de Servicio.`
  },
  {
    icon: UserCheck,
    title: "2. Autorización de Tratamiento — Ley 1581 de 2012",
    content: `En cumplimiento del artículo 9 de la Ley 1581 de 2012 y el artículo 3 del Decreto 1377 de 2013, solicitamos tu autorización **previa, expresa e informada** para el tratamiento de tus datos personales.

**Al aceptar estos Términos de Servicio o al registrarte en la Plataforma, el Usuario autoriza a BLP Consulting Group S.A.S. para:**

• Recopilar, almacenar, usar, circular y suprimir los datos personales listados en la Sección 3
• Usar los datos para las finalidades descritas en la Sección 4
• Transferir o transmitir los datos a los subencargados listados en la Sección 6 (Supabase, Anthropic, Vercel, Stripe, Resend)
• Conservar los datos durante el período descrito en la Sección 9

**Derechos del titular:** Como titular de los datos, tienes los derechos de conocer, actualizar, rectificar y suprimir tus datos, así como de revocar esta autorización, conforme a la Sección 10.

Esta autorización puede ser revocada en cualquier momento escribiendo a privacidad@luuc.ai, sin efectos retroactivos sobre el tratamiento ya realizado conforme a la ley.`
  },
  {
    icon: Database,
    title: "3. Datos Personales que Recopilamos",
    content: `Recopilamos únicamente los datos necesarios para la prestación del Servicio:

**Datos de cuenta:**
• Nombre completo y correo electrónico
• Nombre de empresa (opcional)
• País y sector de la empresa

**Datos de uso:**
• Documentos que generas y analizas a través de la Plataforma
• Información que subes a tu base de conocimiento privada
• Historial de acciones en la plataforma (log de auditoría)

**Datos técnicos:**
• Dirección IP y tipo de navegador (para seguridad y rate limiting)
• Información del dispositivo y sistema operativo
• Registros de acceso (timestamps, rutas API)

**Datos de terceros cargados por el Usuario:**
Si el Usuario carga documentos que contienen datos de sus propios clientes, esos datos son tratados bajo las condiciones del Acuerdo de Tratamiento de Datos de la Sección 6 de los Términos de Servicio. BLP trata esos datos exclusivamente con la finalidad de prestar el Servicio.`
  },
  {
    icon: Eye,
    title: "4. Finalidades del Tratamiento",
    content: `Utilizamos tus datos exclusivamente para:

**Prestación del Servicio (finalidad principal):**
• Generar y analizar documentos legales
• Personalizar documentos con datos de tu empresa
• Contextualizar la IA con tu base de conocimiento privada

**Seguridad y cumplimiento:**
• Detectar, prevenir e investigar fraudes y accesos no autorizados
• Registrar acciones para auditoría interna e investigación de incidentes
• Cumplir con obligaciones legales y responder a requerimientos de autoridades competentes

**Mejora del Servicio (con datos anonimizados):**
• Analizar patrones de uso de forma agregada y anónima
• Desarrollar nuevas funcionalidades

**Comunicaciones de servicio:**
• Notificarte sobre actualizaciones importantes, cambios en los Términos o incidentes de seguridad
• Responder a tus consultas de soporte

**Marketing (solo con consentimiento adicional explícito):**
• Comunicaciones promocionales — únicamente si has dado tu consentimiento expreso separado para ello`
  },
  {
    icon: Lock,
    title: "5. Seguridad de los Datos",
    content: `Implementamos medidas técnicas y organizativas para proteger tu información:

**Cifrado:**
• AES-256 para datos en reposo (implementado por Supabase sobre AWS)
• TLS 1.3 para datos en tránsito
• HTTPS enforced con HSTS de 2 años

**Aislamiento:**
• Row Level Security (RLS) en base de datos — cada organización accede únicamente a sus propios datos
• Es técnicamente imposible que los datos de una firma sean accesibles desde otra cuenta

**Controles de acceso:**
• Autenticación segura con verificación de token en cada solicitud
• Rate limiting por IP y por usuario para prevenir ataques de fuerza bruta
• Log de auditoría inmutable — todas las acciones quedan registradas y no pueden ser modificadas ni eliminadas

**Notificación de brechas:**
• En caso de brecha de seguridad que afecte datos personales, notificaremos a los usuarios afectados y a la Superintendencia de Industria y Comercio (SIC) en los plazos establecidos por la ley`
  },
  {
    icon: Server,
    title: "6. Subencargados — Transferencia a Terceros",
    content: `BLP transfiere datos a los siguientes subencargados únicamente para la prestación del Servicio. Cada uno está vinculado por acuerdos de procesamiento de datos equivalentes:

**Supabase Inc. (EE.UU.) — Base de datos y autenticación:**
• SOC 2 Type II · ISO 27001 · GDPR compliant
• Infraestructura sobre AWS us-east-1 (Virginia, EE.UU.)
• Datos: todos los datos de cuenta, documentos e historial

**Anthropic, Inc. (EE.UU.) — Procesamiento de IA (Claude):**
• No entrena modelos con datos del API ([Términos Comerciales](https://www.anthropic.com/legal/commercial-terms))
• Data Processing Addendum (DPA) vigente por defecto ([DPA](https://www.anthropic.com/legal/data-processing-addendum))
• Retención temporal máxima: 30 días para monitoreo de seguridad, luego eliminación
• Datos: contenido de documentos y prompts enviados para generación o análisis

**Vercel Inc. (EE.UU.) — Hosting y CDN:**
• SOC 2 Type II · ISO 27001 · GDPR compliant
• Datos: metadatos de tráfico, logs de acceso de corta duración

**Stripe Inc. (EE.UU.) — Procesamiento de pagos:**
• PCI DSS Level 1 (máximo nivel)
• Datos: información de pago — BLP no almacena datos de tarjetas

**Resend Inc. (EE.UU.) — Emails transaccionales:**
• Datos: correo electrónico y contenido de emails de servicio

**Resend vs. marketing:** Los emails de marketing solo se envían con tu consentimiento adicional explícito.`
  },
  {
    icon: Globe,
    title: "7. Transferencias Internacionales — Art. 26 Ley 1581",
    content: `Los subencargados listados en la Sección 6 tienen sede en los Estados Unidos de América. En virtud del artículo 26 de la Ley 1581 de 2012, la transferencia internacional de datos personales a países que no proporcionan niveles adecuados de protección requiere garantías apropiadas.

**Mecanismos de garantía implementados:**

• **Cláusulas contractuales:** Los acuerdos con Supabase, Anthropic y Vercel incorporan cláusulas estándar de protección de datos que obligan al receptor a mantener niveles de protección equivalentes a los exigidos por la ley colombiana.

• **Certificaciones de cumplimiento:** Supabase y Vercel cuentan con certificación SOC 2 Type II e ISO 27001. Anthropic opera bajo su DPA comercial. Stripe cumple con PCI DSS Level 1.

• **Alcance de la transferencia:** Los datos se transfieren únicamente con las finalidades descritas en esta Política. Los subencargados no pueden usar los datos para fines distintos a los contratados.

• **GDPR de referencia:** Aunque Luuc.ai no está sujeto al GDPR como norma aplicable directa, nuestros subencargados cumplen con el GDPR europeo, cuyo nivel de protección sirve como estándar de referencia para las garantías exigidas bajo el artículo 26 de la Ley 1581.

Al aceptar estos Términos, el Usuario autoriza expresamente estas transferencias internacionales conforme al artículo 9 literal a) de la Ley 1581.`
  },
  {
    icon: FileText,
    title: "8. Confidencialidad de Documentos",
    content: `Los documentos procesados a través de Luuc.ai son tratados con estricta confidencialidad:

**No compartimos:** Nunca vendemos, alquilamos ni compartimos el contenido de tus documentos con terceros no autorizados.

**No entrenamos modelos con tus datos:** El contenido de los documentos NO se utiliza para entrenar modelos de IA. Este compromiso está garantizado contractualmente por los Términos Comerciales de Anthropic y su Data Processing Addendum (DPA). Puedes verificarlos directamente: [Términos Comerciales](https://www.anthropic.com/legal/commercial-terms) · [DPA de Anthropic](https://www.anthropic.com/legal/data-processing-addendum)

**Acceso limitado:** Ningún empleado de BLP accede al contenido de tus documentos en el curso normal de operaciones. El acceso solo es posible en el contexto de una investigación de incidente de seguridad específica, con autorización documentada.

**Retención temporal por Anthropic:** Los prompts enviados al API de Claude pueden ser retenidos por Anthropic por hasta 30 días con fines de seguridad, conforme a su política estándar. Anthropic NO usa estos datos para entrenar modelos. BLP gestiona la implementación de Zero Data Retention (ZDR) con Anthropic para eliminar esta ventana.

**Casos INA §1367 (VAWA, U-Visa, T-Visa):** Para casos con protección federal especial, los documentos generados durante el período de retención de Anthropic estarían técnicamente accesibles bajo una orden judicial federal válida. BLP recomienda que las firmas que manejen exclusivamente estos casos evalúen esta ventana con su oficial de cumplimiento antes de usar la Plataforma para esas materias específicas.`
  },
  {
    icon: Trash2,
    title: "9. Retención de Datos",
    content: `**Cuenta activa:** Los datos se conservan mientras la cuenta esté activa para prestar el Servicio.

**Solicitud de eliminación:** Al solicitar la eliminación de la cuenta, BLP eliminará todos los datos personales identificables dentro de los 30 días siguientes, salvo los que deba conservar por obligación legal.

**Datos que deben conservarse por ley:** Ciertos registros de facturación y transacciones pueden conservarse el tiempo exigido por la legislación tributaria colombiana aplicable.

**Datos anonimizados:** BLP puede conservar datos estadísticos agregados e irreversiblemente anonimizados de forma indefinida.

**Procesamiento por IA (Anthropic):** Los prompts enviados al API de Claude se retienen por Anthropic máximo 30 días para seguridad, luego son eliminados. No se usan para entrenamiento de modelos.`
  },
  {
    icon: UserCheck,
    title: "10. Derechos del Titular de los Datos",
    content: `Como titular de datos personales, tienes los siguientes derechos bajo la Ley 1581 de 2012:

**Conocer (acceso):** Puedes solicitar una copia de todos los datos personales que tenemos sobre ti, su origen, uso y las cesiones realizadas.

**Actualizar y rectificar:** Puedes actualizar o corregir tu información personal en cualquier momento desde tu perfil o escribiendo a privacidad@luuc.ai.

**Suprimir ("derecho al olvido"):** Puedes solicitar la eliminación de tus datos cuando: (i) no sean necesarios para las finalidades declaradas, (ii) hayas revocado la autorización, o (iii) los datos sean tratados en violación de la ley. Este derecho está sujeto a las excepciones legales aplicables.

**Revocar la autorización:** Puedes revocar la autorización de tratamiento en cualquier momento, sin efectos retroactivos. La revocación puede implicar la imposibilidad de continuar prestando el Servicio.

**Presentar queja:** Puedes presentar quejas ante la Superintendencia de Industria y Comercio (SIC) si consideras que BLP ha vulnerado tus derechos como titular.

**Portabilidad:** Puedes exportar tus documentos generados en formatos estándar (PDF, DOCX) en cualquier momento desde tu panel.

**Cómo ejercer tus derechos:** Escribe a privacidad@luuc.ai con asunto "Derechos Ley 1581" e indica el derecho que deseas ejercer. BLP responderá dentro de los 10 días hábiles siguientes.`
  },
];

function renderLine(line: string, lineIndex: number) {
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
            recopilamos, usamos y protegemos tu información, y recoge la autorización
            de tratamiento exigida por la Ley 1581 de 2012.
          </p>
          <div className="mt-4 space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Última actualización: Agosto 2026
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Responsable: <strong className="text-slate-700 dark:text-slate-300">BLP Consulting Group S.A.S.</strong> operando como Luuc.ai
            </p>
          </div>
        </div>

        {/* Key Points */}
        <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
          <h2 className="mb-4 text-lg font-semibold text-green-900 dark:text-green-300">
            Puntos Clave
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Tus documentos NO se usan para entrenar IA",
              "Datos cifrados en tránsito y en reposo",
              "Aislamiento técnico total entre organizaciones",
              "Puedes solicitar la eliminación de tus datos en cualquier momento",
              "DPA con Anthropic vigente por defecto",
              "Transferencias internacionales garantizadas bajo Art. 26 Ley 1581",
            ].map((point) => (
              <div key={point} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-300">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GDPR disclaimer */}
        <div className="mb-12 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Aclaración sobre cumplimiento normativo:</strong> BLP Consulting Group S.A.S. es una sociedad colombiana sujeta principalmente a la Ley 1581 de 2012 (Habeas Data). Las referencias a GDPR en esta Política describen las certificaciones de cumplimiento de nuestros proveedores de infraestructura (Supabase, Vercel) — no implican que Luuc.ai esté directamente sujeto al GDPR ni que cuente con acreditación formal ante una Autoridad de Control europea.
            </p>
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
            Para ejercer tus derechos bajo la Ley 1581 o para cualquier consulta sobre esta Política, contáctanos. BLP Consulting Group S.A.S. responde dentro de los 10 días hábiles siguientes.
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
