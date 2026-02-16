// ===========================================
// LUUC.AI - Onboarding Types
// ===========================================

export interface OnboardingState {
  completed: boolean;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  companySetupComplete: boolean;
  tourComplete: boolean;
  firstDocumentCreated: boolean;
}

export type OnboardingStep =
  | "welcome"
  | "company_setup"
  | "tour_start"
  | "tour_create"
  | "tour_review"
  | "tour_knowledge"
  | "first_action"
  | "completed";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "company_setup",
  "tour_start",
  "tour_create",
  "tour_review",
  "tour_knowledge",
  "first_action",
  "completed",
];

export const TOUR_STEPS: OnboardingStep[] = [
  "tour_start",
  "tour_create",
  "tour_review",
  "tour_knowledge",
];

export interface OnboardingTranslations {
  welcome: {
    title: string;
    subtitle: string;
    description: string;
    button: string;
  };
  companySetup: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    countryLabel: string;
    sectorLabel: string;
    sectorPlaceholder: string;
    button: string;
    skip: string;
  };
  tour: {
    start: {
      title: string;
      description: string;
    };
    create: {
      title: string;
      description: string;
    };
    review: {
      title: string;
      description: string;
    };
    knowledge: {
      title: string;
      description: string;
    };
    next: string;
    skip: string;
    finish: string;
  };
  firstAction: {
    title: string;
    subtitle: string;
    description: string;
    button: string;
    later: string;
  };
  completed: {
    title: string;
    subtitle: string;
    description: string;
    button: string;
  };
}
