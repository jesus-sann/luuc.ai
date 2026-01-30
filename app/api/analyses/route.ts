export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { ApiResponse, Analysis } from "@/types";
import { withRateLimit } from "@/lib/api-middleware";

/**
 * GET /api/analyses
 * Obtener análisis del usuario actual
 */
async function handler(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

    const { data, error } = await supabaseAdmin
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching analyses:", error);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al obtener análisis" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Analysis[]>>({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error en GET /api/analyses:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(handler, "read");
