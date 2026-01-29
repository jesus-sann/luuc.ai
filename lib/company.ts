import { supabaseAdmin } from "./supabase";

// ===========================================
// TIPOS LOCALES
// ===========================================
export interface Company {
  id: string;
  name: string;
  user_id: string;
  industry: string | null;
  description: string | null;
  document_rules: Record<string, unknown> | null;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
}

export interface CompanyDocument {
  id: string;
  company_id: string;
  title: string;
  content: string;
  doc_type: string | null;
  category: "aprobado" | "borrador" | "ejemplo";
  uploaded_by: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
}

interface DocumentRules {
  style?: string;
  tone?: string;
  customInstructions?: string;
}

// ===========================================
// FUNCIONES DE EMPRESA
// ===========================================

/**
 * Obtener empresa del usuario actual
 */
export async function getCompanyByUser(userId: string): Promise<Company | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching company:", error);
      return null;
    }
    return data as Company | null;
  } catch (error) {
    console.error("Error in getCompanyByUser:", error);
    return null;
  }
}

/**
 * Obtener empresa por ID
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .maybeSingle();

    if (error) throw error;
    return data as Company | null;
  } catch (error) {
    console.error("Error in getCompanyById:", error);
    return null;
  }
}

/**
 * Crear empresa
 */
export async function createCompany(
  userId: string,
  name: string,
  industry: string,
  description?: string
): Promise<Company | null> {
  try {
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        user_id: userId,
        name,
        industry,
        description: description || null,
      })
      .select()
      .single();

    if (companyError) throw companyError;

    // Actualizar user.company_id y role a admin
    const { error: userError } = await supabaseAdmin
      .from("users")
      .update({ company_id: (company as Company).id, role: "admin" })
      .eq("id", userId);

    if (userError) {
      console.error("Error updating user company_id:", userError);
      // No lanzamos error, la empresa se creó correctamente
    }

    return company as Company;
  } catch (error) {
    console.error("Error creating company:", error);
    return null;
  }
}

/**
 * Actualizar empresa
 */
export async function updateCompany(
  companyId: string,
  updates: Partial<Company>
): Promise<Company | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("companies")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", companyId)
      .select()
      .single();

    if (error) throw error;
    return data as Company;
  } catch (error) {
    console.error("Error updating company:", error);
    return null;
  }
}

// ===========================================
// FUNCIONES DE DOCUMENTOS DE REFERENCIA
// ===========================================

/**
 * Obtener documentos de referencia de una empresa
 */
export async function getCompanyDocuments(
  companyId: string,
  docType?: string,
  category?: string
): Promise<CompanyDocument[]> {
  try {
    let query = supabaseAdmin
      .from("company_documents")
      .select("*")
      .eq("company_id", companyId);

    if (docType) {
      query = query.eq("doc_type", docType);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as CompanyDocument[];
  } catch (error) {
    console.error("Error fetching company documents:", error);
    return [];
  }
}

/**
 * Obtener documento por ID
 */
export async function getCompanyDocumentById(
  docId: string
): Promise<CompanyDocument | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("company_documents")
      .select("*")
      .eq("id", docId)
      .maybeSingle();

    if (error) throw error;

    // Incrementar views_count
    if (data) {
      const doc = data as CompanyDocument;
      await supabaseAdmin
        .from("company_documents")
        .update({ views_count: doc.views_count + 1 })
        .eq("id", docId);
    }

    return data as CompanyDocument | null;
  } catch (error) {
    console.error("Error fetching company document:", error);
    return null;
  }
}

/**
 * Subir documento de referencia
 */
export async function uploadCompanyDocument(
  companyId: string,
  userId: string,
  title: string,
  content: string,
  docType?: string,
  category: "aprobado" | "borrador" | "ejemplo" = "aprobado"
): Promise<CompanyDocument | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("company_documents")
      .insert({
        company_id: companyId,
        title,
        content,
        doc_type: docType || null,
        category,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CompanyDocument;
  } catch (error) {
    console.error("Error uploading company document:", error);
    return null;
  }
}

/**
 * Actualizar documento de referencia
 */
export async function updateCompanyDocument(
  docId: string,
  updates: Partial<CompanyDocument>
): Promise<CompanyDocument | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("company_documents")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", docId)
      .select()
      .single();

    if (error) throw error;
    return data as CompanyDocument;
  } catch (error) {
    console.error("Error updating company document:", error);
    return null;
  }
}

/**
 * Eliminar documento de referencia
 */
export async function deleteCompanyDocument(docId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("company_documents")
      .delete()
      .eq("id", docId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting company document:", error);
    return false;
  }
}

// ===========================================
// FUNCIONES PARA GENERACIÓN CON CONTEXTO
// ===========================================

/**
 * Obtener documentos aprobados para usar como contexto en generación
 * CLAVE: Esto se usa en /api/generate para contextualizar con Claude
 */
export async function getApprovedDocumentsForContext(
  companyId: string,
  docType: string
): Promise<string> {
  try {
    // Buscar documentos del mismo tipo
    let documents = await getCompanyDocuments(companyId, docType, "aprobado");

    // Si no hay del mismo tipo, buscar cualquier aprobado
    if (documents.length === 0) {
      documents = await getCompanyDocuments(companyId, undefined, "aprobado");
    }

    if (documents.length === 0) return "";

    // Limitar a máximo 3 documentos para optimizar tokens
    const selectedDocs = documents.slice(0, 3);

    return selectedDocs
      .map(
        (doc, index) =>
          `DOCUMENTO DE REFERENCIA #${index + 1}: ${doc.title}
═════════════════════════════════════════════
${doc.content.substring(0, 5000)}${doc.content.length > 5000 ? "\n[... documento truncado ...]" : ""}
═════════════════════════════════════════════`
      )
      .join("\n\n");
  } catch (error) {
    console.error("Error in getApprovedDocumentsForContext:", error);
    return "";
  }
}

/**
 * Construir instrucciones adicionales basadas en reglas de la empresa
 */
export async function getCompanyInstructions(companyId: string): Promise<string> {
  try {
    const company = await getCompanyById(companyId);
    if (!company || !company.document_rules) return "";

    const rules = company.document_rules as DocumentRules;
    let instructions = "";

    if (rules.style) {
      instructions += `- Estilo de redacción: ${rules.style}\n`;
    }
    if (rules.tone) {
      instructions += `- Tono: ${rules.tone}\n`;
    }
    if (rules.customInstructions) {
      instructions += `- Instrucciones específicas: ${rules.customInstructions}\n`;
    }

    return instructions;
  } catch (error) {
    console.error("Error getting company instructions:", error);
    return "";
  }
}

// ===========================================
// ESTADÍSTICAS DE EMPRESA
// ===========================================

/**
 * Obtener estadísticas de la empresa
 */
export async function getCompanyStats(companyId: string): Promise<{
  totalDocumentsGenerated: number;
  totalDocumentsApproved: number;
  totalMembers: number;
}> {
  try {
    const [docsGenerated, docsApproved, members] = await Promise.all([
      supabaseAdmin
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId),
      supabaseAdmin
        .from("company_documents")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("category", "aprobado"),
      supabaseAdmin
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId),
    ]);

    return {
      totalDocumentsGenerated: docsGenerated.count || 0,
      totalDocumentsApproved: docsApproved.count || 0,
      totalMembers: members.count || 0,
    };
  } catch (error) {
    console.error("Error fetching company stats:", error);
    return {
      totalDocumentsGenerated: 0,
      totalDocumentsApproved: 0,
      totalMembers: 0,
    };
  }
}
