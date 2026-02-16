// ===========================================
// LUUC.AI - useSuggestions Hook
// ===========================================
// Fetches AI suggestions for documents and analyses
// Handles loading states and errors silently
// ===========================================

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  AISuggestion,
  SuggestionContext,
  SuggestionsResponse,
  GenerationSuggestionContext,
  AnalysisSuggestionContext,
} from "@/types/suggestions";
import type { AnalysisResponse } from "@/types";

// ===========================================
// TYPES
// ===========================================

interface UseSuggestionsOptions {
  /** Whether to fetch suggestions automatically */
  enabled?: boolean;
  /** Language for suggestions */
  language?: "es" | "en" | "pt" | "fr" | "de";
}

interface UseSuggestionsReturn {
  suggestions: AISuggestion[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// ===========================================
// FETCH FUNCTION
// ===========================================

const SUGGESTIONS_FETCH_TIMEOUT_MS = 20000; // 20 second timeout

async function fetchSuggestions(
  context: SuggestionContext,
  language: string
): Promise<AISuggestion[]> {
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUGGESTIONS_FETCH_TIMEOUT_MS);

    const response = await fetch("/api/suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ context, language }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn("[useSuggestions] API returned non-OK status:", response.status);
      return [];
    }

    const data = await response.json();

    if (data.success && data.data?.suggestions) {
      return data.data.suggestions;
    }

    return [];
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("[useSuggestions] Request timed out after", SUGGESTIONS_FETCH_TIMEOUT_MS, "ms");
    } else {
      console.warn("[useSuggestions] Fetch failed:", error);
    }
    return [];
  }
}

// ===========================================
// MAIN HOOK
// ===========================================

/**
 * Generic hook for fetching suggestions
 */
export function useSuggestions(
  context: SuggestionContext | null,
  options: UseSuggestionsOptions = {}
): UseSuggestionsReturn {
  const { enabled = true, language = "es" } = options;

  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!context || !enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchSuggestions(context, language);
      setSuggestions(result);
    } catch (err) {
      // Silent error handling - suggestions are optional
      console.warn("[useSuggestions] Error:", err);
      setError("Failed to load suggestions");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [context, enabled, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    suggestions,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ===========================================
// SPECIALIZED HOOKS
// ===========================================

/**
 * Hook for document generation suggestions
 */
export function useGenerationSuggestions(
  templateSlug: string | null,
  documentContent: string | null,
  variables?: Record<string, string>,
  options: UseSuggestionsOptions = {}
): UseSuggestionsReturn {
  const context: GenerationSuggestionContext | null =
    templateSlug && documentContent
      ? {
          type: "generation",
          templateSlug,
          documentContent,
          variables,
        }
      : null;

  return useSuggestions(context, options);
}

/**
 * Hook for document analysis suggestions
 */
export function useAnalysisSuggestions(
  filename: string | null,
  analysisResult: AnalysisResponse | null,
  options: UseSuggestionsOptions = {}
): UseSuggestionsReturn {
  const context: AnalysisSuggestionContext | null =
    filename && analysisResult
      ? {
          type: "analysis",
          filename,
          riskScore: analysisResult.score,
          summary: analysisResult.resumen,
          risks: analysisResult.riesgos || [],
          missingClauses: analysisResult.clausulas_faltantes || [],
        }
      : null;

  return useSuggestions(context, options);
}

export default useSuggestions;
