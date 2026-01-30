export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCompanyByUser } from "@/lib/company";
import {
  getKnowledgeBaseDocuments,
  uploadToKnowledgeBase,
  uploadTextToKnowledgeBase,
  searchKnowledgeBase,
} from "@/lib/knowledge-base";
import { ApiResponse, KnowledgeBaseDocument } from "@/types";
import { withRateLimit } from "@/lib/api-middleware";
import { auditLog } from "@/lib/audit-log";

/**
 * GET /api/knowledge-base
 * Obtener documentos de la knowledge base
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

    const company = await getCompanyByUser(user.id);
    const companyId = company?.id || user.company_id;

    if (!companyId) {
      return NextResponse.json<ApiResponse<KnowledgeBaseDocument[]>>({
        success: true,
        data: [],
      });
    }

    const category = request.nextUrl.searchParams.get("category");
    const search = request.nextUrl.searchParams.get("search");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");

    let documents: KnowledgeBaseDocument[];

    if (search && search.length > 2) {
      documents = await searchKnowledgeBase(
        companyId,
        search,
        category || undefined
      );
    } else {
      documents = await getKnowledgeBaseDocuments(
        companyId,
        category || undefined,
        limit
      );
    }

    return NextResponse.json<ApiResponse<KnowledgeBaseDocument[]>>({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Error in GET /api/knowledge-base:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge-base
 * Subir documento a la knowledge base
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

    const company = await getCompanyByUser(user.id);
    const companyId = company?.id || user.company_id;

    if (!companyId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes una empresa registrada" },
        { status: 400 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    // Manejar FormData (archivo)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const title = formData.get("title") as string;
      const category = formData.get("category") as string;
      const tagsStr = formData.get("tags") as string;
      const metadataStr = formData.get("metadata") as string;

      const tags = tagsStr ? JSON.parse(tagsStr) : [];
      const metadata = metadataStr ? JSON.parse(metadataStr) : {};

      if (!file || !title || !category) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Archivo, titulo y categoria son requeridos" },
          { status: 400 }
        );
      }

      // Validar tipo de archivo
      const allowedTypes = ["pdf", "docx", "txt", "md"];
      const fileType = file.name.split(".").pop()?.toLowerCase() || "other";

      if (!allowedTypes.includes(fileType)) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: `Tipo de archivo no soportado. Permitidos: ${allowedTypes.join(", ")}`,
          },
          { status: 400 }
        );
      }

      // Validar tamano (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "El archivo no puede superar 10MB" },
          { status: 400 }
        );
      }

      // Convertir archivo a buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const document = await uploadToKnowledgeBase(
        companyId,
        user.id,
        title,
        category,
        buffer,
        file.name,
        fileType,
        tags,
        metadata
      );

      if (!document) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Error al procesar el documento" },
          { status: 500 }
        );
      }

      // Audit log
      auditLog({
        userId: user.id,
        companyId: companyId,
        action: "kb.upload",
        resourceType: "knowledge_base",
        resourceId: document.id,
        metadata: {
          title: title,
          category: category,
          fileType: fileType,
        },
      });

      return NextResponse.json<ApiResponse<KnowledgeBaseDocument>>(
        { success: true, data: document },
        { status: 201 }
      );
    }

    // Manejar JSON (contenido directo)
    const body = await request.json();
    const { title, category, content, tags, metadata } = body;

    if (!title || !category || !content) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Titulo, categoria y contenido son requeridos" },
        { status: 400 }
      );
    }

    if (content.length < 50) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "El contenido es muy corto (minimo 50 caracteres)" },
        { status: 400 }
      );
    }

    const document = await uploadTextToKnowledgeBase(
      companyId,
      user.id,
      title,
      category,
      content,
      tags || [],
      metadata || {}
    );

    if (!document) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al guardar el documento" },
        { status: 500 }
      );
    }

    // Audit log
    auditLog({
      userId: user.id,
      companyId: companyId,
      action: "kb.upload",
      resourceType: "knowledge_base",
      resourceId: document.id,
      metadata: {
        title: title,
        category: category,
        contentLength: content.length,
      },
    });

    return NextResponse.json<ApiResponse<KnowledgeBaseDocument>>(
      { success: true, data: document },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/knowledge-base:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(getHandler, "read");
export const POST = withRateLimit(postHandler, "crud");
