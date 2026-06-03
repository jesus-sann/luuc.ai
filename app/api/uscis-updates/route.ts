export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { generateText } from "@/lib/ai-provider";

const RATE_LIMIT_HOURS = 1;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!user.company_id) {
      return NextResponse.json({ success: true, data: { updates: [], total: 0, last_refreshed: null } });
    }

    const { data, error, count } = await supabaseAdmin
      .from("uscis_updates")
      .select("*", { count: "exact" })
      .eq("company_id", user.company_id)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Last refreshed = most recent created_at
    const last_refreshed = data && data.length > 0 ? data[0].created_at : null;

    return NextResponse.json({
      success: true,
      data: { updates: data ?? [], total: count ?? 0, last_refreshed },
    });
  } catch (err) {
    console.error("GET /api/uscis-updates error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!user.company_id) {
      return NextResponse.json({ success: false, error: "No company associated" }, { status: 400 });
    }

    // Rate limit: 1 refresh per RATE_LIMIT_HOURS per company
    const cutoff = new Date(Date.now() - RATE_LIMIT_HOURS * 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabaseAdmin
      .from("uscis_updates")
      .select("id", { count: "exact", head: true })
      .eq("company_id", user.company_id)
      .gte("created_at", cutoff);

    if (recentCount && recentCount > 0) {
      return NextResponse.json(
        { success: false, error: "Updates were already refreshed in the last hour. Please try again later." },
        { status: 429 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const systemPrompt =
      "You are an immigration law research assistant specializing in USCIS policy. " +
      "Return ONLY valid JSON — no markdown, no code fences, no commentary.";

    const userPrompt =
      `Today is ${today}. List 8 important and recent USCIS updates, policy changes, fee changes, ` +
      `form revisions, or processing time alerts that US immigration attorneys should know about ` +
      `from the past 90 days. For each update provide: ` +
      `title (concise, under 80 chars), summary (2-3 sentences of practical information), ` +
      `category (exactly one of: Policy Change / Fee Update / Form Revision / Processing Time / Alert), ` +
      `effective_date (ISO date YYYY-MM-DD if known, null if not), ` +
      `source_url (uscis.gov URL if applicable, null if not). ` +
      `Respond with a JSON array of 8 objects only.`;

    const aiResponse = await generateText(systemPrompt, userPrompt, 2048);

    let updates: Array<{
      title: string;
      summary: string;
      category: string;
      effective_date: string | null;
      source_url: string | null;
    }>;

    try {
      const cleaned = aiResponse.text.replace(/```json|```/g, "").trim();
      updates = JSON.parse(cleaned);
      if (!Array.isArray(updates)) throw new Error("Not an array");
    } catch {
      console.error("Failed to parse AI response:", aiResponse.text.slice(0, 500));
      return NextResponse.json(
        { success: false, error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    const VALID_CATEGORIES = ["Policy Change", "Fee Update", "Form Revision", "Processing Time", "Alert"];
    const rows = updates
      .filter((u) => u.title && u.summary)
      .map((u) => ({
        company_id: user.company_id,
        title: String(u.title).slice(0, 200),
        summary: String(u.summary).slice(0, 1000),
        category: VALID_CATEGORIES.includes(u.category) ? u.category : "Alert",
        effective_date: u.effective_date || null,
        source_url: u.source_url || null,
        is_pinned: false,
      }));

    const { error: insertError } = await supabaseAdmin
      .from("uscis_updates")
      .insert(rows);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, data: { count: rows.length } });
  } catch (err) {
    console.error("POST /api/uscis-updates error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
