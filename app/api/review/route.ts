import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/claude";
import { saveAnalysis, logUsage } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { ApiResponse, AnalysisResponse } from "@/types";
import {
  validateAnalysisContent,
  validateFilename,
  validateFocusContext,
  validateFileSize,
} from "@/lib/validators";

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

    // SEGURIDAD: Validar y sanitizar contenido
    const contentValidation = validateAnalysisContent(content);
    if (!contentValidation.valid) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: contentValidation.error || "Invalid content" },
        { status: 400 }
      );
    }
    const sanitizedContent = contentValidation.sanitized!;

    // SEGURIDAD: Validar filename
    const filenameValidation = validateFilename(filename);
    if (!filenameValidation.valid) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: filenameValidation.error || "Invalid filename" },
        { status: 400 }
      );
    }
    const sanitizedFilename = filenameValidation.sanitized!;

    // SEGURIDAD: Validar focus context (protección contra prompt injection)
    const focusValidation = validateFocusContext(focusContext);
    if (!focusValidation.valid) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: focusValidation.error || "Invalid focus context" },
        { status: 400 }
      );
    }
    const sanitizedFocus = focusValidation.sanitized;

    // SEGURIDAD: Validar file size si se proporciona
    if (fileSize !== undefined) {
      const sizeValidation = validateFileSize(fileSize);
      if (!sizeValidation.valid) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: sizeValidation.error || "Invalid file size" },
          { status: 400 }
        );
      }
    }

    // Analyze document using Claude with optional focus context
    // USAR CONTENIDO SANITIZADO para prevenir inyecciones
    const analysisText = await analyzeDocument(sanitizedContent, sanitizedFocus);

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
        company_id: user.company_id || undefined, // SEGURIDAD: Asociar con company para multi-tenant
        filename: sanitizedFilename, // USAR FILENAME SANITIZADO
        file_size: fileSize,
        focus_context: sanitizedFocus, // USAR FOCUS SANITIZADO
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
        metadata: {
          filename: sanitizedFilename,
          focusContext: sanitizedFocus,
          riskScore: analysis.score,
          contentLength: sanitizedContent.length, // Para auditoría
        },
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
