export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDocumentById, saveDocument } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { ApiResponse, Document } from "@/types";

/**
 * POST /api/documents/[id]/duplicate
 * Duplicar un documento existente
 */
export async function POST(
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

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: duplicatedDocument,
    });
  } catch (error) {
    console.error("Error duplicating document:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error al duplicar documento" },
      { status: 500 }
    );
  }
}
