// ===========================================
// LUUC.AI - Account Deletion API
// ===========================================
// Schedules account and company data deletion within 7 days.
// Only company owners and admins can request deletion.
//
// TODO: Supabase Edge Function or cron job to execute deletion after scheduled_for
// ===========================================

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { withRateLimit } from "@/lib/api-middleware";
import type { ApiResponse } from "@/types";

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildDeletionEmail(params: {
  userName: string | null;
  deletionId: string;
  requestedAt: Date;
  scheduledFor: Date;
}): string {
  const { userName, deletionId, requestedAt, scheduledFor } = params;
  const salutation = userName ? `Estimado/a ${userName}` : "Estimado/a usuario/a";
  const scheduledDateStr = formatDate(scheduledFor);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de eliminación de datos</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#1e293b;padding:28px 40px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Luuc.ai</p>
              <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Plataforma de Automatización Legal</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;color:#1e293b;font-size:16px;line-height:1.6;">${salutation},</p>
              <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">
                Hemos recibido su solicitud de eliminación de cuenta y datos en Luuc.ai.
              </p>

              <!-- Reference block -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:6px;border:1px solid #e2e8f0;margin:0 0 28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;width:220px;">Número de referencia</td>
                        <td style="padding:4px 0;color:#1e293b;font-size:13px;font-family:monospace;">${deletionId}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;">Fecha de solicitud</td>
                        <td style="padding:4px 0;color:#1e293b;font-size:13px;">${formatDate(requestedAt)}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:13px;">Eliminación programada para</td>
                        <td style="padding:4px 0;color:#dc2626;font-size:13px;font-weight:600;">${scheduledDateStr}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next steps -->
              <p style="margin:0 0 12px;color:#1e293b;font-size:15px;font-weight:600;">Qué sucede a continuación:</p>
              <ul style="margin:0 0 24px;padding-left:20px;color:#334155;font-size:14px;line-height:2;">
                <li>Sus datos permanecerán accesibles hasta la fecha de eliminación programada</li>
                <li>El ${scheduledDateStr} procederemos a eliminar todos sus documentos, datos de empresa, base de conocimiento, y registros de usuarios asociados a su cuenta</li>
                <li>Recibirá un certificado de eliminación de datos por correo electrónico una vez completado el proceso</li>
              </ul>

              <!-- Important notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border-radius:6px;border:1px solid #fcd34d;margin:0 0 28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;color:#92400e;font-size:13px;font-weight:600;">Importante</p>
                    <p style="margin:0;color:#78350f;font-size:13px;line-height:1.6;">
                      Los prompts procesados por Anthropic antes de esta fecha están sujetos a la política de retención de Anthropic (hasta 30 días). Luuc.ai no controla ni puede acelerar esta eliminación.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;color:#334155;font-size:14px;line-height:1.6;">
                Si desea cancelar esta solicitud, contáctenos antes del <strong>${scheduledDateStr}</strong> respondiendo a este correo.
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />

              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Luuc.ai — Plataforma de Automatización Legal
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function deleteHandler(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Only owners and admins can request deletion
    if (user.role !== "owner" && user.role !== "admin") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Solo el propietario o administrador puede solicitar la eliminación de la cuenta" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { confirm, reason } = body as { confirm?: boolean; reason?: string };

    if (confirm !== true) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Confirme la eliminación enviando confirm: true" },
        { status: 400 }
      );
    }

    // Resolve the effective company_id
    const effectiveCompanyId = user.company_id;

    if (!effectiveCompanyId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No se encontró empresa asociada a esta cuenta" },
        { status: 400 }
      );
    }

    // Prevent duplicate pending requests
    const { data: existing } = await supabaseAdmin
      .from("pending_deletions")
      .select("id, scheduled_for")
      .eq("company_id", effectiveCompanyId)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `Ya existe una solicitud de eliminación pendiente para esta empresa (programada para ${formatDate(new Date(existing.scheduled_for))})`,
        },
        { status: 409 }
      );
    }

    const deletionId = crypto.randomUUID();
    const requestedAt = new Date();
    const scheduledFor = new Date(requestedAt.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

    // Insert into pending_deletions
    const { error: insertError } = await supabaseAdmin
      .from("pending_deletions")
      .insert({
        id: deletionId,
        user_id: user.id,
        company_id: effectiveCompanyId,
        reason: reason?.trim() || null,
        status: "pending",
        requested_at: requestedAt.toISOString(),
        scheduled_for: scheduledFor.toISOString(),
      });

    if (insertError) {
      console.error("Error inserting pending deletion:", insertError);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al registrar la solicitud de eliminación" },
        { status: 500 }
      );
    }

    // Log to audit_logs
    await supabaseAdmin.from("audit_logs").insert({
      user_id: user.id,
      company_id: effectiveCompanyId,
      action: "account.deletion_requested",
      resource_type: "company",
      resource_id: effectiveCompanyId,
      metadata: {
        deletion_id: deletionId,
        scheduled_for: scheduledFor.toISOString(),
        reason: reason?.trim() || null,
      },
    });

    // Send confirmation email (fire-and-forget — do not block response)
    const emailHtml = buildDeletionEmail({
      userName: user.name,
      deletionId,
      requestedAt,
      scheduledFor,
    });

    sendEmail({
      to: user.email,
      subject: "Confirmación de solicitud de eliminación de datos — Luuc.ai",
      html: emailHtml,
      replyTo: process.env.EMAIL_FROM || "soporte@luuc.ai",
    }).catch((err) => {
      console.error("[account/delete] Failed to send deletion confirmation email:", err);
    });

    return NextResponse.json<ApiResponse<{ deletionId: string; scheduledFor: string; message: string }>>({
      success: true,
      data: {
        deletionId,
        scheduledFor: scheduledFor.toISOString(),
        message: `Solicitud de eliminación registrada. Sus datos serán eliminados el ${formatDate(scheduledFor)}. Recibirá un correo de confirmación.`,
      },
    });
  } catch (error) {
    console.error("Error in DELETE /api/account/delete:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const DELETE = withRateLimit(deleteHandler, "crud");
