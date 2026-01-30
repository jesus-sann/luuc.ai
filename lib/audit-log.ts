/**
 * Audit logging for sensitive actions
 * For now, logs to console with structured format
 * TODO: Add database table for persistent audit logs
 */

export type AuditAction =
  | "document.generate"
  | "document.review"
  | "document.delete"
  | "document.duplicate"
  | "kb.upload"
  | "kb.delete"
  | "settings.update";

interface AuditLogEntry {
  userId: string;
  companyId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  ip?: string;
}

/**
 * Log an audit event
 * Non-blocking - never throws errors to avoid breaking parent operations
 */
export function auditLog(params: {
  userId: string;
  companyId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ip?: string;
}): void {
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
    };

    // Structured JSON logging for easy parsing by log aggregators
    console.log(
      JSON.stringify({
        level: "audit",
        ...entry,
      })
    );
  } catch (error) {
    // Never fail - log errors separately but don't throw
    console.error("Audit logging failed (non-critical):", error);
  }
}
