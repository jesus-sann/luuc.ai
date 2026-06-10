export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
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
import { validateTags, validateMetadata } from "@/lib/validators";

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  pdf:  ["application/pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream"],
  txt:  ["text/plain", "application/octet-stream"],
  md:   ["text/markdown", "text/plain", "application/octet-stream"],
};

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
    const rawSearch = request.nextUrl.searchParams.get("search");
    // SECURITY: Clamp pagination limit and search-query length
    const rawLimit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    const limit = Number.isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), 100);

    // Trim the search query and enforce a sensible max length
    const search = rawSearch ? rawSearch.trim().substring(0, 200) : null;

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

      // Safe JSON parsing with validation (M-6)
      let tags: string[] = [];
      let metadata: Record<string, unknown> = {};
      try {
        const parsedTags = tagsStr ? JSON.parse(tagsStr) : [];
        const tagsResult = validateTags(parsedTags);
        if (!tagsResult.valid) {
          return NextResponse.json<ApiResponse<null>>(
            { success: false, error: tagsResult.error || "Tags inválidos" },
            { status: 400 }
          );
        }
        tags = tagsResult.sanitized ?? [];
      } catch {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Tags con formato inválido" },
          { status: 400 }
        );
      }
      try {
        const parsedMeta = metadataStr ? JSON.parse(metadataStr) : {};
        const metaResult = validateMetadata(parsedMeta);
        if (!metaResult.valid) {
          return NextResponse.json<ApiResponse<null>>(
            { success: false, error: metaResult.error || "Metadata inválida" },
            { status: 400 }
          );
        }
        metadata = metaResult.sanitized ?? {};
      } catch {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Metadata con formato inválido" },
          { status: 400 }
        );
      }

      if (!file || !title || !category) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "Archivo, titulo y categoria son requeridos" },
          { status: 400 }
        );
      }

      // Validar extensión y MIME type (M-3)
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
      const fileMime = file.type || "application/octet-stream";
      const allowedMimes = ALLOWED_MIME_TYPES[fileType];
      if (!allowedMimes?.includes(fileMime)) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: "El tipo MIME del archivo no corresponde a su extensión" },
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
