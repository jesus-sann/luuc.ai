import { supabaseAdmin } from "./supabase";
import {
  KnowledgeBaseDocument,
  KnowledgeBaseCategory,
  KnowledgeBaseStats,
} from "@/types";
import Anthropic from "@anthropic-ai/sdk";

// ============================================================================
// EXTRACCION DE TEXTO DE ARCHIVOS
// ============================================================================

/**
 * Extraer texto de archivo segun tipo
 */
export async function extractTextFromFile(
  file: Buffer,
  fileType: string
): Promise<string> {
  try {
    switch (fileType) {
      case "pdf": {
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(file);
        return pdfData.text;
      }

      case "docx": {
        const mammoth = require("mammoth");
        const result = await mammoth.extractRawText({ buffer: file });
        return result.value;
      }

      case "txt":
      case "md":
        return file.toString("utf-8");

      default:
        throw new Error(`Tipo de archivo no soportado: ${fileType}`);
    }
  } catch (error) {
    console.error("Error extrayendo texto:", error);
    throw error;
  }
}

/**
 * Generar resumen del contenido usando Claude
 */
export async function generateSummary(content: string): Promise<string> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return "";
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Resume este documento en 2-3 oraciones clave. Enfocate en: tipo de documento, proposito principal, informacion mas importante.

