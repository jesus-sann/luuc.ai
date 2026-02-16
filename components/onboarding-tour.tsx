"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";
import type { OnboardingStep } from "@/types/onboarding";
import { cn } from "@/lib/utils";

interface TourStep {
  step: OnboardingStep;
  targetSelector: string;
  position: "top" | "bottom" | "left" | "right";
  titleKey: string;
  descriptionKey: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    step: "tour_create",
    targetSelector: '[data-tour="create"]',
    position: "right",
    titleKey: "onboarding.tour.create.title",
    descriptionKey: "onboarding.tour.create.description",
  },
  {
    step: "tour_review",
    targetSelector: '[data-tour="review"]',
    position: "right",
    titleKey: "onboarding.tour.review.title",
    descriptionKey: "onboarding.tour.review.description",
  },
  {
    step: "tour_knowledge",
    targetSelector: '[data-tour="knowledge"]',
    position: "right",
    titleKey: "onboarding.tour.knowledge.title",
    descriptionKey: "onboarding.tour.knowledge.description",
  },
];

interface OnboardingTourProps {
  currentStep: OnboardingStep;
  onCompleteStep: (step: OnboardingStep) => Promise<boolean>;
  onSkip: () => Promise<boolean>;
}

export function OnboardingTour({
  currentStep,
  onCompleteStep,
  onSkip,
}: OnboardingTourProps) {
  const t = useTranslations();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentTourStep = TOUR_STEPS.find((s) => s.step === currentStep);
  const currentIndex = TOUR_STEPS.findIndex((s) => s.step === currentStep);
  const isLastStep = currentIndex === TOUR_STEPS.length - 1;

  const updatePosition = useCallback(() => {
    if (!currentTourStep) return;

    const target = document.querySelector(currentTourStep.targetSelector);
    if (!target) {
      // If target not found, skip to next step
      console.warn(`Tour target not found: ${currentTourStep.targetSelector}`);
      return;
    }

    const rect = target.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 160;
    const padding = 16;

    let top = 0;
    let left = 0;

    switch (currentTourStep.position) {
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        break;
      case "bottom":
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "top":
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
    }

    // Keep within viewport
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

    setPosition({ top, left });
  }, [currentTourStep]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!currentTourStep) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, 300);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [currentTourStep, updatePosition]);

  const handleNext = async () => {
    setIsVisible(false);
    await onCompleteStep(currentStep);
  };

  const handleSkip = async () => {
    setIsVisible(false);
    // Complete remaining tour steps
    for (const step of TOUR_STEPS) {
      if (TOUR_STEPS.indexOf(step) >= currentIndex) {
        await onCompleteStep(step.step);
      }
    }
  };

  // Don't render if not a tour step or not mounted
  if (!mounted || !currentTourStep) return null;

  // Highlight the target element
  const target = document.querySelector(currentTourStep.targetSelector);

  return createPortal(
    <>
      {/* Backdrop with spotlight */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleSkip}
      />

      {/* Spotlight on target */}
      {target && (
        <div
          className="pointer-events-none fixed z-40 rounded-lg ring-4 ring-blue-500 ring-offset-4 ring-offset-transparent"
          style={{
            top: target.getBoundingClientRect().top - 4,
            left: target.getBoundingClientRect().left - 4,
            width: target.getBoundingClientRect().width + 8,
            height: target.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={cn(
          "fixed z-50 w-80 rounded-xl bg-white p-5 shadow-2xl transition-all duration-300 dark:bg-slate-900",
          isVisible
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0"
        )}
        style={{ top: position.top, left: position.left }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step indicator */}
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {currentIndex + 1} / {TOUR_STEPS.length}
          </span>
        </div>

        {/* Content */}
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
          {t(currentTourStep.titleKey)}
        </h3>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {t(currentTourStep.descriptionKey)}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            {t("onboarding.tour.skip")}
          </Button>
          <Button size="sm" className="ml-auto" onClick={handleNext}>
            {isLastStep ? t("onboarding.tour.finish") : t("onboarding.tour.next")}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>

        {/* Arrow pointer */}
        <div
          className={cn(
            "absolute h-3 w-3 rotate-45 bg-white dark:bg-slate-900",
            currentTourStep.position === "right" && "-left-1.5 top-1/2 -translate-y-1/2",
            currentTourStep.position === "left" && "-right-1.5 top-1/2 -translate-y-1/2",
            currentTourStep.position === "bottom" && "-top-1.5 left-1/2 -translate-x-1/2",
            currentTourStep.position === "top" && "-bottom-1.5 left-1/2 -translate-x-1/2"
          )}
        />
      </div>
    </>,
    document.body
  );
}
