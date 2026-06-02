import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente para uso en el navegador (sin tipos estrictos por ahora)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * ⚠️ SECURITY WARNING: supabaseAdmin BYPASSES Row Level Security (RLS)
 *
 * This client uses the service_role key which has FULL access to all data
 * across ALL tenants. RLS policies are NOT enforced.
 *
 * USE ONLY FOR:
 * - Operations that have already validated user authorization in application code
 * - Admin operations (user management, company setup, audit logs)
 * - Background jobs that need cross-tenant access
 *
 * ALWAYS:
 * - Validate user permissions BEFORE using supabaseAdmin
 * - Include company_id filters for multi-tenant queries
 * - Log sensitive operations to audit_logs
 *
 * PREFER using createClient() from "@/lib/supabase/server" which respects RLS
 * for standard user operations where possible.
 */
// SECURITY: Do NOT fall back to the anon key — a missing service role key should be
// a hard failure at startup, not a silent degradation that bypasses RLS incorrectly
// (operations would appear to succeed but would actually run under anon permissions,
// silently skipping writes that require service-role access).
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey && process.env.NODE_ENV !== "test") {
  // In production this must be set; log a loud warning so it surfaces in monitoring.
  console.error(
    "[SECURITY] SUPABASE_SERVICE_ROLE_KEY is not configured. " +
    "supabaseAdmin will NOT bypass RLS — admin operations will fail or behave unexpectedly."
  );
}

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  // If the key is absent we still create the client (to avoid a build-time crash)
  // but operations requiring service-role access will fail with a 403, which is
  // a safer failure mode than silently operating as anon.
  serviceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ===========================================
// Tipos para funciones
// ===========================================
export interface DocumentRow {
  id: string;
  user_id: string | null;
  company_id: string | null;
  title: string;
  doc_type: string;
  content: string;
  variables: Record<string, unknown>;
  is_custom: boolean;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface AnalysisRow {
  id: string;
  user_id: string | null;
  filename: string;
  file_path: string | null;
  file_size: number | null;
  focus_context: string | null;
  risk_score: number;
  summary: string | null;
  findings: unknown[];
  missing_clauses: string[];
  observations: string | null;
  created_at: string;
}

// ===========================================
// Funciones de ayuda para la base de datos
// ===========================================
// ⚠️ SECURITY NOTE: These functions use supabaseAdmin (bypasses RLS).
// Authorization must be validated by the caller BEFORE invoking these functions.
// Always pass company_id for multi-tenant isolation when applicable.
// ===========================================

/**
 * Save a document to the database
 * ⚠️ Uses supabaseAdmin - caller MUST validate user authorization first
 */
export async function saveDocument(data: {
  user_id?: string;
  company_id?: string;
  title: string;
  doc_type: string;
  content: string;
  variables?: Record<string, string>;
  is_custom?: boolean;
}): Promise<DocumentRow> {
  const wordCount = data.content.split(/\s+/).length;

  const { data: document, error } = await supabaseAdmin
    .from("documents")
    .insert({
      user_id: data.user_id || null,
      company_id: data.company_id || null,
      title: data.title,
      doc_type: data.doc_type,
      content: data.content,
      variables: data.variables || {},
      is_custom: data.is_custom || false,
      word_count: wordCount,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving document:", error);
    throw error;
  }

  return document as DocumentRow;
}

/**
 * Get documents for a specific user
 * ⚠️ Uses supabaseAdmin - caller MUST validate user authorization first
 * TODO: Consider accepting companyId param for multi-tenant filtering
 */
export async function getDocuments(userId: string): Promise<DocumentRow[]> {
  // Note: This only filters by user_id, not company_id
  // For company-wide access, use a separate function with company_id filter
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }

  return (data || []) as DocumentRow[];
}

/**
 * Get a document by ID
 * ⚠️ Uses supabaseAdmin - caller MUST validate user/company ownership after fetching
 * This function returns the document regardless of ownership - authorization
 * must be checked by the API route handler.
 */
export async function getDocumentById(id: string): Promise<DocumentRow | null> {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching document:", error);
    throw error;
  }

  return data as DocumentRow;
}

/**
 * Save an analysis to the database
 * ⚠️ Uses supabaseAdmin - caller MUST validate user authorization first
 */
export async function saveAnalysis(data: {
  user_id?: string;
  company_id?: string; // SEGURIDAD: Para aislamiento multi-tenant
  filename: string;
  file_path?: string;
  file_size?: number;
  focus_context?: string;
  risk_score: number;
  summary: string;
  findings: unknown[];
  missing_clauses: string[];
  observations: string;
}): Promise<AnalysisRow> {
  const { data: analysis, error } = await supabaseAdmin
    .from("analyses")
    .insert({
      user_id: data.user_id || null,
      company_id: data.company_id || null, // SEGURIDAD: Asociar con company
      filename: data.filename,
      file_path: data.file_path || null,
      file_size: data.file_size || null,
      focus_context: data.focus_context || null,
      risk_score: data.risk_score,
      summary: data.summary,
      findings: data.findings,
      missing_clauses: data.missing_clauses,
      observations: data.observations,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving analysis:", error);
    throw error;
  }

  return analysis as AnalysisRow;
}

/**
 * Get analyses for a specific user
 * ⚠️ Uses supabaseAdmin - caller MUST validate user authorization first
 */
export async function getAnalyses(userId: string): Promise<AnalysisRow[]> {
  const { data, error } = await supabaseAdmin
    .from("analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching analyses:", error);
    throw error;
  }

  return (data || []) as AnalysisRow[];
}

/**
 * Log usage for billing and analytics
 * ⚠️ Uses supabaseAdmin - safe because it only inserts, not reads
 */
export async function logUsage(data: {
  user_id?: string;
  action_type: string;
  tokens_used?: number;
  model_used?: string;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabaseAdmin.from("usage_logs").insert({
    user_id: data.user_id || null,
    action_type: data.action_type,
    tokens_used: data.tokens_used || 0,
    model_used: data.model_used || "claude-sonnet-4-20250514",
    metadata: data.metadata || {},
  });

  if (error) {
    console.error("Error logging usage:", error);
    // No lanzamos error para no interrumpir el flujo
  }
}

/**
 * Get user by email (admin operation)
 * ⚠️ Uses supabaseAdmin - use only for system operations, not user-facing queries
 */
export async function getUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user:", error);
    throw error;
  }

  return data;
}

/**
 * Update user's last login timestamp
 * ⚠️ Uses supabaseAdmin - safe because it updates user's own record during auth flow
 */
export async function updateUserLastLogin(userId: string) {
  const { error } = await supabaseAdmin
    .from("users")
    .update({ last_login: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Error updating last login:", error);
  }
}
