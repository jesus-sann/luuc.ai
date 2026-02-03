export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { withRateLimit } from "@/lib/api-middleware";

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

    // Get analyses count from users table
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
        if (log.action_type === "generate" || log.action_type === "generate_custom") {
          thisMonthDocuments++;
        } else if (log.action_type === "analyze") {
          thisMonthAnalyses++;
        }
      }
    }

    // Average time saved estimate (5 min per doc, 15 min per analysis)
    const timeSavedMinutes = documentsGenerated * 5 + analysesCompleted * 15;

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
