"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// These slugs map to case types protected under INA §1367.
// VAWA (i360) is the highest sensitivity; U-Visa (i918), Asylum (i589),
// and I-751 abuse waivers all involve protected survivor information.
const SENSITIVE_SLUGS = [
  "i360-vawa-cover-letter",
  "i918-u-visa-cover-letter",
  "i589-cover-letter",
  "i751-cover-letter",
] as const;

type SensitiveSlug = (typeof SENSITIVE_SLUGS)[number];

function isSensitiveSlug(slug: string): slug is SensitiveSlug {
  return (SENSITIVE_SLUGS as readonly string[]).includes(slug);
}

interface SensitiveCaseWarningProps {
  templateSlug: string;
}

export function SensitiveCaseWarning({ templateSlug }: SensitiveCaseWarningProps) {
  // sessionStorage so the warning reappears each new browser session (next day),
  // but does not re-interrupt the user mid-session once they've acknowledged it
  // for this specific template.
  const storageKey = `luuc_1367_dismissed_${templateSlug}`;

  // Initialize to true (hidden) to prevent flash before hydration check.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Only run after hydration so we can safely access sessionStorage.
    if (!isSensitiveSlug(templateSlug)) return;
    const alreadyDismissed = sessionStorage.getItem(storageKey) === "1";
    setDismissed(alreadyDismissed);
  }, [templateSlug, storageKey]);

  // Not a sensitive template — render nothing.
  if (!isSensitiveSlug(templateSlug)) return null;

  // Dismissed this session — render nothing.
  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(storageKey, "1");
    setDismissed(true);
  };

  return (
    // Amber tone signals "important information" not "danger" — we want lawyers
    // to read and understand, not panic and abandon. (Trust through design principle)
    <div
      role="alert"
      aria-live="polite"
      className="relative rounded-lg border border-amber-200 bg-amber-50 p-4"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900">
            Aviso de privacidad — caso sensible bajo INA §1367
          </p>
        </div>
        {/* Dismiss button — keyboard accessible with clear aria-label */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar aviso de privacidad"
          className="ml-auto flex-shrink-0 rounded p-0.5 text-amber-600 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body — progressive disclosure: concise explanation, then action */}
      <div className="mt-2 ml-8 space-y-3">
        <p className="text-sm text-amber-800 leading-relaxed">
          Este tipo de documento involucra información protegida bajo INA §1367 (VAWA, U-Visa,
          T-Visa o Asilo). Los documentos generados pasan por los servidores de Anthropic, que
          retiene los prompts hasta 30 días antes de eliminarlos automáticamente. Anthropic no
          usa estos datos para entrenar sus modelos (garantizado contractualmente). Luuc.ai está
          en proceso de implementar Zero Data Retention (ZDR) con Anthropic para eliminar esta
          ventana de retención.
        </p>
        <p className="text-sm text-amber-800 leading-relaxed">
          Si el caso requiere confidencialidad absoluta, consulta con el abogado responsable
          antes de continuar con la generación automatizada.
        </p>

        {/* CTA aligned left — not centered, this is a decision point not a celebration */}
        <Button
          type="button"
          size="sm"
          onClick={handleDismiss}
          // Amber-toned button keeps visual context; avoids blue primary which would
          // look like we're encouraging them to skip past the warning.
          className="bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-500"
        >
          Entendido, continuar
        </Button>
      </div>
    </div>
  );
}
