import Link from "next/link";
import { Sparkles } from "lucide-react";
import { templates } from "@/lib/templates";
import { TemplateCard } from "@/components/template-card";

export default function RedactarPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Redactar Documento</h1>
        <p className="mt-2 text-slate-600">
          Selecciona el tipo de documento que deseas crear
        </p>
      </div>

      {/* Redacción Personalizada Banner */}
      <Link href="/dashboard/redactar/personalizado">
        <div className="mb-8 flex items-center gap-4 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6 transition-all hover:border-purple-300 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">
              Redacción Personalizada
            </h3>
            <p className="text-sm text-slate-600">
              ¿No encuentras el documento que necesitas? Describe lo que buscas y te ayudamos a redactarlo.
            </p>
          </div>
          <div className="hidden text-sm font-medium text-purple-600 sm:block">
            Probar ahora →
          </div>
        </div>
      </Link>

      {/* Templates Grid */}
      <h2 className="mb-4 text-lg font-semibold text-slate-700">Templates Disponibles</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
