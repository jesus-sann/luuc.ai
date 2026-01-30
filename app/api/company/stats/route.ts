export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCompanyStats, getCompanyByUser, getCompanyById } from "@/lib/company";
import { getCurrentUser } from "@/lib/auth";
import { ApiResponse } from "@/types";

/**
 * GET /api/company/stats
 * Obtener estadísticas de la empresa del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener empresa del usuario
    let company = await getCompanyByUser(user.id);

    // Si no es owner, buscar por company_id del usuario
    if (!company && user.company_id) {
      company = await getCompanyById(user.company_id);
    }

    if (!company) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes una empresa registrada" },
        { status: 404 }
      );
    }

    const stats = await getCompanyStats(company.id);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error en GET /api/company/stats:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
