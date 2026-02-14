// ===========================================
// LUUC.AI - Email Templates
// ===========================================
// HTML and plain text email templates
// Brand color: #2563eb (blue-600)

const BRAND_COLOR = "#2563eb";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://luuc.ai";

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Luuc.ai</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              <h1 style="margin: 0; color: ${BRAND_COLOR}; font-size: 28px; font-weight: 700;">
                Luuc.ai
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #64748b; text-align: center;">
                © ${new Date().getFullYear()} Luuc.ai - Automatización legal para Latinoamérica
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                <a href="${APP_URL}/configuracion" style="color: ${BRAND_COLOR}; text-decoration: none;">Configuración</a> •
                <a href="${APP_URL}/privacidad" style="color: ${BRAND_COLOR}; text-decoration: none;">Privacidad</a> •
                <a href="${APP_URL}/terminos" style="color: ${BRAND_COLOR}; text-decoration: none;">Términos</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function buttonHTML(text: string, url: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
      <tr>
        <td align="center">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

// ===========================================
// WELCOME EMAIL
// ===========================================

export function welcomeEmailTemplate(name: string): {
  html: string;
  text: string;
} {
  const content = `
    <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 600;">
      ¡Bienvenido a Luuc.ai, ${name}!
    </h2>

    <p style="margin: 0 0 15px; color: #475569; font-size: 16px; line-height: 1.6;">
      Estamos emocionados de tenerte con nosotros. Luuc.ai es tu asistente legal inteligente diseñado para automatizar la redacción y revisión de documentos legales en Latinoamérica.
    </p>

    <p style="margin: 0 0 15px; color: #475569; font-size: 16px; line-height: 1.6;">
      <strong>¿Qué puedes hacer con Luuc.ai?</strong>
    </p>

    <ul style="margin: 0 0 20px; padding-left: 20px; color: #475569; font-size: 16px; line-height: 1.8;">
      <li>Redactar contratos, NDAs, cartas y más documentos legales</li>
      <li>Analizar documentos existentes y detectar riesgos</li>
      <li>Gestionar tu biblioteca de conocimiento legal</li>
      <li>Exportar documentos en PDF y DOCX</li>
    </ul>

    ${buttonHTML("Ir al Dashboard", `${APP_URL}/dashboard`)}

    <p style="margin: 20px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Si tienes alguna pregunta, no dudes en responder a este email. Estamos aquí para ayudarte.
    </p>

    <p style="margin: 15px 0 0; color: #475569; font-size: 16px;">
      Saludos,<br>
      <strong>El equipo de Luuc.ai</strong>
    </p>
  `;

  const html = baseTemplate(content);

  const text = `
¡Bienvenido a Luuc.ai, ${name}!

Estamos emocionados de tenerte con nosotros. Luuc.ai es tu asistente legal inteligente diseñado para automatizar la redacción y revisión de documentos legales en Latinoamérica.

¿Qué puedes hacer con Luuc.ai?

• Redactar contratos, NDAs, cartas y más documentos legales
• Analizar documentos existentes y detectar riesgos
• Gestionar tu biblioteca de conocimiento legal
• Exportar documentos en PDF y DOCX

Ir al Dashboard: ${APP_URL}/dashboard

Si tienes alguna pregunta, no dudes en responder a este email. Estamos aquí para ayudarte.

Saludos,
El equipo de Luuc.ai
  `.trim();

  return { html, text };
}

// ===========================================
// DOCUMENT READY EMAIL
// ===========================================

export function documentReadyEmailTemplate(
  docTitle: string,
  documentUrl: string
): { html: string; text: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 600;">
      Tu documento está listo
    </h2>

    <p style="margin: 0 0 15px; color: #475569; font-size: 16px; line-height: 1.6;">
      Hemos terminado de generar tu documento:
    </p>

    <div style="margin: 20px 0; padding: 20px; background-color: #f1f5f9; border-left: 4px solid ${BRAND_COLOR}; border-radius: 4px;">
      <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 600;">
        ${docTitle}
      </p>
    </div>

    <p style="margin: 0 0 15px; color: #475569; font-size: 16px; line-height: 1.6;">
      Puedes revisarlo, editarlo y descargarlo en formato PDF o DOCX desde tu panel de control.
    </p>

    ${buttonHTML("Ver documento", documentUrl)}

    <p style="margin: 20px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Recuerda: todos los documentos generados deben ser revisados por un profesional legal antes de ser utilizados.
    </p>

    <p style="margin: 15px 0 0; color: #475569; font-size: 16px;">
      Saludos,<br>
      <strong>El equipo de Luuc.ai</strong>
    </p>
  `;

  const html = baseTemplate(content);

  const text = `
Tu documento está listo

Hemos terminado de generar tu documento:
"${docTitle}"

Puedes revisarlo, editarlo y descargarlo en formato PDF o DOCX desde tu panel de control.

Ver documento: ${documentUrl}

Recuerda: todos los documentos generados deben ser revisados por un profesional legal antes de ser utilizados.

Saludos,
El equipo de Luuc.ai
  `.trim();

  return { html, text };
}

// ===========================================
// PASSWORD RESET EMAIL
// ===========================================

export function passwordResetEmailTemplate(resetLink: string): {
  html: string;
  text: string;
} {
  const content = `
    <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 600;">
      Restablece tu contraseña
    </h2>

    <p style="margin: 0 0 15px; color: #475569; font-size: 16px; line-height: 1.6;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en Luuc.ai.
    </p>

    <p style="margin: 0 0 15px; color: #475569; font-size: 16px; line-height: 1.6;">
      Haz clic en el botón a continuación para crear una nueva contraseña:
    </p>

    ${buttonHTML("Restablecer contraseña", resetLink)}

    <p style="margin: 20px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Este enlace expirará en 1 hora por razones de seguridad.
    </p>

    <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        <strong>⚠️ Importante:</strong> Si no solicitaste restablecer tu contraseña, ignora este email. Tu cuenta permanecerá segura.
      </p>
    </div>

    <p style="margin: 15px 0 0; color: #475569; font-size: 16px;">
      Saludos,<br>
      <strong>El equipo de Luuc.ai</strong>
    </p>
  `;

  const html = baseTemplate(content);

  const text = `
Restablece tu contraseña

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Luuc.ai.

Haz clic en el siguiente enlace para crear una nueva contraseña:
${resetLink}

Este enlace expirará en 1 hora por razones de seguridad.

⚠️ IMPORTANTE: Si no solicitaste restablecer tu contraseña, ignora este email. Tu cuenta permanecerá segura.

Saludos,
El equipo de Luuc.ai
  `.trim();

  return { html, text };
}

// ===========================================
// UPGRADE CONFIRMATION EMAIL
// ===========================================

export function upgradeConfirmationEmailTemplate(
  plan: string,
  name?: string
): { html: string; text: string } {
  const planNames: Record<string, string> = {
    plus: "Plus",
    pro: "Pro",
    enterprise: "Enterprise",
  };

  const planName = planNames[plan.toLowerCase()] || plan;
  const greeting = name ? `${name}` : "allí";

  const planFeatures =
    plan === "plus"
      ? `
        <li>100 documentos generados por mes</li>
        <li>50 análisis de documentos por mes</li>
        <li>Exportación en PDF y DOCX</li>
        <li>Soporte prioritario</li>
      `
      : plan === "pro"
      ? `
        <li>Documentos ilimitados</li>
        <li>Análisis ilimitados</li>
        <li>Knowledge Base hasta 500MB</li>
        <li>Exportación en PDF y DOCX</li>
        <li>Soporte prioritario 24/7</li>
        <li>Plantillas personalizadas</li>
      `
      : `
        <li>Todo lo incluido en Pro</li>
        <li>Knowledge Base ilimitada</li>
        <li>Usuarios ilimitados</li>
        <li>API access</li>
        <li>Gerente de cuenta dedicado</li>
        <li>SLA garantizado</li>
      `;

  const content = `
    <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 600;">
      ¡Tu plan ${planName} está activo! 🎉
    </h2>

    <p style="margin: 0 0 15px; color: #475569; font-size: 16px; line-height: 1.6;">
      Hola ${greeting},
    </p>

    <p style="margin: 0 0 15px; color: #475569; font-size: 16px; line-height: 1.6;">
      Gracias por actualizar a nuestro plan <strong>${planName}</strong>. Tu suscripción está ahora activa y puedes disfrutar de todas las funcionalidades avanzadas.
    </p>

    <div style="margin: 20px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid ${BRAND_COLOR}; border-radius: 4px;">
      <p style="margin: 0 0 10px; color: #0f172a; font-size: 16px; font-weight: 600;">
        Beneficios de tu plan ${planName}:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 15px; line-height: 1.8;">
        ${planFeatures}
      </ul>
    </div>

    ${buttonHTML("Ir al Dashboard", `${APP_URL}/dashboard`)}

    <p style="margin: 20px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
      Puedes gestionar tu suscripción en cualquier momento desde la sección de Configuración.
    </p>

    <p style="margin: 15px 0 0; color: #475569; font-size: 16px;">
      ¡Gracias por confiar en Luuc.ai!<br>
      <strong>El equipo de Luuc.ai</strong>
    </p>
  `;

  const html = baseTemplate(content);

  const planFeaturesText =
    plan === "plus"
      ? `
• 100 documentos generados por mes
• 50 análisis de documentos por mes
• Exportación en PDF y DOCX
• Soporte prioritario`
      : plan === "pro"
      ? `
• Documentos ilimitados
• Análisis ilimitados
• Knowledge Base hasta 500MB
• Exportación en PDF y DOCX
• Soporte prioritario 24/7
• Plantillas personalizadas`
      : `
• Todo lo incluido en Pro
• Knowledge Base ilimitada
• Usuarios ilimitados
• API access
• Gerente de cuenta dedicado
• SLA garantizado`;

  const text = `
¡Tu plan ${planName} está activo! 🎉

Hola ${greeting},

Gracias por actualizar a nuestro plan ${planName}. Tu suscripción está ahora activa y puedes disfrutar de todas las funcionalidades avanzadas.

Beneficios de tu plan ${planName}:
${planFeaturesText}

Ir al Dashboard: ${APP_URL}/dashboard

Puedes gestionar tu suscripción en cualquier momento desde la sección de Configuración.

¡Gracias por confiar en Luuc.ai!
El equipo de Luuc.ai
  `.trim();

  return { html, text };
}
