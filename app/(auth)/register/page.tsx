"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock, User, Building, AlertCircle, Eye, EyeOff, Sparkles, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "@/hooks/use-translations";

const PLAN_INFO: Record<string, { name: string; icon: typeof Zap; color: string; trial: number }> = {
  free: { name: "Free", icon: Zap, color: "bg-slate-100 text-slate-600", trial: 14 },
  plus: { name: "Plus", icon: Crown, color: "bg-blue-100 text-blue-600", trial: 14 },
  pro: { name: "Pro", icon: Sparkles, color: "bg-purple-100 text-purple-600", trial: 14 },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "free";
  const planInfo = PLAN_INFO[selectedPlan] || PLAN_INFO.free;
  const PlanIcon = planInfo.icon;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + planInfo.trial);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: name,
          company: company,
          plan: selectedPlan,
          trial_ends_at: trialEndsAt.toISOString(),
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setError("Este correo ya está registrado");
      } else {
        setError(error.message);
      }
      setIsLoading(false);
      return;
    }

    setMessage(
      "¡Registro exitoso! Revisa tu correo para confirmar tu cuenta."
    );
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
          <CardTitle className="text-2xl">{t("auth.createYourAccount")}</CardTitle>
          <CardDescription>
            {t("auth.createYourAccountDesc")}
          </CardDescription>

          {/* Selected Plan Badge */}
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-center gap-2">
              <div className={`rounded-lg p-1.5 ${planInfo.color}`}>
                <PlanIcon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("plans." + selectedPlan)} Plan
              </span>
            </div>
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              {t("trial.freeTrial").replace("{days}", String(planInfo.trial))}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">
              {message}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{t("auth.personalInfo")}</p>
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">{t("auth.company")}</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="company"
                  type="text"
                  placeholder="Tu empresa S.A.S."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="pl-10"
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-4">{t("auth.security")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">{t("auth.minChars")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("auth.registerButton")
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="mb-2 text-sm text-slate-600">
              {t("auth.hasAccount")}
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                {t("auth.login")}
              </Button>
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
              ← {t("common.back")}
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            {t("auth.termsAgree")}{" "}
            <Link href="/terminos" className="underline">
              {t("auth.termsOfService")}
            </Link>{" "}
            {t("auth.and")}{" "}
            <Link href="/privacidad" className="underline">
              {t("auth.privacyPolicy")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
