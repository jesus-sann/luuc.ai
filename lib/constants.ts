/**
 * CONSTANTS - Central location for magic strings and enums
 *
 * This file eliminates magic strings across the codebase.
 * All document types, template names, and fixed values should be defined here.
 */

// ===========================================
// DOCUMENT TYPES
// ===========================================

export const DOCUMENT_TYPES = {
  NDA: "nda",
  CONTRATO_SERVICIOS: "contrato_servicios",
  CARTA_TERMINACION: "carta_terminacion",
  ACTA_REUNION: "acta_reunion",
  POLITICA_INTERNA: "politica_interna",
} as const;

export type DocumentTypeValue = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

// Custom document types (from generate-custom)
export const CUSTOM_DOCUMENT_TYPES = {
  CONTRATO: "contrato",
  CARTA: "carta",
  POLITICA: "politica",
  ACTA: "acta",
  PODER: "poder",
  MEMORANDO: "memorando",
  OTRO: "otro",
} as const;

export type CustomDocumentTypeValue = typeof CUSTOM_DOCUMENT_TYPES[keyof typeof CUSTOM_DOCUMENT_TYPES];

export const ALLOWED_CUSTOM_DOCUMENT_TYPES = Object.values(CUSTOM_DOCUMENT_TYPES);

// ===========================================
// TEMPLATE NAMES (Human-readable)
// ===========================================

export const TEMPLATE_NAMES = {
  [DOCUMENT_TYPES.NDA]: "Acuerdo de Confidencialidad (NDA)",
  [DOCUMENT_TYPES.CONTRATO_SERVICIOS]: "Contrato de Prestación de Servicios",
  [DOCUMENT_TYPES.CARTA_TERMINACION]: "Carta de Terminación de Contrato",
  [DOCUMENT_TYPES.ACTA_REUNION]: "Acta de Reunión",
  [DOCUMENT_TYPES.POLITICA_INTERNA]: "Política Interna",
} as const;

// ===========================================
// USAGE ACTION TYPES
// ===========================================

export const USAGE_ACTION_TYPES = {
  GENERATE: "generate",
  ANALYZE: "analyze",
  CUSTOM_GENERATE: "custom_generate",
  UPLOAD_KB: "upload_knowledge_base",
  VIEW_DOCUMENT: "view_document",
  DOWNLOAD_DOCUMENT: "download_document",
} as const;

export type UsageActionType = typeof USAGE_ACTION_TYPES[keyof typeof USAGE_ACTION_TYPES];

// ===========================================
// RISK LEVELS
// ===========================================

export const RISK_LEVELS = {
  CRITICO: "CRITICO",
  ALTO: "ALTO",
  MEDIO: "MEDIO",
  BAJO: "BAJO",
} as const;

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS];

// ===========================================
// PLANS
// ===========================================

export const PLANS = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export type Plan = typeof PLANS[keyof typeof PLANS];

// ===========================================
// COMPANY DOCUMENT CATEGORIES
// ===========================================

export const COMPANY_DOCUMENT_CATEGORIES = {
  APROBADO: "aprobado",
  BORRADOR: "borrador",
  EJEMPLO: "ejemplo",
} as const;

export type CompanyDocumentCategory = typeof COMPANY_DOCUMENT_CATEGORIES[keyof typeof COMPANY_DOCUMENT_CATEGORIES];

// ===========================================
// KNOWLEDGE BASE FILE TYPES
// ===========================================

export const KB_FILE_TYPES = {
  PDF: "pdf",
  DOCX: "docx",
  TXT: "txt",
  MD: "md",
  OTHER: "other",
} as const;

export type KBFileType = typeof KB_FILE_TYPES[keyof typeof KB_FILE_TYPES];

// ===========================================
// COMPANY STATUSES
// ===========================================

export const COMPANY_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;

export type CompanyStatus = typeof COMPANY_STATUSES[keyof typeof COMPANY_STATUSES];

// ===========================================
// USER ROLES
// ===========================================

export const USER_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// ===========================================
// API RESPONSE STATUS CODES
// ===========================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ===========================================
// PLAN LIMITS
// ===========================================

export const PLAN_LIMITS = {
  FREE: {
    DOCUMENTS: 10,
    ANALYSES: 5,
    KB_DOCUMENTS: 0,
    KB_SIZE_MB: 0,
  },
  PRO: {
    DOCUMENTS: 100,
    ANALYSES: 50,
    KB_DOCUMENTS: 50,
    KB_SIZE_MB: 100,
  },
  ENTERPRISE: {
    DOCUMENTS: Infinity,
    ANALYSES: Infinity,
    KB_DOCUMENTS: Infinity,
    KB_SIZE_MB: 500,
  },
} as const;

// ===========================================
// CLAUDE MODEL
// ===========================================

export const CLAUDE_MODEL = "claude-sonnet-4-20250514" as const;

// ===========================================
// TIMEOUT SETTINGS (milliseconds)
// ===========================================

export const TIMEOUTS = {
  CLAUDE_API: 60000, // 60 seconds
  DATABASE_QUERY: 10000, // 10 seconds
  FILE_UPLOAD: 30000, // 30 seconds
} as const;