Documento:
${content.substring(0, 3000)}`,
        },
      ],
    });

    return message.content[0].type === "text" ? message.content[0].text : "";
  } catch (error) {
    console.error("Error generando resumen:", error);
    return "";
  }
}

// ============================================================================
// GESTION DE CATEGORIAS
// ============================================================================

/**
 * Obtener categorias de una empresa
 */
export async function getCompanyCategories(
  companyId: string
): Promise<KnowledgeBaseCategory[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("knowledge_base_categories")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data || []) as KnowledgeBaseCategory[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Crear categoria personalizada
 */
export async function createCategory(
  companyId: string,
  name: string,
  description?: string,
  icon: string = "folder",
  color: string = "#3B82F6"
): Promise<KnowledgeBaseCategory | null> {
  try {
    // Generar slug del nombre
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Obtener siguiente orden
    const { data: categories } = await supabaseAdmin
      .from("knowledge_base_categories")
      .select("display_order")
      .eq("company_id", companyId)
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder =
      categories && categories.length > 0 ? categories[0].display_order + 1 : 1;

    const { data, error } = await supabaseAdmin
      .from("knowledge_base_categories")
      .insert({
        company_id: companyId,
        name,
        slug,
        description,
        icon,
        color,
        display_order: nextOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return data as KnowledgeBaseCategory;
  } catch (error) {
    console.error("Error creating category:", error);
    return null;
  }
}

/**
 * Actualizar categoria
 */
export async function updateCategory(
  categoryId: string,
  updates: Partial<KnowledgeBaseCategory>
): Promise<KnowledgeBaseCategory | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("knowledge_base_categories")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId)
      .select()
      .single();

    if (error) throw error;
    return data as KnowledgeBaseCategory;
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
}

/**
 * Eliminar categoria
 */
export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("knowledge_base_categories")
      .delete()
      .eq("id", categoryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;
  }
}

// ============================================================================
// GESTION DE DOCUMENTOS
// ============================================================================

/**
 * Subir documento a la knowledge base
 */
export async function uploadToKnowledgeBase(
  companyId: string,
  userId: string,
  title: string,
  category: string,
  fileBuffer: Buffer,
  filename: string,
  fileType: string,
  tags: string[] = [],
  metadata: Record<string, unknown> = {}
): Promise<KnowledgeBaseDocument | null> {
  try {
    // 1. Extraer texto
    const content = await extractTextFromFile(fileBuffer, fileType);

    if (!content || content.trim().length < 50) {
      throw new Error("El documento no contiene texto suficiente");
    }

    // 2. Generar resumen
    const summary = await generateSummary(content);

    // 3. Guardar en BD
    const { data, error } = await supabaseAdmin
      .from("knowledge_base")
      .insert({
        company_id: companyId,
        title,
        filename,
        file_type: fileType,
        file_size: fileBuffer.length,
        category,
        content,
        content_summary: summary,
        tags,
        metadata,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as KnowledgeBaseDocument;
  } catch (error) {
    console.error("Error uploading to knowledge base:", error);
    return null;
  }
}

/**
 * Subir documento con contenido directo (sin archivo)
 */
export async function uploadTextToKnowledgeBase(
  companyId: string,
  userId: string,
  title: string,
  category: string,
  content: string,
  tags: string[] = [],
  metadata: Record<string, unknown> = {}
): Promise<KnowledgeBaseDocument | null> {
  try {
    if (!content || content.trim().length < 50) {
      throw new Error("El contenido es muy corto");
    }

    // Generar resumen
    const summary = await generateSummary(content);

    // Guardar en BD
    const { data, error } = await supabaseAdmin
      .from("knowledge_base")
      .insert({
        company_id: companyId,
        title,
        filename: null,
        file_type: "txt",
        file_size: Buffer.byteLength(content, "utf-8"),
        category,
        content,
        content_summary: summary,
        tags,
        metadata,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as KnowledgeBaseDocument;
  } catch (error) {
    console.error("Error uploading text to knowledge base:", error);
    return null;
  }
}

/**
 * Obtener documentos de la knowledge base
 */
export async function getKnowledgeBaseDocuments(
  companyId: string,
  category?: string,
  limit: number = 50
): Promise<KnowledgeBaseDocument[]> {
  try {
    let query = supabaseAdmin
      .from("knowledge_base")
      .select("*")
      .eq("company_id", companyId);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as KnowledgeBaseDocument[];
  } catch (error) {
    console.error("Error fetching knowledge base documents:", error);
    return [];
  }
}

/**
 * Obtener documento por ID
 */
export async function getKnowledgeDocumentById(
  docId: string
): Promise<KnowledgeBaseDocument | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("knowledge_base")
      .select("*")
      .eq("id", docId)
      .single();

    if (error) throw error;
    return data as KnowledgeBaseDocument;
  } catch (error) {
    console.error("Error fetching document:", error);
    return null;
  }
}

/**
 * Buscar en knowledge base (full-text search)
 */
export async function searchKnowledgeBase(
  companyId: string,
  searchQuery: string,
  category?: string
): Promise<KnowledgeBaseDocument[]> {
  try {
    // Usar busqueda simple por ilike si textSearch falla
    let query = supabaseAdmin
      .from("knowledge_base")
      .select("*")
      .eq("company_id", companyId)
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query
      .order("usage_count", { ascending: false })
      .limit(20);

    if (error) throw error;
    return (data || []) as KnowledgeBaseDocument[];
  } catch (error) {
    console.error("Error searching knowledge base:", error);
    return [];
  }
}

/**
 * Actualizar documento
 */
export async function updateKnowledgeDocument(
  docId: string,
  updates: Partial<KnowledgeBaseDocument>
): Promise<KnowledgeBaseDocument | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("knowledge_base")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", docId)
      .select()
      .single();

    if (error) throw error;
    return data as KnowledgeBaseDocument;
  } catch (error) {
    console.error("Error updating knowledge document:", error);
    return null;
  }
}

/**
 * Eliminar documento
 */
export async function deleteKnowledgeDocument(docId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("knowledge_base")
      .delete()
      .eq("id", docId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting knowledge document:", error);
    return false;
  }
}

// ============================================================================
// ESTADISTICAS Y ANALYTICS
// ============================================================================

/**
 * Obtener estadisticas de la knowledge base
 */
export async function getKnowledgeBaseStats(
  companyId: string
): Promise<KnowledgeBaseStats> {
  try {
    const { data: documents, error } = await supabaseAdmin
      .from("knowledge_base")
      .select("id, category, usage_count, created_at, title, file_size")
      .eq("company_id", companyId);

    if (error) throw error;

    const totalDocuments = documents?.length || 0;
    const totalSize =
      documents?.reduce((acc, doc) => acc + (doc.file_size || 0), 0) || 0;

    const categories = new Set(documents?.map((d) => d.category));

    const recentUploads = (documents || [])
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5) as unknown as KnowledgeBaseDocument[];

    // Categoria mas usada
    const categoryUsage: Record<string, number> = {};
    documents?.forEach((doc) => {
      categoryUsage[doc.category] =
        (categoryUsage[doc.category] || 0) + doc.usage_count;
    });
    const mostUsedCategory =
      Object.entries(categoryUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    return {
      totalDocuments,
      totalSize,
      categoriesCount: categories.size,
      lastUploadedAt: recentUploads?.[0]?.created_at || null,
      mostUsedCategory,
      recentUploads: recentUploads || [],
    };
  } catch (error) {
    console.error("Error fetching knowledge base stats:", error);
    return {
      totalDocuments: 0,
      totalSize: 0,
      categoriesCount: 0,
      lastUploadedAt: null,
      mostUsedCategory: "",
      recentUploads: [],
    };
  }
}

// ============================================================================
// GENERACION CON CONTEXTO (CORE FEATURE)
// ============================================================================

/**
 * Obtener contexto relevante de la knowledge base para generacion
 * CLAVE: Esto se usa al generar documentos
 */
export async function getRelevantKnowledgeContext(
  companyId: string,
  docType: string,
  category?: string
): Promise<string> {
  try {
    // 1. Buscar documentos relevantes
    let query = supabaseAdmin
      .from("knowledge_base")
      .select("id, title, content, content_summary, usage_count")
      .eq("company_id", companyId);

    if (category) {
      query = query.eq("category", category);
    }

    const { data: documents, error } = await query
      .order("usage_count", { ascending: false })
      .limit(5); // Top 5 mas usados

    if (error) throw error;
    if (!documents || documents.length === 0) return "";

    // 2. Formatear contexto
    const context = documents
      .map((doc, index) => {
        // Usar resumen si existe, sino primeros 1500 chars del contenido
        const text = doc.content_summary || doc.content.substring(0, 1500);

        return `DOCUMENTO DE REFERENCIA #${index + 1}: ${doc.title}
-------------------------------------------
${text}
${doc.content_summary ? "" : "...[contenido truncado]"}
-------------------------------------------`;
      })
      .join("\n\n");

    // 3. Incrementar contador de uso
    const docIds = documents.map((d) => d.id).filter(Boolean);
    if (docIds.length > 0) {
      // Incrementar uso en background
      supabaseAdmin.rpc("increment_kb_usage", { doc_ids: docIds }).then();
    }

    return context;
  } catch (error) {
    console.error("Error getting relevant knowledge context:", error);
    return "";
  }
}
