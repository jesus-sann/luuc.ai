/**
 * VALIDADORES DE INPUT PARA ENDPOINTS API
 *
 * IMPORTANTE: Este archivo proporciona validación robusta de inputs para prevenir:
 * - Inyección de código (SQL, XSS, prompt injection)
 * - Payloads maliciosos o malformados
 * - Ataques de buffer overflow
 * - Consumo excesivo de recursos
 *
 * USO: Importar y validar TODOS los inputs antes de procesarlos
 */

// Límites de seguridad
export const SECURITY_LIMITS = {
  // Contenido de documentos
  MAX_DOCUMENT_CONTENT_LENGTH: 50000, // ~50KB de texto
  MIN_DOCUMENT_CONTENT_LENGTH: 100,

  // Análisis de documentos
  MAX_ANALYSIS_CONTENT_LENGTH: 50000,
  MIN_ANALYSIS_CONTENT_LENGTH: 100,
  MAX_FOCUS_CONTEXT_LENGTH: 1000,

  // Prompts personalizados
  MAX_CUSTOM_DESCRIPTION_LENGTH: 5000,
  MIN_CUSTOM_DESCRIPTION_LENGTH: 20,
  MAX_CUSTOM_DETAILS_LENGTH: 2000,

  // Archivos
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_FILE_SIZE: 100, // 100 bytes

  // Strings generales
  MAX_TITLE_LENGTH: 500,
  MAX_FILENAME_LENGTH: 500,
  MAX_CATEGORY_LENGTH: 100,
  MAX_TAG_LENGTH: 50,
  MAX_TAGS_COUNT: 20,

  // Metadata
  MAX_METADATA_SIZE: 10000, // 10KB JSON
} as const;

// Tipos de archivo permitidos
export const ALLOWED_FILE_TYPES = ['pdf', 'docx', 'doc', 'txt', 'md'] as const;
export type AllowedFileType = typeof ALLOWED_FILE_TYPES[number];

