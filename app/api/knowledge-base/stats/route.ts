export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCompanyByUser } from "@/lib/company";
import { getKnowledgeBaseStats } from "@/lib/knowledge-base";
import { ApiResponse, KnowledgeBaseStats } from "@/types";
import { withRateLimit } from "@/lib/api-middleware";

/**
 * GET /api/knowledge-base/stats
 * Obtener estadisticas de la knowledge base
 */
async function handler() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const company = await getCompanyByUser(user.id);
    const companyId = company?.id || user.company_id;

    if (!companyId) {
      return NextResponse.json<ApiResponse<KnowledgeBaseStats>>({
        success: true,
        data: {
          totalDocuments: 0,
          totalSize: 0,
          categoriesCount: 0,
          lastUploadedAt: null,
          mostUsedCategory: "",
          recentUploads: [],
        },
      });
    }

    const stats = await getKnowledgeBaseStats(companyId);

    return NextResponse.json<ApiResponse<KnowledgeBaseStats>>({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in GET /api/knowledge-base/stats:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(handler, "read");
