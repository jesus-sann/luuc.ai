export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getKnowledgeDocumentById,
  updateKnowledgeDocument,
  deleteKnowledgeDocument,
} from "@/lib/knowledge-base";
import { ApiResponse, KnowledgeBaseDocument } from "@/types";
import { withRateLimit } from "@/lib/api-middleware";
import { auditLog } from "@/lib/audit-log";

/**
 * GET /api/knowledge-base/[id]
 * Obtener documento por ID
 */
async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const document = await getKnowledgeDocumentById(id);

    if (!document) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<KnowledgeBaseDocument>>({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Error in GET /api/knowledge-base/[id]:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/knowledge-base/[id]
 * Actualizar documento
 */
async function putHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Solo permitir actualizar ciertos campos
    const allowedUpdates: Partial<KnowledgeBaseDocument> = {};
    if (body.title) allowedUpdates.title = body.title;
    if (body.category) allowedUpdates.category = body.category;
    if (body.tags) allowedUpdates.tags = body.tags;
    if (body.metadata) allowedUpdates.metadata = body.metadata;

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No hay campos validos para actualizar" },
        { status: 400 }
      );
    }

    const document = await updateKnowledgeDocument(id, allowedUpdates);

    if (!document) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al actualizar documento" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<KnowledgeBaseDocument>>({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Error in PUT /api/knowledge-base/[id]:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge-base/[id]
 * Eliminar documento
 */
async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get document before deleting for audit log
    const document = await getKnowledgeDocumentById(id);

    const success = await deleteKnowledgeDocument(id);

    if (!success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al eliminar documento" },
        { status: 500 }
      );
    }

    // Audit log
    if (document) {
      auditLog({
        userId: user.id,
        companyId: document.company_id,
        action: "kb.delete",
        resourceType: "knowledge_base",
        resourceId: id,
        metadata: {
          title: document.title,
          category: document.category,
        },
      });
    }

    return NextResponse.json<ApiResponse<{ deleted: boolean }>>({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error("Error in DELETE /api/knowledge-base/[id]:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(getHandler, "read");
export const PUT = withRateLimit(putHandler, "crud");
export const DELETE = withRateLimit(deleteHandler, "crud");
