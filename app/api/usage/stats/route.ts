export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { withRateLimit } from "@/lib/api-middleware";

// Minutes of human work saved per document type.
// Source: "Estimación de Tiempos de Elaboración Documental" (Sep 2026),
// declared times from the USCIS paralegal team. Uses upload-mode midpoints
// from Table 3 and the blended PL1/PL2 estimate for cover letters.
// These are estimates ("orden de magnitud"), not measured values.
const MINUTES_SAVED_BY_DOC_TYPE: Record<string, number> = {
  // Personal declaration: 60-120 min → 29-47 min (upload mode) ≈ 52 min saved
  "personal-declaration": 52,
  // Legal argument / memorando: 60-120 min → 40-64 min ≈ 38 min saved
  "legal-argument": 38,
  // Case summary (similar to legal argument)
  "case-summary": 35,
  // Evidence summary / índice de anexos: 20-30 min → 3-6 min ≈ 22 min saved
  "evidence-summary": 22,
  // Complex / VAWA cover letters: 35-40 min → 20-33 min ≈ 20 min saved
  "i360-vawa-cover-letter": 20,
  "i918-u-visa-cover-letter": 20,
  "i589-cover-letter": 20,
  // Standard USCIS cover letters: blended PL1/PL2 ≈ 25 min saved
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
  // Certified translation — no declared baseline; conservative estimate
  "certified-translation": 30,
  // General legal docs (non-immigration)
  "nda": 20,
  "contrato": 30,
  "carta_correo": 15,
  "acta_reunion": 15,
  "politica_interna": 25,
  "performance_report": 20,
};

const DEFAULT_DOC_MINUTES_SAVED = 25; // fallback for unknown / custom templates
const ANALYSIS_MINUTES_SAVED = 45;    // risk analysis: no prior equivalent; ~45 min manual review

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

    // Lifetime counts from users table
    const documentsGenerated = user.usage_count || 0;

    const { data: userData } = await supabase
      .from("users")
      .select("usage_analyses")
      .eq("id", user.id)
      .single();

    const analysesCompleted = userData?.usage_analyses || 0;

    // This month counts
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthLogs } = await supabase
      .from("usage_logs")
      .select("action_type")
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    let thisMonthDocuments = 0;
    let thisMonthAnalyses = 0;
    if (monthLogs) {
      for (const log of monthLogs) {
        if (log.action_type === "generate" || log.action_type === "custom_generate") {
          thisMonthDocuments++;
        } else if (log.action_type === "analyze") {
          thisMonthAnalyses++;
        }
      }
    }

    // Per-document-type time saved — query generate logs with metadata
    const { data: generateLogs } = await supabase
      .from("usage_logs")
      .select("metadata")
      .eq("user_id", user.id)
      .in("action_type", ["generate", "custom_generate"]);

    let timeSavedMinutes = 0;
    if (generateLogs && generateLogs.length > 0) {
      for (const log of generateLogs) {
        const meta = log.metadata as Record<string, string> | null;
        const docType = meta?.document_type ?? meta?.template ?? "";
        const saved = MINUTES_SAVED_BY_DOC_TYPE[docType] ?? DEFAULT_DOC_MINUTES_SAVED;
        timeSavedMinutes += saved;
      }
    } else {
      // Fallback: no matching logs (empty table or query failed) — use flat estimate from usage_count
      timeSavedMinutes = documentsGenerated * DEFAULT_DOC_MINUTES_SAVED;
    }

    timeSavedMinutes += analysesCompleted * ANALYSIS_MINUTES_SAVED;

    // Recent activity (last 5)
    const { data: recentLogs } = await supabase
      .from("usage_logs")
      .select("action_type, metadata, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const recentActivity = (recentLogs || []).map((log) => ({
      action: log.action_type,
      title: (log.metadata as Record<string, string>)?.document_type || log.action_type,
      date: log.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        documentsGenerated,
        analysesCompleted,
        thisMonthDocuments,
        thisMonthAnalyses,
        timeSavedMinutes,
        recentActivity,
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
