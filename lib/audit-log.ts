/**
 * Audit logging for sensitive actions
 * Persists to database for compliance and security monitoring
 * Also logs to console for development and log aggregators
 */

import { supabaseAdmin } from "./supabase";

export type AuditAction =
  | "document.generate"
  | "document.view"
  | "document.review"
  | "document.delete"
  | "document.duplicate"
  | "document.update"
  | "kb.upload"
  | "kb.delete"
  | "settings.update"
  | "auth.login"
  | "auth.logout";

interface AuditLogEntry {
  userId: string;
  companyId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 * Non-blocking - never throws errors to avoid breaking parent operations
 * Persists to database AND logs to console
 */
export function auditLog(params: {
  userId: string;
  companyId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}): void {
  // Fire and forget - don't await to avoid blocking the request
  persistAuditLog(params).catch((error) => {
    console.error("Audit log persistence failed (non-critical):", error);
  });
}

/**
 * Persist audit log to database
 * @internal
 */
async function persistAuditLog(params: {
  userId: string;
  companyId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    const entry: AuditLogEntry = {
      userId: params.userId,
      companyId: params.companyId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.metadata,
      timestamp: new Date().toISOString(),
      ip: params.ip,
      userAgent: params.userAgent,
    };

    // Persist to database for compliance
    const { error } = await supabaseAdmin.from("audit_logs").insert({
      user_id: params.userId,
      company_id: params.companyId || null,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId || null,
      metadata: params.metadata || {},
      ip_address: params.ip || null,
      user_agent: params.userAgent || null,
    });

    if (error) {
      // Log to console if DB insert fails (table might not exist yet)
      console.error("[AUDIT] Database insert failed:", error.message);
    }

    // Also log to console for development and log aggregators
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({
          level: "audit",
          ...entry,
        })
      );
    }
  } catch (error) {
    // Never fail - log errors separately but don't throw
    console.error("Audit logging failed (non-critical):", error);
  }
}
