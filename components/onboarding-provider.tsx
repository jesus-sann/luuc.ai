"use client";

import { createContext, useContext, ReactNode } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { OnboardingTour } from "@/components/onboarding-tour";
import { useAuth } from "@/hooks/use-auth";
import type { OnboardingState, OnboardingStep } from "@/types/onboarding";

interface OnboardingContextValue {
  state: OnboardingState;
  loading: boolean;
  shouldShowOnboarding: boolean;
  isInTour: boolean;
  completeStep: (step: OnboardingStep) => Promise<boolean>;
  skipOnboarding: () => Promise<boolean>;
  resetOnboarding: () => Promise<boolean>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboardingContext must be used within OnboardingProvider");
  }
  return context;
}

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { user } = useAuth();
  const onboarding = useOnboarding();

  const {
    state,
    loading,
    shouldShowOnboarding,
    isInTour,
    completeStep,
    skipOnboarding,
    resetOnboarding,
  } = onboarding;

  // Get user name from auth
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0];

  // Determine what to show
  const showWizard = shouldShowOnboarding && !isInTour;
  const showTour = shouldShowOnboarding && isInTour;

  return (
    <OnboardingContext.Provider
      value={{
        state,
        loading,
        shouldShowOnboarding,
        isInTour,
        completeStep,
        skipOnboarding,
        resetOnboarding,
      }}
    >
      {children}

      {/* Onboarding Wizard Modal */}
      {showWizard && (
        <OnboardingWizard
          currentStep={state.currentStep}
          onCompleteStep={completeStep}
          onSkip={skipOnboarding}
          userName={userName}
        />
      )}

      {/* Tour Tooltips */}
      {showTour && (
        <OnboardingTour
          currentStep={state.currentStep}
          onCompleteStep={completeStep}
          onSkip={skipOnboarding}
        />
      )}
    </OnboardingContext.Provider>
  );
}
