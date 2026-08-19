export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { withRateLimit } from "@/lib/api-middleware";

// Claude Sonnet pricing (USD per million tokens) — update when pricing changes
const INPUT_COST_PER_M = 3.0;
const OUTPUT_COST_PER_M = 15.0;
// We store input+output combined; estimate a 60/40 input/output split.
const BLENDED_COST_PER_M = INPUT_COST_PER_M * 0.6 + OUTPUT_COST_PER_M * 0.4;

function tokensToCost(tokens: number): number {
  return (tokens / 1_000_000) * BLENDED_COST_PER_M;
}

async function handler(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    // Allow owner/admin to see full company view; members see only their own.
    const isAdmin = user.role === "owner" || user.role === "admin";
    const companyId = user.company_id;

    // ── Base query ──────────────────────────────────────────────────────────
    let baseQuery = supabaseAdmin
      .from("usage_logs")
      .select("action_type, tokens_used, model_used, created_at, user_id");

    if (isAdmin && companyId) {
      // Company-wide view: all users in the same company.
      // We join via the users table to scope by company.
      const { data: companyUsers } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("company_id", companyId);

      const userIds = (companyUsers || []).map((u) => u.id);
      if (userIds.length) {
        baseQuery = baseQuery.in("user_id", userIds);
      } else {
        baseQuery = baseQuery.eq("user_id", user.id);
      }
    } else {
      baseQuery = baseQuery.eq("user_id", user.id);
    }

    const { data: logs, error } = await baseQuery.order("created_at", { ascending: false });

    if (error) throw error;

    const allLogs = logs || [];

    // ── Lifetime totals ─────────────────────────────────────────────────────
    const totalTokens = allLogs.reduce((s, l) => s + (l.tokens_used || 0), 0);
    const totalCost = tokensToCost(totalTokens);

    // ── This month ──────────────────────────────────────────────────────────
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthLogs = allLogs.filter((l) => new Date(l.created_at) >= startOfMonth);
    const monthTokens = monthLogs.reduce((s, l) => s + (l.tokens_used || 0), 0);
    const monthCost = tokensToCost(monthTokens);

    // ── By action type ──────────────────────────────────────────────────────
    const byAction: Record<string, { tokens: number; count: number }> = {};
    for (const log of allLogs) {
      const key = log.action_type;
      if (!byAction[key]) byAction[key] = { tokens: 0, count: 0 };
      byAction[key].tokens += log.tokens_used || 0;
      byAction[key].count += 1;
    }

    // ── Daily usage — last 30 days ──────────────────────────────────────────
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyMap: Record<string, number> = {};
    for (const log of allLogs) {
      const d = new Date(log.created_at);
      if (d < thirtyDaysAgo) continue;
      const day = d.toISOString().slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + (log.tokens_used || 0);
    }
    const dailyUsage = Object.entries(dailyMap)
      .map(([date, tokens]) => ({ date, tokens, cost: tokensToCost(tokens) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ── Recent calls (last 20 with non-zero tokens) ──────────────────────────
    const recentCalls = allLogs
      .filter((l) => (l.tokens_used || 0) > 0)
      .slice(0, 20)
      .map((l) => ({
        date: l.created_at,
        action: l.action_type,
        tokens: l.tokens_used || 0,
        model: l.model_used || "claude-sonnet",
        cost: tokensToCost(l.tokens_used || 0),
      }));

    return NextResponse.json({
      success: true,
      data: {
        lifetime: { tokens: totalTokens, cost: totalCost },
        thisMonth: { tokens: monthTokens, cost: monthCost },
        byAction,
        dailyUsage,
        recentCalls,
        isCompanyView: isAdmin && !!companyId,
        pricingNote: `Estimado a USD $${BLENDED_COST_PER_M}/M tokens (mezcla 60% input / 40% output, Claude Sonnet)`,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/usage/tokens:", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

export const GET = withRateLimit(handler, "read");
