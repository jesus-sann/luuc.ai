"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lightbulb,
  FileText,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  AISuggestion,
  SuggestionType,
  SuggestionPriority,
} from "@/types/suggestions";

// ===========================================
// TYPES
// ===========================================

interface SuggestionsPanelProps {
  suggestions: AISuggestion[];
  isLoading: boolean;
  onSuggestionClick?: (suggestion: AISuggestion) => void;
  className?: string;
  defaultExpanded?: boolean;
  locale?: "es" | "en";
}

// ===========================================
// TRANSLATIONS
// ===========================================

const translations = {
  es: {
    title: "Sugerencias de la IA",
    loading: "Generando sugerencias...",
    empty: "No hay sugerencias adicionales",
    createDocument: "Crear documento",
    viewMore: "Ver más",
    collapse: "Colapsar",
    expand: "Expandir",
    priority: {
      high: "Alta prioridad",
      medium: "Prioridad media",
      low: "Sugerencia",
    },
    types: {
      improvement: "Mejora",
      missing_clause: "Cláusula faltante",
      related_template: "Documento relacionado",
      follow_up_action: "Siguiente paso",
      risk_mitigation: "Mitigación de riesgo",
    },
  },
  en: {
    title: "AI Suggestions",
    loading: "Generating suggestions...",
    empty: "No additional suggestions",
    createDocument: "Create document",
    viewMore: "View more",
    collapse: "Collapse",
    expand: "Expand",
    priority: {
      high: "High priority",
      medium: "Medium priority",
      low: "Suggestion",
    },
    types: {
      improvement: "Improvement",
      missing_clause: "Missing clause",
      related_template: "Related document",
      follow_up_action: "Next step",
      risk_mitigation: "Risk mitigation",
    },
  },
};

// ===========================================
// HELPERS
// ===========================================

const getPriorityColor = (priority: SuggestionPriority) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
    case "low":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
  }
};

const getTypeIcon = (type: SuggestionType) => {
  switch (type) {
    case "improvement":
      return Lightbulb;
    case "missing_clause":
      return AlertTriangle;
    case "related_template":
      return FileText;
    case "follow_up_action":
      return ArrowRight;
    case "risk_mitigation":
      return AlertTriangle;
    default:
      return Sparkles;
  }
};

// ===========================================
// SUGGESTION ITEM COMPONENT
// ===========================================

interface SuggestionItemProps {
  suggestion: AISuggestion;
  onClick?: () => void;
  locale: "es" | "en";
}

function SuggestionItem({ suggestion, onClick, locale }: SuggestionItemProps) {
  const t = translations[locale];
  const Icon = getTypeIcon(suggestion.type);
  const hasAction = suggestion.action?.type === "create_template";

  return (
    <button
      onClick={onClick}
      disabled={!hasAction}
      className={cn(
        "w-full text-left rounded-lg border p-4 transition-all",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        hasAction
          ? "cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
          : "cursor-default",
        "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 rounded-full p-2",
            suggestion.priority === "high"
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : suggestion.priority === "medium"
                ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                getPriorityColor(suggestion.priority)
              )}
            >
              {t.priority[suggestion.priority]}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.types[suggestion.type]}
            </span>
          </div>
          <h4 className="font-medium text-slate-900 dark:text-white text-sm">
            {suggestion.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
            {suggestion.description}
          </p>

          {/* Action button */}
          {hasAction && (
            <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium">
              <FileText className="h-3 w-3 mr-1" />
              {t.createDocument}
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ===========================================
// LOADING SKELETON
// ===========================================

function SuggestionsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 dark:border-slate-700 p-4"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===========================================
// MAIN COMPONENT
// ===========================================

export function SuggestionsPanel({
  suggestions,
  isLoading,
  onSuggestionClick,
  className,
  defaultExpanded = true,
  locale = "es",
}: SuggestionsPanelProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const t = translations[locale];

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
      return;
    }

    // Default action handling
    if (suggestion.action?.type === "create_template" && suggestion.action.templateSlug) {
      router.push(`/dashboard/crear/${suggestion.action.templateSlug}`);
    } else if (suggestion.action?.type === "navigate" && suggestion.action.href) {
      router.push(suggestion.action.href);
    }
  };

  // Don't render if no suggestions and not loading
  if (!isLoading && suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50",
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-t-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <span className="font-medium text-slate-900 dark:text-white">
            {t.title}
          </span>
          {!isLoading && suggestions.length > 0 && (
            <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
              {suggestions.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          {isLoading ? (
            <SuggestionsSkeleton />
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                locale={locale}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              {t.empty}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SuggestionsPanel;
