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
  letterhead_url: string | null;
  // Contact / identity fields (may be null if not filled in settings)
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  website: string | null;
  bar_number: string | null;
  practice_areas: string | null;
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
  userId: string,
  updates: Partial<Company>
): Promise<Company | null> {
  try {
    // Verify ownership before mutating — supabaseAdmin bypasses RLS
    const { data: existing } = await supabaseAdmin
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!existing) return null;

    const { data, error } = await supabaseAdmin
      .from("companies")
      .update({ ...updates, updated_at: new Date().toISOString() })
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
export async function deleteCompanyDocument(docId: string, userId: string): Promise<boolean> {
  try {
    // Verify document belongs to a company the user owns before deleting
    const { data: existing } = await supabaseAdmin
      .from("company_documents")
      .select("id, company_id, companies!inner(user_id)")
      .eq("id", docId)
      .maybeSingle();
    if (!existing) return false;
    const owner = (existing as any).companies?.user_id;
    if (owner !== userId) return false;

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
 * Build the firm identity + style block injected into every AI system prompt.
 * The identity section tells the AI which firm it is drafting for so it never
 * invents attorney names or law firm names from training data.
 */
export async function getCompanyInstructions(companyId: string): Promise<string> {
  try {
    const company = await getCompanyById(companyId);
    if (!company) return "";

    // --- Firm identity (use only these details, never substitute from training data) ---
    let identity = `FIRM IDENTITY — use ONLY these details in the document; never substitute names or information from training data:\n`;
    identity += `- Firm name: ${company.name}\n`;

    const addressParts = [
      company.address_line1,
      company.address_line2,
      company.city,
      company.state,
      company.zip,
    ].filter(Boolean);
    if (addressParts.length > 0) {
      identity += `- Address: ${addressParts.join(", ")}\n`;
    }
    if (company.phone) identity += `- Phone: ${company.phone}\n`;
    if (company.website) identity += `- Website: ${company.website}\n`;
    if (company.bar_number) identity += `- Bar number: ${company.bar_number}\n`;
    if (company.practice_areas) identity += `- Practice areas: ${company.practice_areas}\n`;

    // --- Style / tone from document_rules ---
    const rules = (company.document_rules || {}) as DocumentRules;
    let style = "";
    if (rules.style) style += `- Writing style: ${rules.style}\n`;
    if (rules.tone) style += `- Tone: ${rules.tone}\n`;
    if (rules.customInstructions) style += `- Additional instructions: ${rules.customInstructions}\n`;

    return style ? `${identity}\nSTYLE AND TONE:\n${style}` : identity;
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
