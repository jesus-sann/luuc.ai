export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, PLANS, PlanKey } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const { plan } = await request.json();
    if (!plan || !["plus", "pro"].includes(plan)) {
      return NextResponse.json({ success: false, error: "Plan inválido" }, { status: 400 });
    }

    const planConfig = PLANS[plan as PlanKey];
    if (!("priceId" in planConfig) || !planConfig.priceId) {
      return NextResponse.json({ success: false, error: "Plan no configurado en Stripe" }, { status: 400 });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string | null = null;

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;

      // Save to profiles (ignore error if column doesn't exist yet)
      try {
        await supabaseAdmin
          .from("profiles")
          .update({ stripe_customer_id: stripeCustomerId })
          .eq("id", user.id);
      } catch {
        // Column may not exist yet
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      customer: stripeCustomerId!,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/configuracion/planes?success=true`,
      cancel_url: `${appUrl}/dashboard/configuracion/planes?canceled=true`,
      metadata: { userId: user.id, plan },
    });

    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear sesión de pago" },
      { status: 500 }
    );
  }
}
