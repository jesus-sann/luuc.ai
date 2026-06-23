export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const maxDuration = 90;

import { NextRequest, NextResponse } from "next/server";
import { streamDocumentWithContext, generateDocumentTitle } from "@/lib/claude";
import { saveDocument, logUsage } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import {
  getApprovedDocumentsForContext,
  getCompanyInstructions,
  getCompanyByUser,
} from "@/lib/company";
import { getRelevantKnowledgeContext } from "@/lib/knowledge-base";
import { ApiResponse } from "@/types";
import { validateGenerateRequest, validateFocusContext } from "@/lib/validators";
import { getTemplateBySlug } from "@/lib/templates";
import { USAGE_ACTION_TYPES } from "@/lib/constants";
import { withRateLimit } from "@/lib/api-middleware";
import { auditLog } from "@/lib/audit-log";

const encoder = new TextEncoder();

function sse(data: object): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

async function handler(request: NextRequest): Promise<Response> {
  // Auth
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "No autenticado" },
      { status: 401 }
    );
  }

  // Plan limits
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

  // Validate & sanitize inputs
  const validation = validateGenerateRequest(body);
  if (!validation.valid) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: validation.error || "Datos de entrada inválidos" },
      { status: 400 }
    );
  }

  const { template, variables, title, companyId } = validation.sanitized!;
  const language = body.language;

  const rawInstructions =
    typeof body.userInstructions === "string" ? body.userInstructions.slice(0, 2000) : undefined;
  if (rawInstructions) {
    const instrCheck = validateFocusContext(rawInstructions);
    if (!instrCheck.valid) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Instrucciones contienen patrones no permitidos" },
        { status: 400 }
      );
    }
  }
  const userInstructions = rawInstructions;

  const rawSummary =
    typeof body.caseSummary === "string" ? body.caseSummary.slice(0, 20000) : undefined;
  if (rawSummary && rawSummary.includes("\0")) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Contenido inválido" },
      { status: 400 }
    );
  }
  const caseSummary = rawSummary;

  // Resolve company context
  let effectiveCompanyId: string | undefined = companyId;
  if (!effectiveCompanyId && user) {
    const company = await getCompanyByUser(user.id);
    effectiveCompanyId = company?.id || user.company_id || undefined;
  }

  let companyContext = "";
  let companyInstructions = "";
  let knowledgeContext = "";

  if (effectiveCompanyId) {
    const [docs, instructions, kbContext] = await Promise.all([
      getApprovedDocumentsForContext(effectiveCompanyId, template),
      getCompanyInstructions(effectiveCompanyId),
      getRelevantKnowledgeContext(effectiveCompanyId, template),
    ]);
    companyContext = docs;
    companyInstructions = instructions;
    knowledgeContext = kbContext;
  }

  let fullContext = "";
  if (companyContext) {
    fullContext += `DOCUMENTOS APROBADOS POR LA FIRMA:\n═════════════════════════════════════════════\n${companyContext}\n\n`;
  }
  if (knowledgeContext) {
    fullContext += `BASE DE CONOCIMIENTO EMPRESARIAL:\n═════════════════════════════════════════════\n${knowledgeContext}\n\n`;
  }
  if (fullContext) {
    fullContext += `INSTRUCCIONES IMPORTANTES:\n- Usa TODOS los documentos anteriores como referencia de estilo, estructura y terminologia\n- Manten coherencia con los estandares de la firma\n- Si encuentras clausulas o parrafos relevantes en los ejemplos, adaptalos\n- Respeta el tono formal y el lenguaje tecnico usado\n- Asegurate de que el documento generado sea coherente con los documentos de referencia\n`;
  }

  // Build a descriptive title from variables so it shows client name + case type
  const clientName =
    variables.applicant_name ||
    variables.petitioner_name ||
    variables.beneficiary_name ||
    variables.self_petitioner_name ||
    variables.nombre_cliente ||
    "";
  const caseType = variables.form_type || variables.visa_type || "";
  const templateDef = getTemplateBySlug(template);
  const templateLabel = templateDef?.name || template;
  const dateStr = new Date().toLocaleDateString("es-CO");

  const smartFallback = clientName && caseType
    ? `${clientName} — ${caseType}`
    : clientName
    ? `${clientName} — ${templateLabel}`
    : title || `${templateLabel} — ${dateStr}`;

  const templateSystemPrompt = templateDef?.system_prompt;
  const usedCompanyContext = !!(companyContext || knowledgeContext);

  // Capture these for use inside the stream closure
  const userId = user.id;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined;
  const ua = request.headers.get("user-agent") || undefined;

  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = "";

      try {
        // Stream document tokens to client as they arrive
        for await (const chunk of streamDocumentWithContext(
          template,
          variables,
          fullContext,
          companyInstructions,
          language,
          userInstructions,
          caseSummary,
          templateSystemPrompt
        )) {
          fullContent += chunk;
          controller.enqueue(sse({ type: "delta", text: chunk }));
        }

        // Post-stream: extract title, save to DB
        const aiTitle = generateDocumentTitle(fullContent, smartFallback);

        let docId: string | undefined;
        try {
          const saved = await saveDocument({
            user_id: userId,
            company_id: effectiveCompanyId,
            title: aiTitle,
            doc_type: template,
            content: fullContent,
            variables,
            is_custom: false,
          });
          docId = saved?.id;

          await logUsage({
            user_id: userId,
            action_type: USAGE_ACTION_TYPES.GENERATE,
            metadata: {
              template,
              title,
              companyId: effectiveCompanyId,
              usedCompanyContext,
            },
          });

          auditLog({
            userId,
            companyId: effectiveCompanyId,
            action: "document.generate",
            resourceType: "document",
            resourceId: docId,
            metadata: { template, usedContext: usedCompanyContext },
            ip,
            userAgent: ua,
          });
        } catch (dbErr) {
          console.error("Error saving to database:", dbErr);
        }

        controller.enqueue(
          sse({ type: "done", id: docId, title: aiTitle, usedCompanyContext })
        );
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Error generating document (stream):", msg, err);
        controller.enqueue(
          sse({ type: "error", message: "Error generando documento. Intenta de nuevo." })
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export const POST = withRateLimit(handler, "generate");
