"use client";

/**
 * CoverLetterSelectorModal
 *
 * UX rationale: Rather than showing 13 individual immigration cover letter cards
 * in the gallery (which overwhelms María and confuses Carlos), we present a single
 * entry point that opens this modal. The modal uses Progressive Disclosure — the user
 * only sees the full list of case types when they've already decided they need a
 * cover letter. The grid layout lets María scan quickly while Carlos reads the
 * descriptions to identify his case type.
 */

import {
  FileCheck,
  Scale,
  Users,
  Heart,
  Shield,
  UserCheck,
  Globe,
  Star,
  Briefcase,
  Plane,
  RefreshCw,
  FilePlus,
  LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { templates, IMMIGRATION_COVER_LETTER_SLUGS } from "@/lib/templates";

// Extend the icon map beyond what TemplateCard covers to include all icons
// used by immigration cover letter templates.
const iconMap: Record<string, LucideIcon> = {
  FileCheck,
  Scale,
  Users,
  Heart,
  Shield,
  UserCheck,
  Globe,
  Star,
  Briefcase,
  Plane,
  RefreshCw,
  FilePlus,
};

// Derive the subset of templates shown in this modal once at module level
// so the array is never recalculated on every render.
const coverLetterTemplates = templates.filter((t) =>
  (IMMIGRATION_COVER_LETTER_SLUGS as readonly string[]).includes(t.slug)
);

interface CoverLetterSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (slug: string) => void;
}

export function CoverLetterSelectorModal({
  open,
  onClose,
  onSelect,
}: CoverLetterSelectorModalProps) {
  // Separate the custom template so it renders at the bottom with a
  // distinct visual treatment (dashed border). All others are "standard".
  const standardTemplates = coverLetterTemplates.filter(
    (t) => t.slug !== "custom-immigration-cover-letter"
  );
  const customTemplate = coverLetterTemplates.find(
    (t) => t.slug === "custom-immigration-cover-letter"
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        // Wide enough to show 3 columns on desktop without feeling cramped.
        // max-h + overflow-y keeps the modal within viewport on smaller screens.
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-slate-900">
            Selecciona el tipo de caso
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Elige la petición o solicitud para la que necesitas la cover letter.
          </DialogDescription>
        </DialogHeader>

        {/* Standard case types — 2 columns on mobile, 3 on desktop */}
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {standardTemplates.map((template) => {
            const Icon = iconMap[template.icon] || FileCheck;
            return (
              <button
                key={template.slug}
                type="button"
                onClick={() => {
                  onSelect(template.slug);
                  onClose();
                }}
                // Compact card: icon + name + one-line hint.
                // hover:border-blue-300 + hover:bg-blue-50 give immediate
                // feedback consistent with the rest of the design language.
                className="group flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 transition-colors group-hover:bg-blue-100">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold leading-snug text-slate-900">
                    {template.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
                    {template.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom template — visually separated at the bottom with a dashed border
            to signal it's an open-ended option rather than a specific case type. */}
        {customTemplate && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Otros casos
            </p>
            <button
              type="button"
              onClick={() => {
                onSelect(customTemplate.slug);
                onClose();
              }}
              className="group flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-3 text-left transition-all hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 transition-colors group-hover:bg-blue-100">
                <FilePlus className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {customTemplate.name}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {customTemplate.description}
                </p>
              </div>
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
