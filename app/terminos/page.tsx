import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Scale, Users, CreditCard, Shield, FileWarning, Mail, Handshake, Globe } from "lucide-react";

const sections = [
  {
    icon: FileText,
    title: "1. Partes y Aceptación",
    content: `Al acceder y utilizar Luuc.ai ("el Servicio" o "la Plataforma"), aceptas estar sujeto a estos Términos de Servicio ("Términos").

**Prestador del Servicio:** El Servicio es prestado por **BLP Consulting Group S.A.S.** (en adelante "BLP", "nosotros" o "el Prestador"), sociedad comercial constituida bajo las leyes de la República de Colombia, que opera comercialmente la plataforma bajo la marca **Luuc.ai**. BLP Consulting Group S.A.S. es el sujeto contractualmente responsable ante el Usuario.

**Usuario:** Toda persona natural o jurídica que accede al Servicio en nombre propio o de su organización (en adelante "el Usuario" o "tú").

Si actúas en representación de una persona jurídica, declaras tener capacidad legal para vincularla.

Si no estás de acuerdo con alguna parte de estos Términos, no podrás acceder al Servicio.`
  },
  {
    icon: Scale,
    title: "2. Descripción del Servicio",
    content: `Luuc.ai es una plataforma de asistencia legal impulsada por inteligencia artificial que permite:

• Generación de documentos legales (contratos, NDAs, políticas, etc.)
• Revisión y análisis de riesgos en documentos existentes
• Almacenamiento y gestión de documentos por firma
• Base de conocimiento privada para contextualizar la IA con documentos de la firma

**IMPORTANTE — Sin práctica del derecho:** El Servicio es una herramienta de productividad que genera borradores. No constituye asesoría legal profesional ni relación abogado-cliente con BLP. Los documentos generados deben ser revisados por un abogado licenciado antes de su uso en transacciones reales. Luuc.ai no garantiza la validez jurídica de los documentos en ninguna jurisdicción.`
  },
  {
    icon: Users,
    title: "3. Registro y Cuenta",
    content: `Para usar el Servicio, debes:

• Proporcionar información veraz, exacta y actualizada
• Mantener la confidencialidad de tus credenciales de acceso
• Notificarnos inmediatamente ante cualquier uso no autorizado de tu cuenta
• Ser mayor de 18 años o la mayoría de edad legal en tu jurisdicción
• Tener capacidad jurídica para celebrar contratos

Eres responsable de todas las actividades que ocurran bajo tu cuenta. BLP no será responsable por pérdidas derivadas del uso no autorizado de tu cuenta.`
  },
  {
    icon: CheckCircle2,
    title: "4. Uso Aceptable",
    content: `Te comprometes a usar el Servicio de manera responsable y legal. Queda prohibido:

• Usar el Servicio para actividades ilegales, fraudulentas o que violen derechos de terceros
• Intentar acceder a datos o cuentas de otros usuarios
• Reproducir, duplicar o revender el Servicio sin autorización escrita
• Subir contenido malicioso, virus o código dañino
• Interferir con el funcionamiento normal del Servicio
• Usar el Servicio para generar documentos con fines ilícitos
• Intentar eludir controles de seguridad o limitaciones de la plataforma
• Realizar ingeniería inversa del código fuente`
  },
  {
    icon: FileWarning,
    title: "5. Propiedad Intelectual",
    content: `**Tu contenido:** Los documentos que generes a través de Luuc.ai son de tu propiedad. Nos otorgas una licencia no exclusiva, limitada y revocable para procesar tu contenido únicamente con el fin de proporcionar el Servicio.

**Contenido de la Plataforma:** La plataforma, su diseño, código fuente, marca, logotipos, algoritmos y plantillas base son propiedad exclusiva de BLP Consulting Group S.A.S. y están protegidos por leyes de propiedad intelectual colombianas e internacionales.

**Plantillas:** Las plantillas base pueden usarse para generar documentos internos, pero no pueden redistribuirse ni comercializarse de forma independiente.

**Retroalimentación:** Cualquier sugerencia o comentario que envíes sobre el Servicio podrá ser usado por BLP sin restricción ni compensación.`
  },
  {
    icon: Handshake,
    title: "6. Acuerdo de Tratamiento de Datos entre Partes",
    content: `Cuando el Usuario carga información de sus propios clientes (personas naturales) a la Plataforma — incluyendo documentos, datos de partes contractuales o información de terceros — BLP actúa como **Encargado del Tratamiento** de esos datos personales de terceros, y el Usuario actúa como **Responsable del Tratamiento** en los términos de la Ley 1581 de 2012 y el Decreto 1377 de 2013.

**Obligaciones del Prestador como Encargado:**
• Tratar los datos personales de los clientes del Usuario únicamente conforme a las instrucciones documentadas del Usuario
• No ceder ni transferir esos datos a terceros salvo a los subencargados listados en la Política de Privacidad (Supabase, Anthropic, Vercel), quienes están vinculados por acuerdos contractuales equivalentes
• Implementar medidas técnicas y organizativas adecuadas conforme al artículo 17 de la Ley 1581
• Notificar al Usuario de cualquier brecha de seguridad que afecte los datos dentro de las 72 horas siguientes a su conocimiento
• Eliminar o devolver todos los datos personales de terceros al término del contrato, a elección del Usuario, dentro de los 30 días siguientes

**Obligaciones del Usuario como Responsable:**
• Haber obtenido las autorizaciones de tratamiento de datos requeridas por ley de sus propios clientes antes de cargar información a la Plataforma
• Cumplir con las finalidades declaradas al titular de los datos
• Responder directamente ante los titulares por el ejercicio de sus derechos (acceso, corrección, supresión, revocación)

**Subencargados autorizados:** El Usuario autoriza expresamente la transferencia de datos a los subencargados listados en la Política de Privacidad con las finalidades allí descritas.`
  },
  {
    icon: CreditCard,
    title: "7. Planes y Pagos",
    content: `**Planes gratuitos:** El plan Free tiene límites de uso mensual. Al alcanzar los límites, deberás actualizar a un plan de pago para continuar usando el Servicio.

**Planes de pago:** Los pagos se procesan a través de Stripe. Los precios están expresados en USD.

**Facturación:** La suscripción se renueva automáticamente. Puedes cancelar en cualquier momento desde tu panel de configuración.

**Reembolsos:** Ofrecemos reembolso completo dentro de los primeros 14 días calendario si no estás satisfecho con el Servicio, siempre que el uso no supere el 20% de la cuota mensual.

**Impuestos:** El Usuario es responsable de los impuestos locales aplicables en su jurisdicción.`
  },
  {
    icon: AlertTriangle,
    title: "8. Limitación de Responsabilidad",
    content: `**Descargo de garantías:** El Servicio se proporciona "tal cual" ("as is") sin garantías de ningún tipo, expresas o implícitas. BLP no garantiza que los documentos generados sean legalmente válidos, completos o adecuados para ningún propósito específico en ninguna jurisdicción.

**Uso profesional obligatorio:** Los Usuarios deben consultar con un abogado licenciado antes de usar cualquier documento generado en transacciones legales reales.

**Límite de responsabilidad:** En ningún caso BLP será responsable por daños indirectos, incidentales, especiales o consecuentes, incluyendo pérdida de beneficios, pérdida de datos o daños reputacionales. La responsabilidad total de BLP ante el Usuario no excederá el monto efectivamente pagado por el Servicio en los 12 meses anteriores al evento generador del daño.

**Fuerza mayor:** BLP no será responsable por incumplimientos derivados de causas fuera de su control razonable.`
  },
  {
    icon: Shield,
    title: "9. Privacidad y Seguridad",
    content: `El tratamiento de datos personales se rige por nuestra Política de Privacidad y por el Acuerdo de Tratamiento de Datos establecido en la Sección 6 de estos Términos.

Implementamos medidas de seguridad técnicas y organizativas que incluyen cifrado en tránsito y en reposo, aislamiento de datos por empresa mediante Row Level Security, y registro de auditoría inmutable.

Para más información sobre las medidas de seguridad, consulta nuestra página de Seguridad.`
  },
  {
    icon: FileText,
    title: "10. Modificaciones al Servicio y los Términos",
    content: `BLP se reserva el derecho de modificar estos Términos en cualquier momento. Para cambios materiales que afecten derechos sustanciales del Usuario, notificaremos con al menos **30 días** de anticipación a través del correo electrónico asociado a la cuenta.

El uso continuado del Servicio después de la fecha efectiva de los cambios constituye aceptación de los Términos modificados. Si no aceptas los cambios, deberás cesar el uso del Servicio.

BLP puede también modificar, suspender o discontinuar el Servicio con 30 días de preaviso, salvo en casos de emergencia de seguridad o cumplimiento normativo.`
  },
  {
    icon: Globe,
    title: "11. Ley Aplicable y Resolución de Disputas",
    content: `**Ley aplicable:** Estos Términos se rigen por las leyes de la República de Colombia, incluyendo la Ley 1581 de 2012 y el Código de Comercio.

**Resolución de disputas — procedimiento escalonado:**

1. **Negociación directa:** Las partes intentarán resolver cualquier disputa mediante negociación de buena fe durante 30 días calendario desde la notificación escrita del conflicto.

2. **Arbitraje — Usuarios en Colombia y Latinoamérica:** Si no hay acuerdo, la disputa se someterá a arbitraje administrado por el Centro de Arbitraje y Conciliación de la Cámara de Comercio de Bogotá, bajo su Reglamento de Arbitraje vigente. Idioma: español. Lugar: Bogotá, Colombia.

3. **Arbitraje — Usuarios domiciliados en los Estados Unidos:** Las disputas podrán someterse alternativamente a arbitraje virtual administrado por la Cámara de Comercio Internacional (ICC), bajo sus Reglas de Arbitraje vigentes, en idioma inglés y mediante audiencias en línea, sin requerir presencia física en Colombia. Las partes acuerdan este mecanismo como alternativa igualmente válida al arbitraje en Bogotá.

**Renuncia a acciones colectivas:** Cada parte renuncia a iniciar o participar en acciones de clase o colectivas relacionadas con el Servicio.

**Jurisdicción supletoria:** Para asuntos no arbitrables, las partes se someten a la jurisdicción de los juzgados civiles del Circuito de Bogotá.`
  },
  {
    icon: Scale,
    title: "12. Disposiciones Generales",
    content: `**Integración:** Estos Términos, junto con la Política de Privacidad y el Acuerdo de Tratamiento de Datos (Sección 6), constituyen el acuerdo completo entre las partes respecto al Servicio.

**Divisibilidad:** Si alguna disposición de estos Términos resulta inválida o inaplicable, las demás disposiciones permanecerán en plena vigencia.

**No renuncia:** La falta de ejercicio de un derecho bajo estos Términos no constituye renuncia al mismo.

**Cesión:** El Usuario no puede ceder ni transferir sus derechos bajo estos Términos sin el consentimiento previo y escrito de BLP. BLP puede ceder estos Términos en el contexto de una fusión, adquisición o venta de activos.

**Idioma:** La versión en español de estos Términos prevalece sobre cualquier traducción.`
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
          <div className="mt-4 space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Última actualización: Agosto 2026
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Prestador: <strong className="text-slate-700 dark:text-slate-300">BLP Consulting Group S.A.S.</strong> operando como Luuc.ai
            </p>
          </div>
        </div>

        {/* Notice banner */}
        <div className="mb-12 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Aviso legal:</strong> El servicio Luuc.ai es operado por <strong>BLP Consulting Group S.A.S.</strong>, sociedad constituida conforme a las leyes de Colombia. La denominación comercial "Luuc.ai" identifica la plataforma, no una persona jurídica separada. Todos los derechos, obligaciones y responsabilidades contractuales corresponden a BLP Consulting Group S.A.S.
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
            Si tienes alguna duda sobre estos Términos, escríbenos. BLP Consulting Group S.A.S. responde en nombre de Luuc.ai.
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
