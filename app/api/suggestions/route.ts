// ===========================================
// LUUC.AI - AI Suggestions API
// ===========================================
// Generates contextual suggestions after document
// generation or analysis. Called in parallel with
// main operations for non-blocking UX.
// ===========================================

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateSuggestions } from "@/lib/suggestions";
import { withRateLimit } from "@/lib/api-middleware";
import type { ApiResponse } from "@/types";
import type {
  SuggestionsRequest,
  SuggestionsResponse,
  AISuggestion,
} from "@/types/suggestions";
import { SUGGESTIONS_TIMEOUT_MS } from "@/types/suggestions";

// ===========================================
// VALIDATION
// ===========================================

function validateSuggestionsRequest(
  body: unknown
): { valid: true; data: SuggestionsRequest } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const { context, language } = body as Partial<SuggestionsRequest>;

  if (!context || typeof context !== "object") {
    return { valid: false, error: "Missing context object" };
  }

  if (!context.type || !["generation", "analysis"].includes(context.type)) {
    return { valid: false, error: "Invalid context type" };
  }

  // Validate generation context
  if (context.type === "generation") {
    if (!context.templateSlug || typeof context.templateSlug !== "string") {
      return { valid: false, error: "Missing templateSlug for generation context" };
    }
    if (!context.documentContent || typeof context.documentContent !== "string") {
      return { valid: false, error: "Missing documentContent for generation context" };
    }
  }

  // Validate analysis context
  if (context.type === "analysis") {
    if (!context.filename || typeof context.filename !== "string") {
      return { valid: false, error: "Missing filename for analysis context" };
    }
    if (typeof context.riskScore !== "number") {
      return { valid: false, error: "Missing riskScore for analysis context" };
    }
  }

  // Validate language
  const validLanguages = ["es", "en", "pt", "fr", "de"];
  const lang = language && validLanguages.includes(language) ? language : "es";

  return {
    valid: true,
    data: {
      context,
      language: lang,
    } as SuggestionsRequest,
  };
}

// ===========================================
// HANDLER
// ===========================================

async function handler(
  request: NextRequest
): Promise<NextResponse<ApiResponse<SuggestionsResponse>>> {
  try {
    // Authentication check
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiResponse<SuggestionsResponse>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validation = validateSuggestionsRequest(body);

    if (!validation.valid) {
      return NextResponse.json<ApiResponse<SuggestionsResponse>>(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { context, language } = validation.data;

    // Generate suggestions with timeout
    const timeoutMs = SUGGESTIONS_TIMEOUT_MS || 15000;
    let suggestions: AISuggestion[] = [];

    try {
      const suggestionsPromise = generateSuggestions(context, language);
      const timeoutPromise = new Promise<AISuggestion[]>((_, reject) =>
        setTimeout(() => reject(new Error("Suggestions timeout")), timeoutMs)
      );

      suggestions = await Promise.race([suggestionsPromise, timeoutPromise]);
    } catch (error) {
      // Log but don't fail - suggestions are optional
      console.warn("[Suggestions API] Generation failed or timed out:", error);
      suggestions = [];
    }

    // Return response
    const response: SuggestionsResponse = {
      suggestions,
      generatedAt: new Date().toISOString(),
      contextType: context.type,
    };

    return NextResponse.json<ApiResponse<SuggestionsResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("[Suggestions API] Unexpected error:", error);

    // Return empty suggestions on error (graceful degradation)
    return NextResponse.json<ApiResponse<SuggestionsResponse>>({
      success: true,
      data: {
        suggestions: [],
        generatedAt: new Date().toISOString(),
        contextType: "generation",
      },
    });
  }
}

// Export with rate limiting (shares generate limit)
export const POST = withRateLimit(handler, "generate");
