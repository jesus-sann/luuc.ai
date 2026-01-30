export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { generateDocumentWithContext } from "@/lib/claude";
import { saveDocument, logUsage } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import {
  getApprovedDocumentsForContext,
  getCompanyInstructions,
  getCompanyByUser,
} from "@/lib/company";
import { getRelevantKnowledgeContext } from "@/lib/knowledge-base";
import { GenerateWithCompanyRequest, ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
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

    const body: GenerateWithCompanyRequest = await request.json();
    const { template, variables, title, companyId } = body;

    if (!template || !variables) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Template y variables son requeridos",
        },
        { status: 400 }
      );
    }

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
      companyInstructions
    );

    // Guardar en Supabase
    let savedDocument = null;
    try {
      savedDocument = await saveDocument({
        user_id: user.id,
        company_id: effectiveCompanyId,
        title: title || `${template} - ${new Date().toLocaleDateString("es-CO")}`,
        doc_type: template,
        content,
        variables,
        is_custom: false,
      });

      // Registrar uso
      await logUsage({
        user_id: user.id,
        action_type: "generate",
        metadata: {
          template,
          title,
          companyId: effectiveCompanyId,
          usedCompanyContext: !!companyContext,
          usedKnowledgeBase: !!knowledgeContext,
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
        title: title || template,
        id: savedDocument?.id,
        usedCompanyContext: !!companyContext || !!knowledgeContext,
      },
    });
  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Error generando documento. Intenta de nuevo.",
      },
      { status: 500 }
    );
  }
}
