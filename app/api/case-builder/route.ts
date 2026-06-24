export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateTextSimple } from "@/lib/ai-provider";
import { ApiResponse } from "@/types";
import { withRateLimit } from "@/lib/api-middleware";
import { getTemplateBySlug } from "@/lib/templates";
import { validateFocusContext } from "@/lib/validators";
import { auditLog } from "@/lib/audit-log";

// Files are parsed client-side via pdfjs-dist / FileReader.
// This route only receives extracted text (JSON), never binary — avoids 413.
async function handler(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "No autenticado" },
      { status: 401 }
    );
  }

  // Case analysis is a pre-generation step — it does not consume document quota.
  // The quota check runs in /api/generate when the actual document is produced.

  // ── Parse body ────────────────────────────────────────────────────────────
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Cuerpo de solicitud inválido" },
      { status: 400 }
    );
  }

  // ── Input sanitization ────────────────────────────────────────────────────
  // brief: free-text from attorney — check for prompt injection patterns
  const rawBrief = (typeof body.brief === "string" ? body.brief : "").trim().slice(0, 3000);
  if (rawBrief) {
    const briefCheck = validateFocusContext(rawBrief);
    if (!briefCheck.valid) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "El brief contiene patrones no permitidos" },
        { status: 400 }
      );
    }
  }
  const brief = rawBrief;

  // formsText: extracted text from case documents — null-byte guard (same as caseSummary in /api/generate)
  const rawForms = (typeof body.formsText === "string" ? body.formsText : "").trim().slice(0, 40000);
  if (rawForms.includes("\0")) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Contenido inválido" },
      { status: 400 }
    );
  }
  const formsText = rawForms;

  // templateSlug: looked up against static definitions — cap length to prevent abuse
  const templateSlug = (typeof body.template === "string" ? body.template : "").trim().slice(0, 100);

  if (!brief && !formsText) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Se requiere al menos un formulario o un brief del caso" },
      { status: 400 }
    );
  }

  const templateDef = templateSlug ? getTemplateBySlug(templateSlug) : undefined;
  const documentType = templateDef?.name || "documento legal";

  // ── Build Claude prompts ──────────────────────────────────────────────────
  const systemPrompt = `You are an expert immigration attorney and legal case analyst.

Read the provided case documents and/or brief, then produce a structured case summary that will be used to generate a ${documentType}.

Output EXACTLY these labeled sections (use the same language as the input):

PARTIES:
• [Applicant/Petitioner/Beneficiary names, A-numbers if present]

CASE TYPE:
• [Form numbers and application type]

KEY DATES:
• [Priority date, filing date, receipt date, interview date, etc.]

BASIS:
• [Legal ground or basis for the application]

SUPPORTING DOCUMENTS:
• [Evidence or documents referenced]

SPECIAL CIRCUMSTANCES:
• [Flags, waivers, prior denials, sensitive issues — or NONE]

Rules:
- Only state facts explicitly present in the input — never invent information
- Use [NOT PROVIDED] for any section where information is absent
- Keep each section to 2–5 bullet points
- Be concise but complete`;

  let userPrompt = `Generate a structured case summary for: ${documentType}\n\n`;

  if (formsText) {
    userPrompt += `UPLOADED FORMS/DOCUMENTS:\n${"═".repeat(60)}\n${formsText}\n${"═".repeat(60)}\n\n`;
  }

  if (brief) {
    userPrompt += `ATTORNEY'S CASE BRIEF:\n${"═".repeat(60)}\n${brief}\n${"═".repeat(60)}\n\n`;
  }

  userPrompt += `Structured case summary:`;

  // ── Call Claude ───────────────────────────────────────────────────────────
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? undefined;
  const ua = request.headers.get("user-agent") ?? undefined;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const summary = await generateTextSimple(systemPrompt, userPrompt, 1500, controller.signal);
    clearTimeout(timeout);

    // Audit log — same pattern as /api/generate
    auditLog({
      userId: user.id,
      companyId: user.company_id ?? undefined,
      action: "document.generate",
      resourceType: "case_analysis",
      metadata: {
        template: templateSlug || null,
        briefLength: brief.length,
        hasFormsText: formsText.length > 0,
      },
      ip,
      userAgent: ua,
    });

    return NextResponse.json<ApiResponse<{ case_summary: string }>>({
      success: true,
      data: { case_summary: summary },
    });
  } catch (err) {
    clearTimeout(timeout);
    console.error("[case-builder]", err instanceof Error ? err.message : err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error al analizar el caso. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handler, "generate");
