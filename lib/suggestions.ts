// ===========================================
// LUUC.AI - AI Suggestions Service
// ===========================================
// Generates contextual AI suggestions after
// document generation and analysis
// ===========================================

import { generateTextSimple } from "./ai-provider";
import type {
  AISuggestion,
  SuggestionContext,
  GenerationSuggestionContext,
  AnalysisSuggestionContext,
} from "@/types/suggestions";
import { MAX_SUGGESTIONS } from "@/types/suggestions";

// ===========================================
// LANGUAGE MAPPINGS
// ===========================================

const LANGUAGE_NAMES: Record<string, string> = {
  es: "español",
  en: "English",
  pt: "português",
  fr: "français",
  de: "Deutsch",
};

// Template descriptions for the AI
const TEMPLATE_DESCRIPTIONS: Record<string, { es: string; en: string }> = {
  nda: {
    es: "Acuerdo de Confidencialidad (NDA)",
    en: "Non-Disclosure Agreement (NDA)",
  },
  contrato: {
    es: "Contrato General",
    en: "General Contract",
  },
  contrato_servicios: {
    es: "Contrato de Prestación de Servicios",
    en: "Service Agreement",
  },
  carta_correo: {
    es: "Carta o Comunicación Formal",
    en: "Formal Letter/Communication",
  },
  carta_terminacion: {
    es: "Carta de Terminación",
    en: "Termination Letter",
  },
  acta_reunion: {
    es: "Acta de Reunión",
    en: "Meeting Minutes",
  },
  politica_interna: {
    es: "Política Interna de Empresa",
    en: "Internal Company Policy",
  },
  performance_report: {
    es: "Informe de Desempeño",
    en: "Performance Report",
  },
};

// ===========================================
// PROMPT BUILDERS
// ===========================================

function buildGenerationSuggestionsPrompt(
  context: GenerationSuggestionContext,
  language: string
): { system: string; user: string } {
  const locale = LANGUAGE_NAMES[language] || "español";
  const templateName =
    TEMPLATE_DESCRIPTIONS[context.templateSlug]?.[
      language === "en" ? "en" : "es"
    ] || context.templateSlug;

  // Build available templates list
  const availableTemplates = Object.entries(TEMPLATE_DESCRIPTIONS)
    .filter(([slug]) => slug !== context.templateSlug)
    .map(([slug, desc]) => `- ${slug}: ${desc[language === "en" ? "en" : "es"]}`)
    .join("\n");

  const system = `You are a legal assistant providing actionable suggestions to improve legal documents.
IMPORTANT: Respond ONLY in ${locale}. All text must be in ${locale}.
Generate 3-5 contextual suggestions in valid JSON format.
Focus on practical, actionable improvements that add legal value.`;

  const user = `A user just generated a "${templateName}" document.

Document excerpt (first 2000 characters):
"""
${context.documentContent?.substring(0, 2000) || "[No content available]"}
"""

Variables used: ${JSON.stringify(context.variables || {})}

Available templates for related documents:
${availableTemplates}

Provide suggestions for:
1. Improvements to strengthen this document (missing clauses, legal protections)
2. Related documents they should consider creating
3. Important legal considerations for this type of document

Respond with valid JSON only:
{
  "suggestions": [
    {
      "type": "improvement|missing_clause|related_template|follow_up_action",
      "priority": "high|medium|low",
      "title": "Short actionable title (max 60 chars)",
      "description": "Clear explanation of why this matters and what to do (max 200 chars)",
      "action": {
        "type": "create_template",
        "templateSlug": "slug_from_available_templates"
      }
    }
  ]
}

Rules:
- Only use templateSlug values from the available templates list
- For improvements, omit the action field
- Priority: high = legally critical, medium = recommended, low = nice to have
- Be specific and practical, not generic`;

  return { system, user };
}

