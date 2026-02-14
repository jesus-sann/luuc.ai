// ===========================================
// LUUC.AI - Email Service (Resend)
// ===========================================
// Handles all transactional emails via Resend API
// Emails are sent asynchronously to avoid blocking API responses

import type { Resend } from "resend";
import {
  welcomeEmailTemplate,
  documentReadyEmailTemplate,
  passwordResetEmailTemplate,
  upgradeConfirmationEmailTemplate,
} from "./email-templates";

// ===========================================
// TYPE DEFINITIONS
// ===========================================

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

let resendClient: Resend | null = null;

// ===========================================
// INITIALIZATION
// ===========================================

async function initResend(): Promise<Resend | null> {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      "[EMAIL] RESEND_API_KEY not configured. Email functionality disabled."
    );
    return null;
  }

  try {
    const { Resend } = await import("resend");
    resendClient = new Resend(apiKey);
    return resendClient;
  } catch {
    console.warn("[EMAIL] resend package not installed. Run: npm install resend");
    return null;
  }
}

// ===========================================
// CORE EMAIL FUNCTION
// ===========================================

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const resend = await initResend();

  if (!resend) {
    console.warn("[EMAIL] Skipping email send (Resend not configured):", {
      to: options.to,
      subject: options.subject,
    });
    return false;
  }

  const emailFrom = process.env.EMAIL_FROM || "noreply@luuc.ai";

  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error("[EMAIL] Failed to send email:", error);
      return false;
    }

    console.log("[EMAIL] Email sent successfully:", {
      id: data?.id,
      to: options.to,
      subject: options.subject,
    });
    return true;
  } catch (error) {
    console.error("[EMAIL] Exception sending email:", error);
    return false;
  }
}

// ===========================================
// EMAIL FUNCTIONS
// ===========================================

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  const { html, text } = welcomeEmailTemplate(name);

  return sendEmail({
    to: email,
    subject: "¡Bienvenido a Luuc.ai! 🚀",
    html,
    text,
  });
}

export async function sendDocumentReadyEmail(
  email: string,
  docTitle: string,
  docId: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://luuc.ai";
  const documentUrl = `${appUrl}/dashboard/documentos?doc=${docId}`;

  const { html, text } = documentReadyEmailTemplate(docTitle, documentUrl);

  return sendEmail({
    to: email,
    subject: `Tu documento "${docTitle}" está listo`,
    html,
    text,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<boolean> {
  const { html, text } = passwordResetEmailTemplate(resetLink);

  return sendEmail({
    to: email,
    subject: "Restablece tu contraseña en Luuc.ai",
    html,
    text,
  });
}

export async function sendUpgradeConfirmationEmail(
  email: string,
  plan: string,
  name?: string
): Promise<boolean> {
  const { html, text } = upgradeConfirmationEmailTemplate(plan, name);

  return sendEmail({
    to: email,
    subject: `¡Tu plan ${plan} está activo!`,
    html,
    text,
  });
}

// ===========================================
// ASYNC WRAPPER (Fire and Forget)
// ===========================================

export function sendEmailAsync(emailFn: () => Promise<boolean>): void {
  emailFn().catch((error) => {
    console.error("[EMAIL] Async email send failed:", error);
  });
}
