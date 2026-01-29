import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getKnowledgeDocumentById,
  updateKnowledgeDocument,
  deleteKnowledgeDocument,
} from "@/lib/knowledge-base";
import { ApiResponse, KnowledgeBaseDocument } from "@/types";

/**
 * GET /api/knowledge-base/[id]
 * Obtener documento por ID
 */
export async function GET(
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
export async function PUT(
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
export async function DELETE(
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
    const success = await deleteKnowledgeDocument(id);

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
    console.error("Error in DELETE /api/knowledge-base/[id]:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
