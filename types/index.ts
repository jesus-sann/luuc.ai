// ===========================================
// LUUC.AI - Type Definitions
// ===========================================

// Usuario
export interface User {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  company_id: string | null;
  role: "owner" | "admin" | "member" | null;
  usage_count: number;
  plan: "free" | "pro" | "enterprise";
  created_at: string;
}

// Documento generado
export interface Document {
  id: string;
  user_id: string;
  title: string;
  doc_type: DocumentType;
  content: string;
  variables: Record<string, string>;
  created_at: string;
}

// Tipos de documentos soportados
export type DocumentType =
  | "nda"
  | "contrato"
  | "contrato_servicios"
  | "carta_correo"
  | "carta_terminacion"
  | "acta_reunion"
  | "politica_interna"
  | "performance_report";

// Template de documento
export interface Template {
  id: string;
  name: string;
  slug: DocumentType;
  description: string;
  icon: string;
  category: string;
  outputType: string;
  variables: TemplateVariable[];
  system_prompt: string;
}

// Variable de template
export interface TemplateVariable {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[]; // Para tipo select
}

// Análisis de documento
export interface Analysis {
  id: string;
  user_id: string;
  filename: string;
  file_path: string | null;
  risk_score: number;
  findings: RiskFinding[];
  recommendations: string[];
  summary: string;
  created_at: string;
}

// Hallazgo de riesgo
export interface RiskFinding {
  nivel: "CRITICO" | "ALTO" | "MEDIO" | "BAJO";
  descripcion: string;
  clausula: string;
  recomendacion: string;
}

// Respuesta del análisis de IA
export interface AnalysisResponse {
  resumen: string;
  score: number;
  riesgos: RiskFinding[];
  clausulas_faltantes: string[];
  observaciones_generales: string;
}

// Request para generar documento
export interface GenerateDocumentRequest {
  template: DocumentType;
  variables: Record<string, string>;
  title: string;
}

// Request para revisar documento
export interface ReviewDocumentRequest {
  content: string;
  filename: string;
}

// Response genérica de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ===========================================
// COMPANY TYPES (Multi-Tenant)
// ===========================================

// Empresa/Firma
export interface Company {
  id: string;
  name: string;
  user_id: string;
  industry: string | null;
  description: string | null;
  document_rules: DocumentRules | Record<string, unknown> | null;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
}

// Reglas de documentos de la empresa
export interface DocumentRules {
  style: "formal" | "semiformal" | "informal";
  language: "es" | "en";
  tone?: string;
  customInstructions?: string;
}

// Documento de referencia de empresa
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

// Request para crear empresa
export interface CreateCompanyRequest {
  name: string;
  industry: string;
  description?: string;
}

// Request para subir documento de referencia
export interface UploadCompanyDocumentRequest {
  companyId: string;
  title: string;
  content: string;
  docType?: string;
  category?: "aprobado" | "borrador" | "ejemplo";
}

// Request para generar con contexto de empresa
export interface GenerateWithCompanyRequest extends GenerateDocumentRequest {
  companyId?: string;
}

// ===========================================
// KNOWLEDGE BASE TYPES
// ===========================================

// Documento en la Knowledge Base
export interface KnowledgeBaseDocument {
  id: string;
  company_id: string;
  title: string;
  filename: string | null;
  file_type: "pdf" | "docx" | "txt" | "md" | "other" | null;
  file_size: number | null;
  category: string;
  tags: string[];
  content: string;
  content_summary: string | null;
  metadata: Record<string, unknown>;
  usage_count: number;
  last_used_at: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

// Categoria de Knowledge Base
export interface KnowledgeBaseCategory {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  display_order: number;
  is_active: boolean;
  document_count: number;
  created_at: string;
  updated_at: string;
}

// Estadisticas de Knowledge Base
export interface KnowledgeBaseStats {
  totalDocuments: number;
  totalSize: number; // bytes
  categoriesCount: number;
  lastUploadedAt: string | null;
  mostUsedCategory: string;
  recentUploads: KnowledgeBaseDocument[];
}

// Request para subir a Knowledge Base
export interface UploadKnowledgeRequest {
  title: string;
  category: string;
  file?: File;
  content?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Request para crear categoria
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}
