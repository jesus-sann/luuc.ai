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

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;

const ALLOWED_EXTS: Record<string, string[]> = {
  ".pdf": ["application/pdf"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
  ],
  ".doc": ["application/msword", "application/octet-stream"],
  ".txt": ["text/plain", "application/octet-stream"],
};

async function parseFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt")) return await file.text();
  if (name.endsWith(".pdf")) {
    const buf = Buffer.from(await file.arrayBuffer());
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buf);
    return parsed.text;
  }
  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    const buf = Buffer.from(await file.arrayBuffer());
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: buf });
    return result.value;
  }
  throw new Error("Formato no soportado");
}

async function handler(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "No autenticado" },
      { status: 401 }
    );
  }

  const fd = await request.formData();
  const brief = ((fd.get("brief") as string) || "").trim().slice(0, 3000);
  const templateSlug = ((fd.get("template") as string) || "").trim();
  const rawFiles = fd.getAll("files") as File[];

  if (!brief && rawFiles.length === 0) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Se requiere al menos un archivo o un brief del caso" },
      { status: 400 }
    );
  }

  // Parse each uploaded file, skip bad ones silently
  const parsedTexts: string[] = [];
  for (const file of rawFiles.slice(0, MAX_FILES)) {
    if (file.size > MAX_FILE_SIZE) continue;
    const fname = file.name.toLowerCase();
    const ext = Object.keys(ALLOWED_EXTS).find((e) => fname.endsWith(e));
    if (!ext) continue;
    try {
      const text = (await parseFile(file)).trim();
      if (text.length >= 30) {
        parsedTexts.push(`--- ${file.name} ---\n${text.slice(0, 8000)}`);
      }
    } catch {
      // unparseable — skip
    }
  }

  const templateDef = templateSlug ? getTemplateBySlug(templateSlug) : undefined;
  const documentType = templateDef?.name || "documento legal";

  const systemPrompt = `You are an expert immigration attorney and legal case analyst.

Read the uploaded forms and/or case brief and produce a structured case summary that will be used to generate a ${documentType}.

Output EXACTLY these labeled sections (use the same language as the input documents):

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

  let userPrompt = `Produce the case summary for: ${documentType}\n\n`;

  if (parsedTexts.length > 0) {
    userPrompt += `UPLOADED FORMS/DOCUMENTS:\n${"═".repeat(60)}\n${parsedTexts.join("\n\n")}\n${"═".repeat(60)}\n\n`;
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
