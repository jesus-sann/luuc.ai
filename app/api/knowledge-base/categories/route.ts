export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCompanyByUser } from "@/lib/company";
import { getCompanyCategories, createCategory } from "@/lib/knowledge-base";
import { ApiResponse, KnowledgeBaseCategory } from "@/types";

/**
 * GET /api/knowledge-base/categories
 * Obtener categorias de la empresa
 */
export async function GET() {
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
      return NextResponse.json<ApiResponse<KnowledgeBaseCategory[]>>({
        success: true,
        data: [],
      });
    }

    const categories = await getCompanyCategories(companyId);

    return NextResponse.json<ApiResponse<KnowledgeBaseCategory[]>>({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error in GET /api/knowledge-base/categories:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge-base/categories
 * Crear nueva categoria
 */
export async function POST(request: NextRequest) {
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
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes una empresa registrada" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, icon, color } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Nombre de categoria es requerido (minimo 2 caracteres)" },
        { status: 400 }
      );
    }

    const category = await createCategory(
      companyId,
      name.trim(),
      description,
      icon || "folder",
      color || "#3B82F6"
    );

    if (!category) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al crear categoria. Puede que ya exista." },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<KnowledgeBaseCategory>>(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/knowledge-base/categories:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
