export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { ApiResponse, Analysis } from "@/types";
import { withRateLimit } from "@/lib/api-middleware";

/**
 * GET /api/analyses/[id]
 * Obtener un análisis específico por ID
 */
async function getHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const { data: analysis, error } = await supabaseAdmin
      .from("analyses")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !analysis) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Análisis no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el análisis pertenece al usuario o su empresa
    if (analysis.user_id !== user.id && analysis.company_id !== user.company_id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes permiso para ver este análisis" },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse<Analysis>>({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Error en GET /api/analyses/[id]:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/analyses/[id]
 * Eliminar un análisis específico
 */
async function deleteHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const { data: analysis, error: fetchError } = await supabaseAdmin
      .from("analyses")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Análisis no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el análisis pertenece al usuario
    if (analysis.user_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes permiso para eliminar este análisis" },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("analyses")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Error deleting analysis:", deleteError);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al eliminar análisis" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<{ deleted: boolean }>>({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error("Error en DELETE /api/analyses/[id]:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(getHandler, "read");
export const DELETE = withRateLimit(deleteHandler, "crud");
