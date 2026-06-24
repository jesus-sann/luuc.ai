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

// Files are parsed client-side via /api/parse-file first.
// This route only receives extracted text (JSON), never binary — avoids 413.
async function handler(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "No autenticado" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Cuerpo de solicitud inválido" },
      { status: 400 }
    );
  }

  const brief = (typeof body.brief === "string" ? body.brief : "").trim().slice(0, 3000);
  const formsText = (typeof body.formsText === "string" ? body.formsText : "").trim().slice(0, 40000);
  const templateSlug = (typeof body.template === "string" ? body.template : "").trim();

  if (!brief && !formsText) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Se requiere al menos un formulario o un brief del caso" },
      { status: 400 }
    );
  }

  const templateDef = templateSlug ? getTemplateBySlug(templateSlug) : undefined;
  const documentType = templateDef?.name || "documento legal";

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const summary = await generateTextSimple(systemPrompt, userPrompt, 1500, controller.signal);
    clearTimeout(timeout);
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
