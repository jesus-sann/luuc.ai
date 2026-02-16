// ===========================================
// LUUC.AI - Invitations API
// ===========================================
// List and create team invitations
// ===========================================

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCompanyByUser } from "@/lib/company";
import {
  createInvitation,
  getCompanyInvitations,
  sendInvitationEmail,
  getTeamMembers,
} from "@/lib/invitations";
import { withRateLimit } from "@/lib/api-middleware";
import type { ApiResponse } from "@/types";

// ===========================================
// GET - List invitations and team members
// ===========================================

async function handleGet(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Get user's company
    const company = user.company_id
      ? await getCompanyByUser(user.id)
      : null;

    if (!company && !user.company_id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes una empresa configurada" },
        { status: 400 }
      );
    }

    const companyId = company?.id || user.company_id;
    if (!companyId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No se encontró la empresa" },
        { status: 400 }
      );
    }

    // Check if user is admin
    if (user.role !== "admin" && company?.user_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes permisos de administrador" },
        { status: 403 }
      );
    }

    // Get invitations and team members
    const [invitations, members] = await Promise.all([
      getCompanyInvitations(companyId),
      getTeamMembers(companyId),
    ]);

    return NextResponse.json<ApiResponse<{
      invitations: typeof invitations;
      members: typeof members;
      companyName: string;
    }>>({
      success: true,
      data: {
        invitations,
        members,
        companyName: company?.name || "",
      },
    });
  } catch (error) {
    console.error("[Invitations API] Error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error al obtener invitaciones" },
      { status: 500 }
    );
  }
}

// ===========================================
// POST - Create invitation
// ===========================================

async function handlePost(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Get user's company
    const company = user.company_id
      ? await getCompanyByUser(user.id)
      : null;

    if (!company && !user.company_id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes una empresa configurada" },
        { status: 400 }
      );
    }

    const companyId = company?.id || user.company_id;
    if (!companyId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No se encontró la empresa" },
        { status: 400 }
      );
    }

    // Check if user is admin
    if (user.role !== "admin" && company?.user_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No tienes permisos para invitar usuarios" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, role = "member" } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Email es requerido" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Email inválido" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["admin", "member", "viewer"].includes(role)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Rol inválido" },
        { status: 400 }
      );
    }

    // Create invitation
    const invitation = await createInvitation({
      email,
      companyId,
      invitedBy: user.id,
      role,
    });

    if (!invitation) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No se pudo crear la invitación. El usuario ya puede tener una invitación pendiente o pertenecer a otra empresa." },
        { status: 400 }
      );
    }

    // Send invitation email
    const companyName = company?.name || "tu empresa";
    await sendInvitationEmail(invitation, companyName);

    return NextResponse.json<ApiResponse<typeof invitation>>({
      success: true,
      data: invitation,
    });
  } catch (error) {
    console.error("[Invitations API] Error creating invitation:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error al crear invitación" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(handleGet, "read");
export const POST = withRateLimit(handlePost, "generate");