function buildAnalysisSuggestionsPrompt(
  context: AnalysisSuggestionContext,
  language: string
): { system: string; user: string } {
  const locale = LANGUAGE_NAMES[language] || "español";

  // Build available templates list
  const availableTemplates = Object.entries(TEMPLATE_DESCRIPTIONS)
    .map(([slug, desc]) => `- ${slug}: ${desc[language === "en" ? "en" : "es"]}`)
    .join("\n");

  const system = `You are a legal assistant providing actionable next steps after document analysis.
IMPORTANT: Respond ONLY in ${locale}. All text must be in ${locale}.
Generate 3-5 contextual suggestions based on the analysis results.
Focus on risk mitigation and practical follow-up actions.`;

  const topRisks = context.risks.slice(0, 3);
  const topMissingClauses = context.missingClauses.slice(0, 5);

  const user = `A user analyzed a document "${context.filename}" and received these results:

Risk Score: ${context.riskScore}/10
Summary: ${context.summary}

Top Risks Found:
${topRisks.map((r) => `- [${r.nivel}] ${r.descripcion} (Clause: ${r.clausula})`).join("\n") || "None"}

Missing Clauses:
${topMissingClauses.map((c) => `- ${c}`).join("\n") || "None"}

Available templates for follow-up documents:
${availableTemplates}

Provide suggestions for:
1. Risk mitigation actions for critical/high risks
2. Follow-up documents to create (amendments, addendums, clarifications)
3. Immediate next steps the user should take

Respond with valid JSON only:
{
  "suggestions": [
    {
      "type": "risk_mitigation|follow_up_action|related_template",
      "priority": "high|medium|low",
      "title": "Short actionable title (max 60 chars)",
      "description": "Clear explanation of why this matters and what to do (max 200 chars)",
      "action": {
        "type": "create_template",
        "templateSlug": "slug_from_available_templates"
      }
    }
  ]
}

Rules:
- Only use templateSlug values from the available templates list
- For follow_up_action without a document, use action.type = "navigate" with href = "/dashboard"
- Match priority to risk level: CRITICO/ALTO = high, MEDIO = medium, BAJO = low
- Be specific about which risk each suggestion addresses`;

  return { system, user };
}

// ===========================================
// JSON PARSING WITH FALLBACK
// ===========================================

function parseAISuggestionsResponse(text: string): AISuggestion[] {
  try {
    // Try direct parse first
    const parsed = JSON.parse(text);
    if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
      return addIdsToSuggestions(parsed.suggestions);
    }
  } catch {
    // Try regex extraction
    const jsonMatch = text.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          return addIdsToSuggestions(parsed.suggestions);
        }
      } catch {
        console.error("[Suggestions] Failed to parse extracted JSON");
      }
    }
  }

  console.warn("[Suggestions] Could not parse AI response, returning empty array");
  return [];
}

function addIdsToSuggestions(
  suggestions: Omit<AISuggestion, "id">[]
): AISuggestion[] {
  return suggestions.slice(0, MAX_SUGGESTIONS || 5).map((s) => ({
    ...s,
    id: crypto.randomUUID(),
  }));
}

// ===========================================
// MAIN GENERATION FUNCTIONS
// ===========================================

/**
 * Generate suggestions for a newly created document
 */
export async function generateDocumentSuggestions(
  context: GenerationSuggestionContext,
  language: string
): Promise<AISuggestion[]> {
  const { system, user } = buildGenerationSuggestionsPrompt(context, language);

  try {
    const response = await generateTextSimple(system, user, 1024);
    return parseAISuggestionsResponse(response);
  } catch (error) {
    console.error("[Suggestions] Generation failed:", error);
    return [];
  }
}

/**
 * Generate suggestions based on document analysis results
 */
export async function generateAnalysisSuggestions(
  context: AnalysisSuggestionContext,
  language: string
): Promise<AISuggestion[]> {
  const { system, user } = buildAnalysisSuggestionsPrompt(context, language);

  try {
    const response = await generateTextSimple(system, user, 1024);
    return parseAISuggestionsResponse(response);
  } catch (error) {
    console.error("[Suggestions] Analysis suggestions failed:", error);
    return [];
  }
}

/**
 * Main entry point - routes to correct generator based on context type
 */
export async function generateSuggestions(
  context: SuggestionContext,
  language: string
): Promise<AISuggestion[]> {
  if (context.type === "generation") {
    return generateDocumentSuggestions(context, language);
  } else {
    return generateAnalysisSuggestions(context, language);
  }
}
