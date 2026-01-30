export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDocumentById, saveDocument, supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { withRateLimit } from "@/lib/api-middleware";
import { auditLog } from "@/lib/audit-log";

/**
 * GET /api/documents/[id]
 * Obtener un documento específico por ID
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

    const document = await getDocumentById(params.id);

    if (!document) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el documento pertenece al usuario o su empresa
    if (document.user_id !== user.id && document.company_id !== user.company_id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes permiso para ver este documento" },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Error en GET /api/documents/[id]:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents/[id]/duplicate
 * Duplicar un documento existente
 */
async function postHandler(
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

    const document = await getDocumentById(params.id);

    if (!document) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el documento pertenece al usuario
    if (document.user_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes permiso para duplicar este documento" },
        { status: 403 }
      );
    }

    // Crear duplicado
    const duplicatedDocument = await saveDocument({
      user_id: user.id,
      company_id: document.company_id || undefined,
      title: `${document.title} (Copia)`,
      doc_type: document.doc_type,
      content: document.content,
      variables: document.variables as Record<string, string>,
      is_custom: document.is_custom || false,
    });

    // Audit log
    auditLog({
      userId: user.id,
      companyId: document.company_id || undefined,
      action: "document.duplicate",
      resourceType: "document",
      resourceId: duplicatedDocument?.id,
      metadata: {
        originalDocumentId: params.id,
        docType: document.doc_type,
      },
    });

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: duplicatedDocument,
    });
  } catch (error) {
    console.error("Error en POST /api/documents/[id]/duplicate:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error al duplicar documento" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Eliminar un documento específico
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

    const document = await getDocumentById(params.id);

    if (!document) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el documento pertenece al usuario
    if (document.user_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes permiso para eliminar este documento" },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting document:", error);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al eliminar documento" },
        { status: 500 }
      );
    }

    // Audit log
    auditLog({
      userId: user.id,
      companyId: document.company_id || undefined,
      action: "document.delete",
      resourceType: "document",
      resourceId: params.id,
      metadata: {
        title: document.title,
        docType: document.doc_type,
      },
    });

    return NextResponse.json<ApiResponse<{ deleted: boolean }>>({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error("Error en DELETE /api/documents/[id]:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(getHandler, "read");
export const POST = withRateLimit(postHandler, "crud");
export const DELETE = withRateLimit(deleteHandler, "crud");
