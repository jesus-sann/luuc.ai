// ===========================================
// LUUC.AI - AI Suggestions Types
// ===========================================
// Type definitions for AI-powered suggestions
// that appear after document generation and analysis
// ===========================================

import type { DocumentType } from "./index";

// ===========================================
// SUGGESTION TYPES
// ===========================================

/**
 * Types of suggestions the AI can provide
 */
export type SuggestionType =
  | "improvement" // Improve the current document
  | "missing_clause" // Add missing clause
  | "related_template" // Create a related document
  | "follow_up_action" // Next step to take
  | "risk_mitigation"; // Address a specific risk

/**
 * Priority levels for suggestions
 */
export type SuggestionPriority = "high" | "medium" | "low";

/**
 * Actionable link for suggestions
 */
export interface SuggestionAction {
  type: "create_template" | "navigate";
  /** Template slug for create_template action */
  templateSlug?: DocumentType;
  /** Pre-filled variables for template */
  prefillVariables?: Record<string, string>;
  /** URL for navigate action */
  href?: string;
}

/**
 * Individual AI suggestion
 */
export interface AISuggestion {
  /** Unique identifier */
  id: string;
  /** Type of suggestion */
  type: SuggestionType;
  /** Priority level */
  priority: SuggestionPriority;
  /** Short actionable title */
  title: string;
  /** Detailed explanation */
  description: string;
  /** Optional actionable link/trigger */
  action?: SuggestionAction;
}

/**
 * Container for suggestions response
 */
export interface SuggestionsResponse {
  suggestions: AISuggestion[];
  generatedAt: string;
  contextType: "generation" | "analysis";
}

// ===========================================
// REQUEST TYPES
// ===========================================

/**
 * Context for document generation suggestions
 */
export interface GenerationSuggestionContext {
  type: "generation";
  templateSlug: string;
  variables?: Record<string, string>;
  documentContent: string;
}

/**
 * Context for document analysis suggestions
 */
export interface AnalysisSuggestionContext {
  type: "analysis";
  filename: string;
  riskScore: number;
  summary: string;
  risks: Array<{
    nivel: string;
    descripcion: string;
    clausula: string;
    recomendacion: string;
  }>;
  missingClauses: string[];
}

export type SuggestionContext =
  | GenerationSuggestionContext
  | AnalysisSuggestionContext;

/**
 * Request body for /api/suggestions
 */
export interface SuggestionsRequest {
  context: SuggestionContext;
  language: "es" | "en" | "pt" | "fr" | "de";
}

// ===========================================
// CONSTANTS
// ===========================================

export const SUGGESTION_TYPE_LABELS: Record<
  SuggestionType,
  { es: string; en: string }
> = {
  improvement: { es: "Mejora", en: "Improvement" },
  missing_clause: { es: "Cláusula faltante", en: "Missing clause" },
  related_template: { es: "Documento relacionado", en: "Related document" },
  follow_up_action: { es: "Acción de seguimiento", en: "Follow-up action" },
  risk_mitigation: { es: "Mitigación de riesgo", en: "Risk mitigation" },
};

export const SUGGESTION_PRIORITY_LABELS: Record<
  SuggestionPriority,
  { es: string; en: string }
> = {
  high: { es: "Alta prioridad", en: "High priority" },
  medium: { es: "Prioridad media", en: "Medium priority" },
  low: { es: "Sugerencia", en: "Suggestion" },
};

export const MAX_SUGGESTIONS = 5;
export const SUGGESTIONS_TIMEOUT_MS = 15000;
