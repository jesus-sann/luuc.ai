export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const maxDuration = 60; // AI generation can take 30-45s; default 10s causes silent 504s
import { NextRequest, NextResponse } from "next/server";
import { generateDocumentWithContext, generateDocumentTitle } from "@/lib/claude";
import { saveDocument, logUsage } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import {
  getApprovedDocumentsForContext,
  getCompanyInstructions,
  getCompanyByUser,
} from "@/lib/company";
import { getRelevantKnowledgeContext } from "@/lib/knowledge-base";
import { ApiResponse } from "@/types";
import { validateGenerateRequest } from "@/lib/validators";
import { USAGE_ACTION_TYPES } from "@/lib/constants";
import { withRateLimit } from "@/lib/api-middleware";
import { auditLog } from "@/lib/audit-log";

async function handler(request: NextRequest) {
  try {
    // Obtener usuario actual - REQUERIDO
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Verificar límites del plan
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

    // SEGURIDAD: Validar y sanitizar inputs
    const validation = validateGenerateRequest(body);
    if (!validation.valid) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: validation.error || "Datos de entrada inválidos",
        },
        { status: 400 }
      );
    }

    const { template, variables, title, companyId } = validation.sanitized!;
    const provider = body.provider; // optional AI provider override
    const language = body.language; // optional output language
    const userInstructions = typeof body.userInstructions === "string"
      ? body.userInstructions.slice(0, 2000) // Limit to 2000 chars for safety
      : undefined;
    const caseSummary = typeof body.caseSummary === "string"
      ? body.caseSummary.slice(0, 20000) // Limit to ~20k chars
      : undefined;

    // Determinar companyId (del request o del usuario)
    let effectiveCompanyId: string | undefined = companyId;
    if (!effectiveCompanyId && user) {
      const company = await getCompanyByUser(user.id);
      effectiveCompanyId = company?.id || user.company_id || undefined;
    }

    // Obtener contexto de documentos de referencia de la empresa
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

    // Combinar contexto de company_documents y knowledge_base
    let fullContext = "";
    if (companyContext) {
      fullContext += `DOCUMENTOS APROBADOS POR LA FIRMA:
═════════════════════════════════════════════
${companyContext}

`;
    }
    if (knowledgeContext) {
      fullContext += `BASE DE CONOCIMIENTO EMPRESARIAL:
═════════════════════════════════════════════
${knowledgeContext}

`;
    }
    if (fullContext) {
      fullContext += `INSTRUCCIONES IMPORTANTES:
- Usa TODOS los documentos anteriores como referencia de estilo, estructura y terminologia
- Manten coherencia con los estandares de la firma
- Si encuentras clausulas o parrafos relevantes en los ejemplos, adaptalos
- Respeta el tono formal y el lenguaje tecnico usado
- Asegurate de que el documento generado sea coherente con los documentos de referencia
`;
    }

    // Generate document using Claude con contexto de empresa + knowledge base
    const content = await generateDocumentWithContext(
      template,
      variables,
      fullContext,
      companyInstructions,
      provider,
      language,
      userInstructions,
      caseSummary
    );

    // Generate AI title from content
    const fallbackTitle = title || `${template} - ${new Date().toLocaleDateString("es-CO")}`;
    const aiTitle = await generateDocumentTitle(content, fallbackTitle, provider);

    // Guardar en Supabase
    let savedDocument = null;
    try {
      savedDocument = await saveDocument({
        user_id: user.id,
        company_id: effectiveCompanyId,
        title: aiTitle,
        doc_type: template,
        content,
        variables,
        is_custom: false,
      });

      // Registrar uso
      await logUsage({
        user_id: user.id,
        action_type: USAGE_ACTION_TYPES.GENERATE,
        metadata: {
          template,
          title,
          companyId: effectiveCompanyId,
          usedCompanyContext: !!companyContext,
          usedKnowledgeBase: !!knowledgeContext,
        },
      });

      // Audit log
      auditLog({
        userId: user.id,
        companyId: effectiveCompanyId,
        action: "document.generate",
        resourceType: "document",
        resourceId: savedDocument?.id,
        metadata: {
          template,
          usedContext: !!companyContext || !!knowledgeContext,
        },
      });
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      // Continuamos aunque falle el guardado
    }

    return NextResponse.json<
      ApiResponse<{
        content: string;
        title: string;
        id?: string;
        usedCompanyContext: boolean;
      }>
    >({
      success: true,
      data: {
        content,
        title: aiTitle,
        id: savedDocument?.id,
        usedCompanyContext: !!companyContext || !!knowledgeContext,
      },
    });
  } catch (error) {
    // SECURITY: Do not expose internal error messages to clients — they can contain
    // AI model response fragments, prompt text, or SDK-level details.
    console.error("Error generating document:", error instanceof Error ? error.message : error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Error generando documento. Intenta de nuevo.",
      },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handler, "generate");
