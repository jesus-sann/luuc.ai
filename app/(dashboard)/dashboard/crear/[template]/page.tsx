"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, FileText, AlertCircle, Upload, Edit3, ChevronDown, ChevronUp, CheckCircle2, X } from "lucide-react";
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
import { useDropzone } from "react-dropzone";

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

  // Case summary upload mode
  const [inputMode, setInputMode] = useState<"manual" | "upload">("manual");
  const [caseSummary, setCaseSummary] = useState<string | null>(null);
  const [summaryFileName, setSummaryFileName] = useState<string>("");
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showSummaryPreview, setShowSummaryPreview] = useState(false);

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

  const handleFileDrop = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setIsParsingFile(true);
    setParseError(null);
    setCaseSummary(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/parse-file", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setCaseSummary(data.data.text);
        setSummaryFileName(data.data.filename);
        setShowSummaryPreview(false);
      } else {
        setParseError(data.error || "Error al procesar el archivo.");
      }
    } catch {
      setParseError("Error de conexión al procesar el archivo.");
    } finally {
      setIsParsingFile(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    disabled: isParsingFile,
    multiple: false,
  });

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

    // Translation templates use a dedicated endpoint and send variables flat
    const isTranslation = !!template.endpoint;
    const endpoint = template.endpoint ?? "/api/generate";
    const requestBody = isTranslation
      ? variables
      : {
          template: template.slug,
          variables,
          title: `${template.name} - ${new Date().toLocaleDateString("es-CO")}`,
          ...(aiProvider !== "auto" && { provider: aiProvider }),
          language: docLanguage,
          ...(userInstructions.trim() && { userInstructions: userInstructions.trim() }),
          ...(caseSummary && { caseSummary }),
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(requestBody),
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

  const handleUploadSubmit = async () => {
    await generateDocument({});
  };

  const handleModalClose = () => {
    router.push("/dashboard/documentos");
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

      {/* Mode toggle — hidden for translation templates */}
      {!template.endpoint && (
        <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/50 max-w-xs">
          <button
            type="button"
            onClick={() => { setInputMode("manual"); setCaseSummary(null); setParseError(null); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              inputMode === "manual"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Llenar campos
          </button>
          <button
            type="button"
            onClick={() => setInputMode("upload")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              inputMode === "upload"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Subir resumen
          </button>
        </div>
      )}

      {/* Upload mode UI */}
      {inputMode === "upload" && !template.endpoint && (
        <div className="mx-auto max-w-2xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen del caso</CardTitle>
              <p className="text-xs text-slate-500">
                Sube el archivo con los detalles del caso y la IA extraerá la información para generar el documento.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!caseSummary ? (
                <>
                  <div
                    {...getRootProps()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500"
                    } ${isParsingFile ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <input {...getInputProps()} />
                    {isParsingFile ? (
                      <>
                        <Loader2 className="mb-3 h-10 w-10 animate-spin text-blue-500" />
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Procesando archivo...</p>
                      </>
                    ) : isDragActive ? (
                      <>
                        <Upload className="mb-3 h-10 w-10 text-blue-500" />
                        <p className="text-sm text-blue-600">Suelta el archivo aquí...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="mb-3 h-10 w-10 text-slate-400" />
                        <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                          Arrastra el archivo o haz clic para seleccionar
                        </p>
                        <p className="text-xs text-slate-500">PDF, DOCX, DOC, TXT — máximo 10 MB</p>
                      </>
                    )}
                  </div>
                  {parseError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      {parseError}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* File confirmed */}
                  <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-green-800 dark:text-green-300">{summaryFileName}</p>
                      <p className="text-xs text-green-600 dark:text-green-500">{caseSummary.length.toLocaleString()} caracteres extraídos</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCaseSummary(null); setSummaryFileName(""); setParseError(null); }}
                      className="rounded-full p-1 hover:bg-green-100 dark:hover:bg-green-900/30"
                    >
                      <X className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </button>
                  </div>

                  {/* Collapsible preview */}
                  <button
                    type="button"
                    onClick={() => setShowSummaryPreview((v) => !v)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-700/50"
                  >
                    <span className="font-medium">Vista previa del texto extraído</span>
                    {showSummaryPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {showSummaryPreview && (
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                      <pre className="whitespace-pre-wrap font-sans">{caseSummary.slice(0, 2000)}{caseSummary.length > 2000 ? "\n\n[...]" : ""}</pre>
                    </div>
                  )}
                </>
              )}

              {/* Extra controls for upload mode */}
              {caseSummary && (
                <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Idioma del documento</Label>
                    <Select value={docLanguage} onValueChange={setDocLanguage}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                      <SelectTrigger><SelectValue placeholder="Auto (predeterminado)" /></SelectTrigger>
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
                    <Label htmlFor="userInstructionsUpload" className="text-sm">
                      Instrucciones específicas <span className="text-slate-400 font-normal">(opcional)</span>
                    </Label>
                    <Textarea
                      id="userInstructionsUpload"
                      placeholder="Ej: Incluir cláusula de confidencialidad estricta..."
                      value={userInstructions}
                      onChange={(e) => setUserInstructions(e.target.value)}
                      rows={2}
                      maxLength={2000}
                      className="text-sm resize-none"
                    />
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    El contenido generado por IA es un borrador que debe ser revisado por un profesional legal. Luuc.ai no sustituye el asesoramiento jurídico.
                  </p>
                  <Button
                    type="button"
                    className="w-full"
                    size="lg"
                    onClick={handleUploadSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando documento...</>
                    ) : (
                      "Generar Documento con este Resumen"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual mode — existing form */}
      {(inputMode === "manual" || !!template.endpoint) && (
      <>
      {/* Extra controls: language, AI model, custom instructions — hidden for translation templates */}
      {(() => {
        const isTranslation = !!template.endpoint;
        const extraControls = !isTranslation ? (
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
        ) : null;

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
      </>
      )}

      {/* Document Viewer Modal */}
      {generatedContent && (
        <DocumentViewerModal
          open={showModal}
          onOpenChange={(open) => {
            if (!open) handleModalClose();
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
