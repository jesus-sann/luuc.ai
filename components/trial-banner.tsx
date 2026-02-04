"use client";

import Link from "next/link";
import { Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function TrialBanner() {
  const { user } = useAuth();

  const trialEndsAt = user?.user_metadata?.trial_ends_at;
  const currentPlan = (user?.user_metadata?.plan as string) || "free";

  // Don't show if no trial or already on paid plan with subscription
  if (!trialEndsAt || currentPlan === "free") {
    return null;
  }

  const trialEnd = new Date(trialEndsAt);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isExpired = daysLeft === 0;

  if (isExpired) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Tu prueba gratis ha expirado</span>
        </div>
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          Actualiza tu plan para continuar usando todas las funciones.
        </p>
        <Link href="/dashboard/configuracion/planes">
          <Button size="sm" className="mt-2 w-full bg-red-600 hover:bg-red-700">
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            Actualizar ahora
          </Button>
        </Link>
      </div>
    );
  }

  const urgency = daysLeft <= 3 ? "urgent" : daysLeft <= 7 ? "warning" : "normal";

  const styles = {
    urgent: {
      border: "border-orange-200 dark:border-orange-800",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      text: "text-orange-700 dark:text-orange-400",
      subtext: "text-orange-600 dark:text-orange-400",
    },
    warning: {
      border: "border-yellow-200 dark:border-yellow-800",
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      text: "text-yellow-700 dark:text-yellow-400",
      subtext: "text-yellow-600 dark:text-yellow-400",
    },
    normal: {
      border: "border-blue-200 dark:border-blue-800",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      text: "text-blue-700 dark:text-blue-400",
      subtext: "text-blue-600 dark:text-blue-400",
    },
  };

  const s = styles[urgency];

  return (
    <div className={`rounded-lg border ${s.border} ${s.bg} p-3`}>
      <div className={`flex items-center gap-2 ${s.text}`}>
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">
          {daysLeft} {daysLeft === 1 ? "día" : "días"} restantes de prueba
        </span>
      </div>
      <p className={`mt-1 text-xs ${s.subtext}`}>
        Tu prueba del plan {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} termina el{" "}
        {trialEnd.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}.
      </p>
      <Link href="/dashboard/configuracion/planes">
        <Button size="sm" variant="outline" className="mt-2 w-full text-xs">
          <Zap className="mr-1.5 h-3 w-3" />
          Ver planes
        </Button>
      </Link>
    </div>
  );
}
