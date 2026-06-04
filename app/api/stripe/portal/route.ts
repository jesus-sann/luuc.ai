export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { withRateLimit } from "@/lib/api-middleware";

async function handler(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { success: false, error: "No tienes una suscripción activa" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/dashboard/configuracion/planes`,
    });

    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear sesión de portal" },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handler, "crud");