// Patrones sospechosos que pueden indicar ataques
const SUSPICIOUS_PATTERNS = [
  // SQL Injection patterns
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
  /(--|\bOR\b.*=.*|;\s*DROP|UNION\s+SELECT)/gi,

  // XSS patterns
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick=, onerror=, etc.

  // Path traversal
  /\.\.[\/\\]/g,

  // Command injection
  /[;&|`$()]/g,

  // Null bytes
  /\0/g,
];

// Patrones de prompt injection para Claude
const PROMPT_INJECTION_PATTERNS = [
  // Intentos de romper el contexto del sistema
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/gi,
  /disregard\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/gi,

  // Intentos de obtener información del sistema
  /what\s+(is|are)\s+your\s+(instructions?|system\s+prompt|rules?)/gi,
  /show\s+me\s+your\s+(instructions?|system\s+prompt|rules?)/gi,

  // Intentos de cambiar el rol
  /you\s+are\s+now\s+a/gi,
  /act\s+as\s+(if\s+you\s+are|a)/gi,
  /pretend\s+(you|to)\s+(are|be)/gi,
];

/**
 * Sanitiza un string eliminando caracteres peligrosos
 */
export function sanitizeString(input: string, maxLength: number): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Eliminar null bytes
  let sanitized = input.replace(/\0/g, '');

  // Limitar longitud
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Valida y sanitiza contenido de documento
 */
export function validateDocumentContent(content: unknown): {
  valid: boolean;
  sanitized?: string;
  error?: string
} {
  if (typeof content !== 'string') {
    return { valid: false, error: 'Content must be a string' };
  }

  const sanitized = sanitizeString(content, SECURITY_LIMITS.MAX_DOCUMENT_CONTENT_LENGTH);

  if (sanitized.length < SECURITY_LIMITS.MIN_DOCUMENT_CONTENT_LENGTH) {
    return {
      valid: false,
      error: `Document content must be at least ${SECURITY_LIMITS.MIN_DOCUMENT_CONTENT_LENGTH} characters`
    };
  }

  // Verificar patrones sospechosos
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      return {
        valid: false,
        error: 'Document content contains potentially malicious patterns'
      };
    }
  }

  return { valid: true, sanitized };
}

/**
 * Valida contenido para análisis (permite más flexibilidad que generación)
 */
export function validateAnalysisContent(content: unknown): {
  valid: boolean;
  sanitized?: string;
  error?: string;
} {
  if (typeof content !== 'string') {
    return { valid: false, error: 'Content must be a string' };
  }

  const sanitized = sanitizeString(content, SECURITY_LIMITS.MAX_ANALYSIS_CONTENT_LENGTH);

  if (sanitized.length < SECURITY_LIMITS.MIN_ANALYSIS_CONTENT_LENGTH) {
    return {
      valid: false,
      error: `Content must be at least ${SECURITY_LIMITS.MIN_ANALYSIS_CONTENT_LENGTH} characters`
    };
  }

  // Para análisis, permitimos más flexibilidad pero verificamos null bytes
  if (sanitized.includes('\0')) {
    return { valid: false, error: 'Content contains invalid characters' };
  }

  return { valid: true, sanitized };
}

/**
 * Valida focus context (opcional) para análisis enfocado
 */
export function validateFocusContext(focusContext: unknown): {
  valid: boolean;
  sanitized?: string;
  error?: string;
} {
  if (!focusContext) {
    return { valid: true, sanitized: undefined };
  }

  if (typeof focusContext !== 'string') {
    return { valid: false, error: 'Focus context must be a string' };
  }

  const sanitized = sanitizeString(focusContext, SECURITY_LIMITS.MAX_FOCUS_CONTEXT_LENGTH);

  // Verificar prompt injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      return {
        valid: false,
        error: 'Focus context contains suspicious patterns that may compromise the analysis'
      };
    }
  }

  return { valid: true, sanitized };
}

/**
 * Valida filename
 */
export function validateFilename(filename: unknown): {
  valid: boolean;
  sanitized?: string;
  error?: string;
} {
  if (typeof filename !== 'string') {
    return { valid: false, error: 'Filename must be a string' };
  }

  let sanitized = sanitizeString(filename, SECURITY_LIMITS.MAX_FILENAME_LENGTH);

  // Eliminar path traversal
  sanitized = sanitized.replace(/\.\.[\/\\]/g, '');
  sanitized = sanitized.replace(/[\/\\]/g, '_');

  // Solo permitir caracteres alfanuméricos, espacios, guiones, puntos
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.]/g, '');

  if (sanitized.length === 0) {
    return { valid: false, error: 'Invalid filename' };
  }

  return { valid: true, sanitized };
}

/**
 * Valida tipo de archivo
 */
export function validateFileType(fileType: unknown): {
  valid: boolean;
  fileType?: AllowedFileType;
  error?: string;
} {
  if (typeof fileType !== 'string') {
    return { valid: false, error: 'File type must be a string' };
  }

  const normalized = fileType.toLowerCase().trim();

  if (!ALLOWED_FILE_TYPES.includes(normalized as AllowedFileType)) {
    return {
      valid: false,
      error: `File type must be one of: ${ALLOWED_FILE_TYPES.join(', ')}`
    };
  }

  return { valid: true, fileType: normalized as AllowedFileType };
}

/**
 * Valida tamaño de archivo
 */
export function validateFileSize(fileSize: unknown): {
  valid: boolean;
  error?: string;
} {
  if (typeof fileSize !== 'number') {
    return { valid: false, error: 'File size must be a number' };
  }

  if (fileSize < SECURITY_LIMITS.MIN_FILE_SIZE) {
    return { valid: false, error: 'File is too small' };
  }

  if (fileSize > SECURITY_LIMITS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File exceeds maximum size of ${SECURITY_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  return { valid: true };
}

/**
 * Valida title/nombre
 */
export function validateTitle(title: unknown): {
  valid: boolean;
  sanitized?: string;
  error?: string;
} {
  if (typeof title !== 'string') {
    return { valid: false, error: 'Title must be a string' };
  }

  const sanitized = sanitizeString(title, SECURITY_LIMITS.MAX_TITLE_LENGTH);

  if (sanitized.length === 0) {
    return { valid: false, error: 'Title cannot be empty' };
  }

  return { valid: true, sanitized };
}

/**
 * Valida UUID (user_id, company_id, etc)
 */
export function validateUUID(uuid: unknown): {
  valid: boolean;
  error?: string;
} {
  if (typeof uuid !== 'string') {
    return { valid: false, error: 'UUID must be a string' };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: 'Invalid UUID format' };
  }

  return { valid: true };
}

/**
 * Valida array de tags
 */
export function validateTags(tags: unknown): {
  valid: boolean;
  sanitized?: string[];
  error?: string;
} {
  if (!Array.isArray(tags)) {
    return { valid: false, error: 'Tags must be an array' };
  }

  if (tags.length > SECURITY_LIMITS.MAX_TAGS_COUNT) {
    return { valid: false, error: `Maximum ${SECURITY_LIMITS.MAX_TAGS_COUNT} tags allowed` };
  }

  const sanitized: string[] = [];

  for (const tag of tags) {
    if (typeof tag !== 'string') {
      return { valid: false, error: 'Each tag must be a string' };
    }

    const sanitizedTag = sanitizeString(tag, SECURITY_LIMITS.MAX_TAG_LENGTH);

    if (sanitizedTag.length > 0) {
      sanitized.push(sanitizedTag);
    }
  }

  return { valid: true, sanitized };
}

/**
 * Valida metadata JSON
 */
export function validateMetadata(metadata: unknown): {
  valid: boolean;
  sanitized?: Record<string, unknown>;
  error?: string;
} {
  if (typeof metadata !== 'object' || metadata === null) {
    return { valid: false, error: 'Metadata must be an object' };
  }

  // Verificar tamaño del JSON serializado
  const serialized = JSON.stringify(metadata);

  if (serialized.length > SECURITY_LIMITS.MAX_METADATA_SIZE) {
    return { valid: false, error: 'Metadata exceeds maximum size' };
  }

  // Sanitizar recursivamente
  const sanitized = JSON.parse(serialized); // Re-parse para asegurar JSON válido

  return { valid: true, sanitized };
}

/**
 * Valida request completo de generación de documento
 */
export interface GenerateDocumentRequest {
  template: string;
  variables: Record<string, string>;
  title?: string;
  companyId?: string;
}

export function validateGenerateRequest(body: unknown): {
  valid: boolean;
  sanitized?: GenerateDocumentRequest;
  error?: string;
} {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'Request body must be an object' };
  }

  const req = body as any;

  // Validar template
  if (!req.template || typeof req.template !== 'string') {
    return { valid: false, error: 'Template is required and must be a string' };
  }

  // Validar variables
  if (!req.variables || typeof req.variables !== 'object') {
    return { valid: false, error: 'Variables are required and must be an object' };
  }

  const sanitizedVariables: Record<string, string> = {};

  for (const [key, value] of Object.entries(req.variables)) {
    if (typeof value !== 'string') {
      return { valid: false, error: `Variable ${key} must be a string` };
    }

    sanitizedVariables[key] = sanitizeString(value as string, 5000);
  }

  const result: GenerateDocumentRequest = {
    template: sanitizeString(req.template, 100),
    variables: sanitizedVariables,
  };

  // Validar title opcional
  if (req.title) {
    const titleValidation = validateTitle(req.title);
    if (!titleValidation.valid) {
      return { valid: false, error: titleValidation.error };
    }
    result.title = titleValidation.sanitized;
  }

  // Validar companyId opcional
  if (req.companyId) {
    const uuidValidation = validateUUID(req.companyId);
    if (!uuidValidation.valid) {
      return { valid: false, error: 'Invalid company ID format' };
    }
    result.companyId = req.companyId;
  }

  return { valid: true, sanitized: result };
}
