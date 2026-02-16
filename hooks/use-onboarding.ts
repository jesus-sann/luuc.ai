"use client";

import { useState, useEffect, useCallback } from "react";
import type { OnboardingState, OnboardingStep } from "@/types/onboarding";

const DEFAULT_STATE: OnboardingState = {
  completed: false,
  currentStep: "welcome",
  completedSteps: [],
  companySetupComplete: false,
  tourComplete: false,
  firstDocumentCreated: false,
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch onboarding state
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding");
      const data = await res.json();

      if (data.success) {
        setState(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Error fetching onboarding state:", err);
      setError("Error al cargar onboarding");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Complete a step
  const completeStep = useCallback(async (step: OnboardingStep) => {
    try {
      const res = await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step }),
      });
      const data = await res.json();

      if (data.success) {
        setState(data.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error completing step:", err);
      return false;
    }
  }, []);

  // Skip onboarding
  const skipOnboarding = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "skip" }),
      });
      const data = await res.json();

      if (data.success) {
        setState(data.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error skipping onboarding:", err);
      return false;
    }
  }, []);

  // Reset onboarding (for testing)
  const resetOnboarding = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();

      if (data.success) {
        setState(data.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error resetting onboarding:", err);
      return false;
    }
  }, []);

  // Check if should show onboarding
  const shouldShowOnboarding = !loading && !state.completed;

  // Check if in tour mode
  const isInTour = state.currentStep.startsWith("tour_");

  return {
    state,
    loading,
    error,
    shouldShowOnboarding,
    isInTour,
    completeStep,
    skipOnboarding,
    resetOnboarding,
    refetch: fetchState,
  };
}
