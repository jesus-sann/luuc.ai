import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/claude";
import { saveAnalysis, logUsage } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { ApiResponse, AnalysisResponse } from "@/types";

interface ReviewRequestBody {
  content: string;
  filename: string;
  focusContext?: string;
  fileSize?: number;
}

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
    const FREE_LIMIT = parseInt(process.env.FREE_TIER_ANALYSIS_LIMIT || "5");
    if (user.plan === "free") {
      // Obtener conteo actual de análisis del usuario
      // Por ahora usamos usage_count general, pero idealmente sería usage_analyses
    }

    const body: ReviewRequestBody = await request.json();
    const { content, filename, focusContext, fileSize } = body;

    if (!content) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Contenido del documento es requerido",
        },
        { status: 400 }
      );
    }

    if (content.length < 100) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "El documento es muy corto para analizar",
        },
        { status: 400 }
      );
    }

    // Analyze document using Claude with optional focus context
    const analysisText = await analyzeDocument(content, focusContext);

    // Parse JSON response from Claude
    let analysis: AnalysisResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing analysis:", parseError);
      // Return a default structure if parsing fails
      analysis = {
        resumen: "No se pudo procesar el análisis correctamente.",
        score: 5,
        riesgos: [],
        clausulas_faltantes: [],
        observaciones_generales: analysisText.substring(0, 500),
      };
    }

    // Guardar en Supabase
    let savedAnalysis = null;
    try {
      savedAnalysis = await saveAnalysis({
        user_id: user.id,
        filename,
        file_size: fileSize,
        focus_context: focusContext,
        risk_score: analysis.score,
        summary: analysis.resumen,
        findings: analysis.riesgos,
        missing_clauses: analysis.clausulas_faltantes,
        observations: analysis.observaciones_generales,
      });

      // Registrar uso
      await logUsage({
        user_id: user.id,
        action_type: "analyze",
        metadata: { filename, focusContext, riskScore: analysis.score },
      });
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      // Continuamos aunque falle el guardado
    }

    return NextResponse.json<ApiResponse<AnalysisResponse & { id?: string }>>({
      success: true,
      data: {
        ...analysis,
        id: savedAnalysis?.id,
      },
    });
  } catch (error) {
    console.error("Error analyzing document:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Error analizando documento. Intenta de nuevo.",
      },
      { status: 500 }
    );
  }
}
