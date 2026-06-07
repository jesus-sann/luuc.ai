export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateWithClaude } from "@/lib/claude";
import { saveDocument, logUsage } from "@/lib/supabase";
import { getCompanyByUser } from "@/lib/company";
import { generateDocumentTitle } from "@/lib/claude";
import { withRateLimit } from "@/lib/api-middleware";
import { ApiResponse } from "@/types";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  "Affidavit / Sworn Statement": "Affidavit",
  "Personal Declaration": "Personal Declaration",
  "Support Letter / Carta de Apoyo": "Support Letter",
  "Birth Certificate / Acta de Nacimiento": "Birth Certificate",
  "Marriage Certificate / Acta de Matrimonio": "Marriage Certificate",
  "Divorce Decree / Decreto de Divorcio": "Divorce Decree",
  "Death Certificate / Acta de Defunción": "Death Certificate",
  "Police Records / Antecedentes Penales": "Police Records",
  "Court Document / Documento Judicial": "Court Document",
  "Power of Attorney / Poder Notarial": "Power of Attorney",
  "Medical Records / Expediente Médico": "Medical Records",
  "Other / Otro": "Document",
};

async function handler(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const FREE_LIMIT = parseInt(process.env.FREE_TIER_DOCUMENT_LIMIT || "10");
    if (user.plan === "free" && user.usage_count >= FREE_LIMIT) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `Has alcanzado el límite de ${FREE_LIMIT} documentos de tu plan gratuito. Actualiza a Pro para continuar.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      document_type,
      spanish_variant,
      subject_name,
      original_text,
      translator_name,
      translator_qualifications,
    } = body;

    if (!original_text || typeof original_text !== "string" || original_text.trim().length < 20) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Original text is required (minimum 20 characters)" },
        { status: 400 }
      );
    }
    if (!translator_name || !translator_qualifications || !subject_name || !document_type) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const docTypeLabel = DOCUMENT_TYPE_LABELS[document_type] || "Document";
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const systemPrompt = `You are a professional certified legal translator specializing in Spanish-to-English translation for US immigration proceedings. You have deep expertise in legal terminology across multiple Spanish dialects and US immigration law.

Your task is to produce a complete, USCIS-compliant translation package that consists of THREE clearly separated sections. Follow the exact structure provided. Be faithful and accurate — do not paraphrase, add, or omit anything from the original. Preserve the document's structure, paragraph breaks, numbering, and formatting.`;

    const userPrompt = `Translate the following ${document_type} from ${spanish_variant} to English for a USCIS submission. The document subject is ${subject_name}.

ORIGINAL TEXT:
"""
${original_text.trim()}
"""

Produce the following THREE sections in this EXACT order and format. Use the exact section headers shown:

---

# CERTIFICATE OF TRANSLATION

I, ${translator_name}, hereby certify that I am competent to translate from Spanish to English, and that the following is an accurate and complete translation of the ${docTypeLabel} for ${subject_name}, originally written in ${spanish_variant}.

**Translator:** ${translator_name}
**Qualifications:** ${translator_qualifications}
**Original Language:** Spanish (${spanish_variant})
**Target Language:** English (United States)
**Date of Translation:** ${today}

I declare under penalty of perjury under the laws of the United States of America that the foregoing is true and correct to the best of my knowledge and belief.

_________________________________
${translator_name}, Translator
Date: ${today}

---

# ENGLISH TRANSLATION

[Provide the complete, faithful English translation here. Preserve all paragraph breaks, numbering, names, dates, and formatting from the original. Do not add commentary or notes inside this section.]

---

# ORIGINAL DOCUMENT (Spanish — ${spanish_variant})

[Reproduce the original Spanish text exactly as provided, without any modifications.]

---

Important: Replace the bracketed placeholders above with the actual content. Do not include the brackets in the final output.`;

    const content = await generateWithClaude(systemPrompt, userPrompt);

    // Determine company for saving
    let companyId: string | undefined;
    try {
      const company = await getCompanyByUser(user.id);
      companyId = company?.id || user.company_id || undefined;
    } catch {
      // Non-critical
    }

    const fallbackTitle = `Certified Translation — ${docTypeLabel} — ${subject_name}`;
    const aiTitle = await generateDocumentTitle(content, fallbackTitle);

    let savedDocument = null;
    try {
      savedDocument = await saveDocument({
        user_id: user.id,
        company_id: companyId,
        title: aiTitle,
        doc_type: "certified-translation",
        content,
        variables: {
          document_type,
          spanish_variant,
          subject_name,
          translator_name,
          translator_qualifications,
        },
        is_custom: false,
      });

      await logUsage({
        user_id: user.id,
        action_type: "generate",
        metadata: { template: "certified-translation", document_type, spanish_variant },
      });
    } catch (dbError) {
      console.error("Error saving translation:", dbError);
    }

    return NextResponse.json({
      success: true,
      data: {
        content,
        title: aiTitle,
        id: savedDocument?.id,
        usedCompanyContext: false,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/translate:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error generating translation. Please try again." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handler, "generate");
