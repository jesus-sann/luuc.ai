import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { templates } from "@/lib/templates";
import { TemplateCard } from "@/components/template-card";

// Group templates by category
const groupedTemplates = templates.reduce((acc, template) => {
  if (!acc[template.category]) {
    acc[template.category] = [];
  }
  acc[template.category].push(template);
  return acc;
}, {} as Record<string, typeof templates>);

export default function RedactarPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
          Redacción
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          ¿Qué documento necesitas crear?
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Selecciona una plantilla o describe lo que buscas con tus propias palabras
        </p>
      </div>

      {/* Custom Redaction — Featured Card */}
      <Link href="/dashboard/redactar/personalizado">
        <div className="mb-10 flex items-center gap-4 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-white p-5 transition-all hover:border-purple-300 hover:shadow-md">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">
              Redacción Personalizada
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Describe en tus palabras qué documento necesitas y la IA lo redacta por ti
            </p>
          </div>
          <div className="hidden items-center gap-1 text-sm font-medium text-purple-600 sm:flex">
            Comenzar
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>

      {/* Grouped Templates */}
      <div className="space-y-8">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category}>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
