// ===========================================
// LUUC.AI - Team Invitations Service
// ===========================================
// Handles team invitation CRUD and acceptance
// ===========================================

import { supabaseAdmin } from "./supabase";
import { sendEmail } from "./email";

// ===========================================
// TYPES
// ===========================================

export type InvitationRole = "admin" | "member" | "viewer";
export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

export interface Invitation {
  id: string;
  email: string;
  company_id: string;
  invited_by: string;
  role: InvitationRole;
  status: InvitationStatus;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  // Joined fields
  company_name?: string;
  invited_by_name?: string;
  invited_by_email?: string;
}

export interface CreateInvitationInput {
  email: string;
  companyId: string;
  invitedBy: string;
  role?: InvitationRole;
}

// ===========================================
// HELPERS
// ===========================================

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// ===========================================
// CRUD FUNCTIONS
// ===========================================

/**
 * Create a new invitation
 */
export async function createInvitation(
  input: CreateInvitationInput
): Promise<Invitation | null> {
  const { email, companyId, invitedBy, role = "member" } = input;

  try {
    // Check if user already exists and is in a company
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id, company_id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingUser?.company_id) {
      console.warn("[Invitations] User already belongs to a company:", email);
      return null;
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabaseAdmin
      .from("invitations")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("company_id", companyId)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      console.warn("[Invitations] Pending invitation already exists:", email);
      return null;
    }

    // Create invitation
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const { data, error } = await supabaseAdmin
      .from("invitations")
      .insert({
        email: email.toLowerCase(),
        company_id: companyId,
        invited_by: invitedBy,
        role,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[Invitations] Error creating invitation:", error);
      return null;
    }

    return data as Invitation;
  } catch (error) {
    console.error("[Invitations] Exception creating invitation:", error);
    return null;
  }
}

/**
 * Get all invitations for a company
 */
export async function getCompanyInvitations(
  companyId: string
): Promise<Invitation[]> {
  try {
    // First, clean up expired invitations
    await supabaseAdmin.rpc("cleanup_expired_invitations");

    const { data, error } = await supabaseAdmin
      .from("invitations")
      .select(`
        *,
        companies:company_id (name),
        users:invited_by (name, email)
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Invitations] Error fetching invitations:", error);
      return [];
    }

    // Transform the data to flatten joined fields
    return (data || []).map((inv) => ({
      ...inv,
      company_name: (inv.companies as { name: string } | null)?.name,
      invited_by_name: (inv.users as { name: string; email: string } | null)?.name,
      invited_by_email: (inv.users as { name: string; email: string } | null)?.email,
      companies: undefined,
      users: undefined,
    })) as Invitation[];
  } catch (error) {
    console.error("[Invitations] Exception fetching invitations:", error);
    return [];
  }
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(
  token: string
): Promise<Invitation | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("invitations")
      .select(`
        *,
        companies:company_id (name),
        users:invited_by (name, email)
      `)
      .eq("token", token)
      .eq("status", "pending")
      .maybeSingle();

    if (error || !data) {
      console.error("[Invitations] Error fetching invitation by token:", error);
      return null;
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      await supabaseAdmin
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", data.id);
      return null;
    }

    return {
      ...data,
      company_name: (data.companies as { name: string } | null)?.name,
      invited_by_name: (data.users as { name: string; email: string } | null)?.name,
      invited_by_email: (data.users as { name: string; email: string } | null)?.email,
    } as Invitation;
  } catch (error) {
    console.error("[Invitations] Exception fetching invitation:", error);
    return null;
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<boolean> {
  try {
    // Get the invitation
    const invitation = await getInvitationByToken(token);
    if (!invitation) {
      console.error("[Invitations] Invalid or expired invitation");
      return false;
    }

    // Verify user email matches
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("email, company_id")
      .eq("id", userId)
      .single();

    if (!user) {
      console.error("[Invitations] User not found:", userId);
      return false;
    }

    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      console.error("[Invitations] Email mismatch:", user.email, invitation.email);
      return false;
    }

    if (user.company_id) {
      console.error("[Invitations] User already has a company");
      return false;
    }

    // Update user with company and role
    const { error: userError } = await supabaseAdmin
      .from("users")
      .update({
        company_id: invitation.company_id,
        role: invitation.role,
      })
      .eq("id", userId);

    if (userError) {
      console.error("[Invitations] Error updating user:", userError);
      return false;
    }

    // Mark invitation as accepted
    const { error: inviteError } = await supabaseAdmin
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (inviteError) {
      console.error("[Invitations] Error updating invitation:", inviteError);
      // Don't fail - user was already updated
    }

    return true;
  } catch (error) {
    console.error("[Invitations] Exception accepting invitation:", error);
    return false;
  }
}

/**
 * Cancel/delete an invitation
 */
export async function cancelInvitation(
  invitationId: string,
  userId: string
): Promise<boolean> {
  try {
    // Verify user has permission (is admin of the company)
    const { data: invitation } = await supabaseAdmin
      .from("invitations")
      .select("company_id")
      .eq("id", invitationId)
      .single();

    if (!invitation) {
      return false;
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("company_id, role")
      .eq("id", userId)
      .single();

    // Check if user is owner or admin
    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("user_id")
      .eq("id", invitation.company_id)
      .single();

    const isOwner = company?.user_id === userId;
    const isAdmin = user?.company_id === invitation.company_id && user?.role === "admin";

    if (!isOwner && !isAdmin) {
      console.error("[Invitations] User not authorized to cancel invitation");
      return false;
    }

    const { error } = await supabaseAdmin
      .from("invitations")
      .update({ status: "cancelled" })
      .eq("id", invitationId);

    if (error) {
      console.error("[Invitations] Error cancelling invitation:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Invitations] Exception cancelling invitation:", error);
    return false;
  }
}

/**
 * Resend invitation email
 */
export async function resendInvitation(
  invitationId: string
): Promise<boolean> {
  try {
    // Get invitation with company info
    const { data: invitation } = await supabaseAdmin
      .from("invitations")
      .select(`
        *,
        companies:company_id (name)
      `)
      .eq("id", invitationId)
      .eq("status", "pending")
      .single();

    if (!invitation) {
      return false;
    }

    // Extend expiration
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7);

    await supabaseAdmin
      .from("invitations")
      .update({ expires_at: newExpiry.toISOString() })
      .eq("id", invitationId);

    // Send email
    const companyName = (invitation.companies as { name: string } | null)?.name || "una empresa";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://luuc.ai";
    const acceptUrl = `${appUrl}/invite/${invitation.token}`;

    await sendEmail({
      to: invitation.email,
      subject: `Invitación a ${companyName} en Luuc.ai`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Has sido invitado a ${companyName}</h2>
          <p>Has recibido una invitación para unirte a <strong>${companyName}</strong> en Luuc.ai como <strong>${invitation.role}</strong>.</p>
          <p>Haz clic en el botón de abajo para aceptar la invitación:</p>
          <a href="${acceptUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Aceptar Invitación
          </a>
          <p style="color: #666; font-size: 14px;">Esta invitación expira en 7 días.</p>
          <p style="color: #666; font-size: 14px;">Si no esperabas esta invitación, puedes ignorar este correo.</p>
        </div>
      `,
      text: `Has sido invitado a ${companyName} en Luuc.ai. Visita ${acceptUrl} para aceptar la invitación.`,
    });

    return true;
  } catch (error) {
    console.error("[Invitations] Exception resending invitation:", error);
    return false;
  }
}

