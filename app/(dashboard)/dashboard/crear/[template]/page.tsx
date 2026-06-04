"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getTemplateBySlug } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { DocumentViewerModal } from "@/components/document-viewer-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGenerationSuggestions } from "@/hooks/use-suggestions";
import type { AISuggestion } from "@/types/suggestions";
import { DocumentFormWizard } from "@/components/document-form-wizard";

const DOC_LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

const AI_PROVIDERS = [
  { value: "auto", label: "Auto (predeterminado)", description: "Usa el modelo configurado por defecto" },
  { value: "anthropic", label: "Claude (Anthropic)", description: "Más preciso para documentos legales" },
  { value: "google", label: "Gemini (Google)", description: "Rápido y económico" },
  { value: "groq", label: "Llama (Groq)", description: "Gratuito para pruebas" },
];

export default function TemplateFormPage() {
  const params = useParams();
  const router = useRouter();
  const templateSlug = params.template as string;
  const template = getTemplateBySlug(templateSlug);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedDocId, setGeneratedDocId] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [aiProvider, setAiProvider] = useState("auto");
  const [docLanguage, setDocLanguage] = useState("es");
  const [userInstructions, setUserInstructions] = useState("");

  // Fetch AI suggestions when document is generated
  const { suggestions, isLoading: suggestionsLoading } = useGenerationSuggestions(
    showModal ? templateSlug : null,
    showModal ? generatedContent : null,
    formData,
    { language: docLanguage as "es" | "en" | "pt" | "fr" | "de" }
  );

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    if (suggestion.action?.type === "create_template" && suggestion.action.templateSlug) {
      setShowModal(false);
      router.push(`/dashboard/crear/${suggestion.action.templateSlug}`);
    }
  };

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-slate-500">Plantilla no encontrada</p>
        <Link href="/dashboard/crear">
          <Button variant="outline">Volver a plantillas</Button>
        </Link>
      </div>
    );
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateDocument = async (variables: Record<string, string>) => {
    setIsLoading(true);
    setGenerateError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          template: template.slug,
          variables,
          title: `${template.name} - ${new Date().toLocaleDateString("es-CO")}`,
          ...(aiProvider !== "auto" && { provider: aiProvider }),
          language: docLanguage,
          ...(userInstructions.trim() && { userInstructions: userInstructions.trim() }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.data.content);
        setGeneratedDocId(data.data.id || null);
        setGeneratedTitle(data.data.title || template.name);
        setShowModal(true);
      } else {
        setGenerateError(data.error || "Error al generar el documento. Intenta de nuevo.");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setGenerateError("La generación tardó demasiado. Intenta de nuevo o usa un documento más corto.");
      } else {
        setGenerateError("Error de conexión. Verifica tu internet e intenta de nuevo.");
      }
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateDocument(formData);
  };

  const handleWizardSubmit = async (values: Record<string, string>) => {
    await generateDocument(values);
  };

  const handleNewDocument = () => {
    setGeneratedContent(null);
    setGeneratedDocId(null);
    setShowModal(false);
    setFormData({});
    setAiProvider("auto");
    setDocLanguage("es");
    setUserInstructions("");
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/crear" className="mb-3 inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Volver
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Plantilla
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{template.name}</h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{template.description}</p>
      </div>

      {generateError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-medium">Error al generar el documento</p>
            <p className="mt-0.5 text-red-600 dark:text-red-400">{generateError}</p>
          </div>
        </div>
      )}

      {/* Extra controls: language, AI model, custom instructions — shared by both wizard and flat form */}
      {(() => {
        const extraControls = (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Idioma del documento</Label>
              <Select value={docLanguage} onValueChange={setDocLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Modelo de IA</Label>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto (predeterminado)" />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="font-medium">{p.label}</span>
                      <span className="ml-2 text-xs text-slate-500">— {p.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="userInstructions" className="text-sm">
                Instrucciones específicas <span className="text-slate-400 font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="userInstructions"
                placeholder="Ej: Incluir cláusula de confidencialidad estricta, usar lenguaje formal corporativo, enfatizar penalidades por incumplimiento..."
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                rows={3}
                maxLength={2000}
                className="text-sm resize-none"
              />
              <p className="text-xs text-slate-400">
                Guía a la IA con instrucciones adicionales para personalizar el documento según tus necesidades.
              </p>
            </div>
          </div>
        );

        // Wizard mode: template has steps defined
        if (template.steps && template.steps.length > 0) {
          return (
            <DocumentFormWizard
              template={template}
              onSubmit={handleWizardSubmit}
              isLoading={isLoading}
              extraControls={extraControls}
            />
          );
        }

        // Flat form mode: legacy templates without steps
        return (
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información del Documento</CardTitle>
                <p className="text-xs text-slate-500">{template.variables.length} campos requeridos</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {template.variables.map((variable) => (
                    <div key={variable.name} className="space-y-1.5">
                      <Label htmlFor={variable.name} className="text-sm">
                        {variable.label}
                        {variable.required && <span className="ml-1 text-red-500">*</span>}
                      </Label>

                      {variable.type === "text" && (
                        <Input id={variable.name} placeholder={variable.placeholder} required={variable.required} value={formData[variable.name] || ""} onChange={(e) => handleInputChange(variable.name, e.target.value)} className="text-sm" />
                      )}

                      {variable.type === "textarea" && (
                        <Textarea id={variable.name} placeholder={variable.placeholder} required={variable.required} rows={3} value={formData[variable.name] || ""} onChange={(e) => handleInputChange(variable.name, e.target.value)} className="text-sm" />
                      )}

                      {variable.type === "date" && (
                        <Input id={variable.name} type="date" required={variable.required} value={formData[variable.name] || ""} onChange={(e) => handleInputChange(variable.name, e.target.value)} className="text-sm" />
                      )}

                      {variable.type === "select" && variable.options && (
                        <Select value={formData[variable.name] || ""} onValueChange={(value) => handleInputChange(variable.name, value)}>
                          <SelectTrigger><SelectValue placeholder="Selecciona una opción" /></SelectTrigger>
                          <SelectContent>
                            {variable.options.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}

                  {extraControls}

                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                    El contenido generado por IA es un borrador que debe ser revisado por un profesional legal. Luuc.ai no sustituye el asesoramiento jurídico.
                  </p>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando documento...</>
                    ) : (
                      "Generar Documento"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Document Viewer Modal */}
      {generatedContent && (
        <DocumentViewerModal
          open={showModal}
          onOpenChange={(open) => {
            setShowModal(open);
            if (!open) handleNewDocument();
          }}
          title={generatedTitle}
          content={generatedContent}
          documentId={generatedDocId}
          suggestions={suggestions}
          suggestionsLoading={suggestionsLoading}
          onSuggestionClick={handleSuggestionClick}
          locale={docLanguage as "es" | "en"}
        />
      )}
    </div>
  );
}
