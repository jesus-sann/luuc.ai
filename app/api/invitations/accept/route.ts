// ===========================================
// LUUC.AI - Accept Invitation API
// ===========================================
// Accept a team invitation with token
// ===========================================

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { acceptInvitation, getInvitationByToken } from "@/lib/invitations";
import { withRateLimit } from "@/lib/api-middleware";
import type { ApiResponse } from "@/types";

async function handler(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado. Inicia sesión para aceptar la invitación." },
        { status: 401 }
      );
    }

    // User should not already have a company
    if (user.company_id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Ya perteneces a una empresa" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Token de invitación requerido" },
        { status: 400 }
      );
    }

    // Get invitation to verify email
    const invitation = await getInvitationByToken(token);
    if (!invitation) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Invitación inválida o expirada" },
        { status: 400 }
      );
    }

    // Verify email matches
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: `Esta invitación es para ${invitation.email}. Inicia sesión con esa cuenta.` },
        { status: 403 }
      );
    }

    // Accept invitation
    const success = await acceptInvitation(token, user.id);

    if (!success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No se pudo aceptar la invitación" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<{ companyId: string; role: string }>>({
      success: true,
      data: {
        companyId: invitation.company_id,
        role: invitation.role,
      },
    });
  } catch (error) {
    console.error("[Accept Invitation API] Error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error al aceptar invitación" },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handler, "generate");
