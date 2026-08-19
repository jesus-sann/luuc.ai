// ===========================================
// LUUC.AI - Onboarding API
// ===========================================
// Track and update onboarding progress
// ===========================================

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withRateLimit } from "@/lib/api-middleware";
import type { OnboardingState, OnboardingStep } from "@/types/onboarding";
import type { ApiResponse } from "@/types";

const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  completed: false,
  currentStep: "welcome",
  completedSteps: [],
  companySetupComplete: false,
  tourComplete: false,
  firstDocumentCreated: false,
};

// GET: Fetch current onboarding state
async function handleGet() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Get onboarding state from user metadata
    const onboardingState = user.user_metadata?.onboarding as OnboardingState | undefined;

    // Check if user has a company
    const { data: dbUser } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single();

    const hasCompany = !!dbUser?.company_id;

    // If no onboarding state, infer from account maturity.
    // Users who already have a company are existing users — treat as completed
    // so the modal doesn't block them on every login.
    if (!onboardingState) {
      const state: OnboardingState = hasCompany
        ? {
            ...DEFAULT_ONBOARDING_STATE,
            completed: true,
            companySetupComplete: true,
            tourComplete: true,
            currentStep: "completed",
            completedSteps: ["welcome", "company_setup", "tour_start", "tour_create", "tour_review", "tour_knowledge", "first_action", "completed"],
          }
        : {
            ...DEFAULT_ONBOARDING_STATE,
            companySetupComplete: false,
            currentStep: "welcome",
          };
      return NextResponse.json<ApiResponse<OnboardingState>>({
        success: true,
        data: state,
      });
    }

    // Update company status if it changed
    if (hasCompany && !onboardingState.companySetupComplete) {
      onboardingState.companySetupComplete = true;
    }

    return NextResponse.json<ApiResponse<OnboardingState>>({
      success: true,
      data: onboardingState,
    });
  } catch (error) {
    console.error("[Onboarding API] GET Error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error al obtener estado de onboarding" },
      { status: 500 }
    );
  }
}

// PUT: Update onboarding state
async function handlePut(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { step, action } = body as { step?: OnboardingStep; action?: "complete_step" | "skip" | "reset" };

    // Get current state
    const currentState = (user.user_metadata?.onboarding as OnboardingState) || DEFAULT_ONBOARDING_STATE;

    let newState: OnboardingState;

    if (action === "reset") {
      newState = DEFAULT_ONBOARDING_STATE;
    } else if (action === "skip") {
      newState = {
        ...currentState,
        completed: true,
        currentStep: "completed",
        tourComplete: true,
      };
    } else if (step) {
      // Mark step as completed and advance
      const stepsSet = new Set([...currentState.completedSteps, step]);
      const completedSteps = Array.from(stepsSet) as OnboardingStep[];
      const allSteps: OnboardingStep[] = ["welcome", "company_setup", "tour_start", "tour_create", "tour_review", "tour_knowledge", "first_action", "completed"];
      const stepIndex = allSteps.indexOf(step);
      const nextStep: OnboardingStep = allSteps[stepIndex + 1] || "completed";

      newState = {
        ...currentState,
        completedSteps,
        currentStep: nextStep,
        completed: nextStep === "completed",
        tourComplete: step === "tour_knowledge" || currentState.tourComplete,
        firstDocumentCreated: step === "first_action" || currentState.firstDocumentCreated,
      };
    } else {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Se requiere step o action" },
        { status: 400 }
      );
    }

    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        onboarding: newState,
      },
    });

    if (error) {
      console.error("[Onboarding API] Update error:", error);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al actualizar onboarding" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<OnboardingState>>({
      success: true,
      data: newState,
    });
  } catch (error) {
    console.error("[Onboarding API] PUT Error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error al actualizar onboarding" },
      { status: 500 }
    );
  }
}

// Apply rate limiting to prevent state-polling and brute-force abuse
export const GET = withRateLimit(handleGet, "read");
export const PUT = withRateLimit(handlePut, "crud");
