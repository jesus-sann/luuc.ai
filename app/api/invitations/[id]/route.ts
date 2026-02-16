// ===========================================
// LUUC.AI - Single Invitation API
// ===========================================
// Cancel/resend individual invitations
// ===========================================

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cancelInvitation, resendInvitation } from "@/lib/invitations";
import { withRateLimit } from "@/lib/api-middleware";
import type { ApiResponse } from "@/types";

// ===========================================
// DELETE - Cancel invitation
// ===========================================

async function handleDelete(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const invitationId = params.id;
    if (!invitationId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "ID de invitación requerido" },
        { status: 400 }
      );
    }

    const success = await cancelInvitation(invitationId, user.id);

    if (!success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No se pudo cancelar la invitación" },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<{ cancelled: boolean }>>({
      success: true,
      data: { cancelled: true },
    });
  } catch (error) {
    console.error("[Invitation API] Error cancelling:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error al cancelar invitación" },
      { status: 500 }
    );
  }
}

// ===========================================
// POST - Resend invitation email
// ===========================================

async function handlePost(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const invitationId = params.id;
    if (!invitationId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "ID de invitación requerido" },
        { status: 400 }
      );
    }

    const success = await resendInvitation(invitationId);

    if (!success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No se pudo reenviar la invitación" },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<{ resent: boolean }>>({
      success: true,
      data: { resent: true },
    });
  } catch (error) {
    console.error("[Invitation API] Error resending:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error al reenviar invitación" },
      { status: 500 }
    );
  }
}

export const DELETE = withRateLimit(handleDelete, "generate");
export const POST = withRateLimit(handlePost, "generate");
