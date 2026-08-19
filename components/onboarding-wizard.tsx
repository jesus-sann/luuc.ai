"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Building2,
  Rocket,
  FileText,
  ArrowRight,
  X,
  Check,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/hooks/use-translations";
import type { OnboardingStep } from "@/types/onboarding";
import { cn } from "@/lib/utils";

interface OnboardingWizardProps {
  currentStep: OnboardingStep;
  onCompleteStep: (step: OnboardingStep) => Promise<boolean>;
  onSkip: () => Promise<boolean>;
  userName?: string;
}

const COUNTRIES = [
  { value: "CO", label: "Colombia" },
  { value: "MX", label: "México" },
  { value: "AR", label: "Argentina" },
  { value: "CL", label: "Chile" },
  { value: "PE", label: "Perú" },
  { value: "EC", label: "Ecuador" },
  { value: "ES", label: "España" },
  { value: "US", label: "Estados Unidos" },
  { value: "OTHER", label: "Otro" },
];

const SECTORS = [
  { value: "legal", label: "Firma de Abogados" },
  { value: "corporate", label: "Departamento Legal Corporativo" },
  { value: "fintech", label: "Fintech / Servicios Financieros" },
  { value: "tech", label: "Tecnología" },
  { value: "healthcare", label: "Salud" },
  { value: "real_estate", label: "Inmobiliario" },
  { value: "consulting", label: "Consultoría" },
  { value: "startup", label: "Startup" },
  { value: "other", label: "Otro" },
];

export function OnboardingWizard({
  currentStep,
  onCompleteStep,
  onSkip,
  userName,
}: OnboardingWizardProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // Local dismissed state: if the API fails the user can still exit the modal.
  const [dismissed, setDismissed] = useState(false);

  // Company setup form
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [sector, setSector] = useState("");

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Show confetti on completed step
  useEffect(() => {
    if (currentStep === "completed") {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleWelcomeContinue = async () => {
    setIsSubmitting(true);
    const ok = await onCompleteStep("welcome");
    // If API fails, advance locally so the user isn't stuck
    if (!ok) setDismissed(true);
    setIsSubmitting(false);
  };

  const handleCompanySetup = async () => {
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    try {
      // Create company via API
      const res = await fetch("/api/company/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          industry: sector,
          country: country,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await onCompleteStep("company_setup");
      }
    } catch (error) {
      console.error("Error creating company:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipCompany = async () => {
    setIsSubmitting(true);
    await onCompleteStep("company_setup");
    setIsSubmitting(false);
  };

  const handleStartTour = async () => {
    setIsSubmitting(true);
    await onCompleteStep("tour_start");
    setIsSubmitting(false);
  };

  const handleSkipTour = async () => {
    setIsSubmitting(true);
    // Skip all tour steps
    await onCompleteStep("tour_create");
    await onCompleteStep("tour_review");
    await onCompleteStep("tour_knowledge");
    setIsSubmitting(false);
  };

  const handleFirstAction = () => {
    // Navigate to NDA template
    router.push("/dashboard/crear/nda");
  };

  const handleFirstActionLater = async () => {
    setIsSubmitting(true);
    await onCompleteStep("first_action");
    setIsSubmitting(false);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    await onCompleteStep("completed");
    setIsSubmitting(false);
  };

  // Don't show for tour steps (handled by tour component), completed, or locally dismissed
  if (dismissed) return null;
  if (currentStep.startsWith("tour_") && currentStep !== "tour_start") {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Confetti effect */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][
                  Math.floor(Math.random() * 5)
                ],
                width: "10px",
                height: "10px",
                borderRadius: Math.random() > 0.5 ? "50%" : "0",
              }}
            />
          ))}
        </div>
      )}

      <div
        className={cn(
          "relative w-full max-w-lg transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300 dark:bg-slate-900",
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        {/* Skip button — always dismisses locally even if API fails */}
        {currentStep !== "completed" && (
          <button
            onClick={async () => {
              setDismissed(true);
              await onSkip().catch(() => {});
            }}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Welcome Step */}
        {currentStep === "welcome" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
              {t("onboarding.welcome.title")}
              {userName ? `, ${userName.split(" ")[0]}` : ""}!
            </h2>
            <p className="mb-2 text-lg text-blue-600 dark:text-blue-400">
              {t("onboarding.welcome.subtitle")}
            </p>
            <p className="mb-8 text-slate-500 dark:text-slate-400">
              {t("onboarding.welcome.description")}
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={handleWelcomeContinue}
              disabled={isSubmitting}
            >
              {t("onboarding.welcome.button")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Company Setup Step */}
        {currentStep === "company_setup" && (
          <div>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Building2 className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t("onboarding.companySetup.title")}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("onboarding.companySetup.subtitle")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">
                  {t("onboarding.companySetup.nameLabel")} *
                </Label>
                <Input
                  id="company-name"
                  placeholder={t("onboarding.companySetup.namePlaceholder")}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>{t("onboarding.companySetup.countryLabel")}</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un país" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("onboarding.companySetup.sectorLabel")}</Label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("onboarding.companySetup.sectorPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSkipCompany}
                disabled={isSubmitting}
              >
                {t("onboarding.companySetup.skip")}
              </Button>
              <Button
                className="flex-1"
                onClick={handleCompanySetup}
                disabled={isSubmitting || !companyName.trim()}
              >
                {t("onboarding.companySetup.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Tour Start Step */}
        {currentStep === "tour_start" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Rocket className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
              {t("onboarding.tour.start.title")}
            </h2>
            <p className="mb-8 text-slate-500 dark:text-slate-400">
              {t("onboarding.tour.start.description")}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSkipTour}
                disabled={isSubmitting}
              >
                {t("onboarding.tour.skip")}
              </Button>
              <Button
                className="flex-1"
                onClick={handleStartTour}
                disabled={isSubmitting}
              >
                {t("onboarding.tour.next")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* First Action Step */}
        {currentStep === "first_action" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
              {t("onboarding.firstAction.title")}
            </h2>
            <p className="mb-2 text-lg text-amber-600 dark:text-amber-400">
              {t("onboarding.firstAction.subtitle")}
            </p>
            <p className="mb-8 text-slate-500 dark:text-slate-400">
              {t("onboarding.firstAction.description")}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleFirstActionLater}
                disabled={isSubmitting}
              >
                {t("onboarding.firstAction.later")}
              </Button>
              <Button className="flex-1" onClick={handleFirstAction}>
                {t("onboarding.firstAction.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Completed Step */}
        {currentStep === "completed" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
              <PartyPopper className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
              {t("onboarding.completed.title")}
            </h2>
            <p className="mb-2 text-lg text-green-600 dark:text-green-400">
              {t("onboarding.completed.subtitle")}
            </p>
            <p className="mb-8 text-slate-500 dark:text-slate-400">
              {t("onboarding.completed.description")}
            </p>
            <Button size="lg" className="w-full" onClick={handleComplete}>
              {t("onboarding.completed.button")}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Progress indicator */}
        {currentStep !== "completed" && (
          <div className="mt-8 flex justify-center gap-2">
            {["welcome", "company_setup", "tour_start", "first_action"].map((step, i) => (
              <div
                key={step}
                className={cn(
                  "h-2 w-8 rounded-full transition-colors",
                  ["welcome", "company_setup", "tour_start", "first_action"].indexOf(currentStep) >= i
                    ? "bg-blue-600"
                    : "bg-slate-200 dark:bg-slate-700"
                )}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
