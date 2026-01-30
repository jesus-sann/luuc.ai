export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDocuments, getDocumentById, supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { ApiResponse, Document } from "@/types";
import { withRateLimit } from "@/lib/api-middleware";

/**
 * GET /api/documents
 * Obtener documentos del usuario actual
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

    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");
    const docType = request.nextUrl.searchParams.get("docType");

    let query = supabaseAdmin
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (docType) {
      query = query.eq("doc_type", docType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching documents:", error);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al obtener documentos" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Document[]>>({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error en GET /api/documents:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents?id=xxx
 * Eliminar documento del usuario
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

    const docId = request.nextUrl.searchParams.get("id");

    if (!docId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "ID del documento es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el documento pertenece al usuario
    const document = await getDocumentById(docId);

    if (!document) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    if (document.user_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes permiso para eliminar este documento" },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", docId);

    if (error) {
      console.error("Error deleting document:", error);
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
    console.error("Error en DELETE /api/documents:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(getHandler, "read");
export const DELETE = withRateLimit(deleteHandler, "crud");
