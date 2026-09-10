export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { withRateLimit } from "@/lib/api-middleware";

// Conservative US immigration paralegal rate ($/hr) used for cost-equivalent estimate.
// Source: BLS OES 2024 median for legal support workers; rounded down for conservatism.
const PARALEGAL_HOURLY_RATE_USD = 65;

// Category grouping for the time-saved breakdown.
const DOC_TYPE_CATEGORY: Record<string, string> = {
  "personal-declaration": "Inmigración",
  "legal-argument": "Inmigración",
  "case-summary": "Inmigración",
  "evidence-summary": "Inmigración",
  "i360-vawa-cover-letter": "Inmigración",
  "i918-u-visa-cover-letter": "Inmigración",
  "i589-cover-letter": "Inmigración",
  "cover-letter-uscis": "Inmigración",
  "cover-letter-consular": "Inmigración",
  "i751-cover-letter": "Inmigración",
  "i485-245i-cover-letter": "Inmigración",
  "i130-cover-letter": "Inmigración",
  "i485-cover-letter": "Inmigración",
  "i129f-cover-letter": "Inmigración",
  "i765-cover-letter": "Inmigración",
  "i131-cover-letter": "Inmigración",
  "i539-cover-letter": "Inmigración",
  "n400-cover-letter": "Inmigración",
  "custom-immigration-cover-letter": "Inmigración",
  "certified-translation": "Traducciones",
  nda: "Contratos",
  contrato: "Contratos",
  carta_correo: "Comunicaciones",
  acta_reunion: "Comunicaciones",
  politica_interna: "Políticas",
  performance_report: "Reportes",
};

// Minutes of human work saved per document type.
// Source: "Estimación de Tiempos de Elaboración Documental" (Sep 2026),
// declared times from the USCIS paralegal team. Uses upload-mode midpoints
// from Table 3 and the blended PL1/PL2 estimate for cover letters.
// These are estimates ("orden de magnitud"), not measured values.
const MINUTES_SAVED_BY_DOC_TYPE: Record<string, number> = {
  "personal-declaration": 52,
  "legal-argument": 38,
  "case-summary": 35,
  "evidence-summary": 22,
  "i360-vawa-cover-letter": 20,
  "i918-u-visa-cover-letter": 20,
  "i589-cover-letter": 20,
  "cover-letter-uscis": 25,
  "cover-letter-consular": 25,
  "i751-cover-letter": 25,
  "i485-245i-cover-letter": 25,
  "i130-cover-letter": 25,
  "i485-cover-letter": 25,
  "i129f-cover-letter": 25,
  "i765-cover-letter": 25,
  "i131-cover-letter": 25,
  "i539-cover-letter": 25,
  "n400-cover-letter": 25,
  "custom-immigration-cover-letter": 25,
  "certified-translation": 30,
  nda: 20,
  contrato: 30,
  carta_correo: 15,
  acta_reunion: 15,
  politica_interna: 25,
  performance_report: 20,
};

const DEFAULT_DOC_MINUTES_SAVED = 25;
const ANALYSIS_MINUTES_SAVED = 45;

const DOC_TYPE_LABELS: Record<string, string> = {
  generate: "Documento",
  custom_generate: "Documento personalizado",
  analyze: "Análisis de riesgos",
  "personal-declaration": "Declaración personal",
  "legal-argument": "Argumento legal",
  "legal-argument-brief": "Argumento legal",
  "evidence-summary": "Resumen de evidencia",
  "case-summary": "Resumen del caso",
  "cover-letter-uscis": "Cover letter USCIS",
  "cover-letter-consular": "Cover letter consular",
  "i360-vawa-cover-letter": "Cover letter VAWA",
  "i918-u-visa-cover-letter": "Cover letter U-Visa",
  "i589-cover-letter": "Cover letter I-589",
  "i130-cover-letter": "Cover letter I-130",
  "i485-cover-letter": "Cover letter I-485",
  "i751-cover-letter": "Cover letter I-751",
  "i129f-cover-letter": "Cover letter I-129F",
  "i765-cover-letter": "Cover letter I-765",
  "i131-cover-letter": "Cover letter I-131",
  "i539-cover-letter": "Cover letter I-539",
  "n400-cover-letter": "Cover letter N-400",
  "i485-245i-cover-letter": "Cover letter I-485 (245i)",
  "custom-immigration-cover-letter": "Cover letter (personalizada)",
  "certified-translation": "Traducción certificada",
  nda: "NDA",
  contrato: "Contrato",
  carta_correo: "Carta / Correo",
  acta_reunion: "Acta de reunión",
  politica_interna: "Política interna",
  performance_report: "Reporte de desempeño",
};

