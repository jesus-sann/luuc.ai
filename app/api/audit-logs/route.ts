export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { withRateLimit } from "@/lib/api-middleware";

/**
 * GET /api/audit-logs
 * Returns paginated audit logs for the current user's company.
 * Requires admin or owner role.
 *
 * Query params:
 *   page    - page number (default 1)
 *   limit   - records per page (default 50, max 100)
 *   userId  - filter by user ID (optional)
 *   from    - ISO date string (optional)
 *   to      - ISO date string (optional)
 */
async function getHandler(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    if (user.role !== "admin" && user.role !== "owner") {
      return NextResponse.json(
        { success: false, error: "Acceso restringido a administradores" },
        { status: 403 }
      );
    }

    if (!user.company_id) {
      return NextResponse.json({
        success: true,
        data: { logs: [], total: 0, page: 1, hasMore: false },
      });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const userIdFilter = searchParams.get("userId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("audit_logs")
      .select(
        `
        id,
        user_id,
        action,
        resource_type,
        resource_id,
        metadata,
        ip_address,
        created_at,
        users:user_id (
          name,
          email,
          role
        )
        `,
        { count: "exact" }
      )
      .eq("company_id", user.company_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (userIdFilter) {
      query = query.eq("user_id", userIdFilter);
    }
    if (from) {
      query = query.gte("created_at", from);
    }
    if (to) {
      // add end-of-day to make the "to" date inclusive
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      query = query.lte("created_at", toDate.toISOString());
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching audit logs:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener registros de actividad" },
        { status: 500 }
      );
    }

    const total = count ?? 0;
    return NextResponse.json({
      success: true,
      data: {
        logs: data ?? [],
        total,
        page,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/audit-logs:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(getHandler, "read");
