export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  getCompanyDocuments,
  uploadCompanyDocument,
  deleteCompanyDocument,
  getCompanyByUser,
} from "@/lib/company";
import { getCurrentUser } from "@/lib/auth";
import { ApiResponse, CompanyDocument } from "@/types";
import { withRateLimit } from "@/lib/api-middleware";

/**
 * GET /api/company/documents
 * Obtener documentos de referencia de la empresa
 */
async function getHandler(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener empresa del usuario
    const company = await getCompanyByUser(user.id);

    // También verificar si el usuario pertenece a una empresa
    const companyId = company?.id || user.company_id;

    if (!companyId) {
      return NextResponse.json<ApiResponse<CompanyDocument[]>>({
        success: true,
        data: [],
      });
    }

    const docType = request.nextUrl.searchParams.get("docType");
    const category = request.nextUrl.searchParams.get("category");

    const documents = await getCompanyDocuments(
      companyId,
      docType || undefined,
      category || undefined
    );

    return NextResponse.json<ApiResponse<CompanyDocument[]>>({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Error en GET /api/company/documents:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/company/documents
 * Subir nuevo documento de referencia
 */
async function postHandler(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener empresa del usuario
    const company = await getCompanyByUser(user.id);
    const companyId = company?.id || user.company_id;

    if (!companyId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes una empresa registrada" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, docType, category } = body;

    if (!title || !content) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Título y contenido son requeridos" },
        { status: 400 }
      );
    }

    // Validar que el contenido no sea muy corto
    if (content.length < 100) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "El documento es muy corto (mínimo 100 caracteres)" },
        { status: 400 }
      );
    }

    const document = await uploadCompanyDocument(
      companyId,
      user.id,
      title,
      content,
      docType,
      category || "aprobado"
    );

    if (!document) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al subir documento" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<CompanyDocument>>(
      { success: true, data: document },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/company/documents:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/company/documents?docId=xxx
 * Eliminar documento de referencia
 */
async function deleteHandler(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const docId = request.nextUrl.searchParams.get("docId");

    if (!docId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "docId es requerido" },
        { status: 400 }
      );
    }

    const success = await deleteCompanyDocument(docId);

    if (!success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al eliminar documento" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<{ deleted: boolean }>>({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error("Error en DELETE /api/company/documents:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(getHandler, "read");
export const POST = withRateLimit(postHandler, "crud");
export const DELETE = withRateLimit(deleteHandler, "crud");