function labelForDocType(slug: string): string {
  if (!slug) return "Documento";
  // custom_contrato, custom_nda, etc.
  if (slug.startsWith("custom_")) {
    const base = slug.replace("custom_", "");
    return DOC_TYPE_LABELS[base] ? `${DOC_TYPE_LABELS[base]} (personalizado)` : "Documento personalizado";
  }
  return DOC_TYPE_LABELS[slug] || slug;
}

async function handler(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const companyId = user.company_id;

    // ── Company-wide document counts ────────────────────────────────────────
    // Prefer company scope so stakeholders see team totals, not just one user.
    let docsQuery = supabase
      .from("documents")
      .select("id, title, doc_type, created_at, user_id", { count: "exact" });

    if (companyId) {
      docsQuery = docsQuery.eq("company_id", companyId);
    } else {
      docsQuery = docsQuery.eq("user_id", user.id);
    }

    const { data: allDocs, count: totalDocsCount } = await docsQuery.order("created_at", { ascending: false });

    const documentsGenerated = totalDocsCount ?? allDocs?.length ?? 0;

    // ── Analyses count ───────────────────────────────────────────────────────
    let analysesQuery = supabase
      .from("analyses")
      .select("id", { count: "exact" });

    if (companyId) {
      analysesQuery = analysesQuery.eq("company_id", companyId);
    } else {
      analysesQuery = analysesQuery.eq("user_id", user.id);
    }

    const { count: analysesCount } = await analysesQuery;
    const analysesCompleted = analysesCount ?? 0;

    // ── This-month counts ────────────────────────────────────────────────────
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthLabel = now.toLocaleString("es-CO", { month: "long", year: "numeric" });

    const thisMonthDocs = (allDocs || []).filter(
      (d) => new Date(d.created_at) >= startOfMonth
    );
    const thisMonthDocuments = thisMonthDocs.length;

    // ── Time saved calculation ───────────────────────────────────────────────
    const categoryMinutes: Record<string, number> = {};

    let timeSavedMinutes = 0;
    let thisMonthTimeSavedMinutes = 0;

    for (const doc of allDocs || []) {
      const saved = MINUTES_SAVED_BY_DOC_TYPE[doc.doc_type] ?? DEFAULT_DOC_MINUTES_SAVED;
      timeSavedMinutes += saved;

      const category = DOC_TYPE_CATEGORY[doc.doc_type] ?? "Otros";
      categoryMinutes[category] = (categoryMinutes[category] ?? 0) + saved;

      if (new Date(doc.created_at) >= startOfMonth) {
        thisMonthTimeSavedMinutes += saved;
      }
    }

    timeSavedMinutes += analysesCompleted * ANALYSIS_MINUTES_SAVED;

    // Sort categories by minutes saved descending
    const timeSavedByCategory = Object.entries(categoryMinutes)
      .sort((a, b) => b[1] - a[1])
      .map(([category, minutes]) => ({ category, minutes }));

    // Cost equivalent: paralegal hours × rate
    const estimatedCostSavedUSD = Math.round((timeSavedMinutes / 60) * PARALEGAL_HOURLY_RATE_USD);

    // ── Document type breakdown (top 5) ─────────────────────────────────────
    const typeCount: Record<string, number> = {};
    for (const doc of allDocs || []) {
      const label = labelForDocType(doc.doc_type);
      typeCount[label] = (typeCount[label] ?? 0) + 1;
    }
    const topDocTypes = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));

    // ── Recent activity (last 8 docs) ────────────────────────────────────────
    const recentDocs = (allDocs || []).slice(0, 8);
    const recentActivity = recentDocs.map((doc) => ({
      action: "generate",
      title: doc.title || labelForDocType(doc.doc_type),
      docType: labelForDocType(doc.doc_type),
      date: doc.created_at,
      id: doc.id,
    }));

    // ── Unique users (contributors) ──────────────────────────────────────────
    const uniqueUsers = companyId
      ? new Set((allDocs || []).map((d) => d.user_id)).size
      : 1;

    return NextResponse.json({
      success: true,
      data: {
        documentsGenerated,
        analysesCompleted,
        thisMonthDocuments,
        thisMonthAnalyses: 0,
        timeSavedMinutes,
        thisMonthTimeSavedMinutes,
        timeSavedByCategory,
        estimatedCostSavedUSD,
        recentActivity,
        topDocTypes,
        uniqueUsers,
        monthLabel,
        isCompanyScope: !!companyId,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/usage/stats:", error);
    return NextResponse.json(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(handler, "read");
