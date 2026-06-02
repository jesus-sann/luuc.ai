// ===========================================
// LUUC.AI - Verify Invitation API
// ===========================================
// Verify invitation token and return details
// ===========================================

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getInvitationByToken } from "@/lib/invitations";
import { withRateLimit } from "@/lib/api-middleware";
import type { ApiResponse } from "@/types";

async function handler(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Token requerido" },
        { status: 400 }
      );
    }

    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Invitación inválida o expirada" },
        { status: 404 }
      );
    }

    // Return invitation details (without sensitive data)
    return NextResponse.json<ApiResponse<{
      email: string;
      company_name: string;
      role: string;
      invited_by_name: string;
      expires_at: string;
    }>>({
      success: true,
      data: {
        email: invitation.email,
        company_name: invitation.company_name || "Empresa",
        role: invitation.role,
        invited_by_name: invitation.invited_by_name || "Un administrador",
        expires_at: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error("[Verify Invitation API] Error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error al verificar invitación" },
      { status: 500 }
    );
  }
}

// Apply rate limiting — this endpoint is public (no auth required) so it is
// particularly susceptible to token enumeration attacks.
export const GET = withRateLimit(handler, "auth");