/**
 * Send invitation email
 */
export async function sendInvitationEmail(
  invitation: Invitation,
  companyName: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://luuc.ai";
  const acceptUrl = `${appUrl}/invite/${invitation.token}`;

  return sendEmail({
    to: invitation.email,
    subject: `Invitación a ${companyName} en Luuc.ai`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Has sido invitado a ${companyName}</h2>
        <p>Has recibido una invitación para unirte a <strong>${companyName}</strong> en Luuc.ai como <strong>${invitation.role}</strong>.</p>
        <p>Haz clic en el botón de abajo para aceptar la invitación:</p>
        <a href="${acceptUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Aceptar Invitación
        </a>
        <p style="color: #666; font-size: 14px;">Esta invitación expira en 7 días.</p>
        <p style="color: #666; font-size: 14px;">Si no esperabas esta invitación, puedes ignorar este correo.</p>
      </div>
    `,
    text: `Has sido invitado a ${companyName} en Luuc.ai. Visita ${acceptUrl} para aceptar la invitación.`,
  });
}

/**
 * Get team members for a company
 */
export async function getTeamMembers(companyId: string): Promise<{
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name, role, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[Invitations] Error fetching team members:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Invitations] Exception fetching team members:", error);
    return [];
  }
}

/**
 * Update team member role
 */
export async function updateMemberRole(
  memberId: string,
  newRole: InvitationRole,
  adminUserId: string
): Promise<boolean> {
  try {
    // Get member's company
    const { data: member } = await supabaseAdmin
      .from("users")
      .select("company_id")
      .eq("id", memberId)
      .single();

    if (!member?.company_id) {
      return false;
    }

    // Verify admin has permission
    const { data: admin } = await supabaseAdmin
      .from("users")
      .select("company_id, role")
      .eq("id", adminUserId)
      .single();

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("user_id")
      .eq("id", member.company_id)
      .single();

    const isOwner = company?.user_id === adminUserId;
    const isAdmin = admin?.company_id === member.company_id && admin?.role === "admin";

    if (!isOwner && !isAdmin) {
      return false;
    }

    // Prevent demoting owner
    if (company?.user_id === memberId && newRole !== "admin") {
      console.error("[Invitations] Cannot demote company owner");
      return false;
    }

    const { error } = await supabaseAdmin
      .from("users")
      .update({ role: newRole })
      .eq("id", memberId);

    if (error) {
      console.error("[Invitations] Error updating member role:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Invitations] Exception updating member role:", error);
    return false;
  }
}

/**
 * Remove team member
 */
export async function removeMember(
  memberId: string,
  adminUserId: string
): Promise<boolean> {
  try {
    // Get member's company
    const { data: member } = await supabaseAdmin
      .from("users")
      .select("company_id")
      .eq("id", memberId)
      .single();

    if (!member?.company_id) {
      return false;
    }

    // Cannot remove yourself
    if (memberId === adminUserId) {
      console.error("[Invitations] Cannot remove yourself");
      return false;
    }

    // Verify admin has permission
    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("user_id")
      .eq("id", member.company_id)
      .single();

    // Cannot remove owner
    if (company?.user_id === memberId) {
      console.error("[Invitations] Cannot remove company owner");
      return false;
    }

    const isOwner = company?.user_id === adminUserId;
    const { data: admin } = await supabaseAdmin
      .from("users")
      .select("company_id, role")
      .eq("id", adminUserId)
      .single();

    const isAdmin = admin?.company_id === member.company_id && admin?.role === "admin";

    if (!isOwner && !isAdmin) {
      return false;
    }

    // Remove from company
    const { error } = await supabaseAdmin
      .from("users")
      .update({ company_id: null, role: "member" })
      .eq("id", memberId);

    if (error) {
      console.error("[Invitations] Error removing member:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Invitations] Exception removing member:", error);
    return false;
  }
}
