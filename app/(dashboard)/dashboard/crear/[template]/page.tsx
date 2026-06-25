"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Loader2,
  FileText,
  AlertCircle,
  Upload,
  Edit3,
  CheckCircle2,
  X,
} from "lucide-react";
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
import { extractTextFromFile } from "@/lib/client-file-parser";

const DOC_LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

export default function TemplateFormPage() {
  const params = useParams();
  const router = useRouter();
  const templateSlug = params.template as string;
  const template = getTemplateBySlug(templateSlug);

  // Document generation state
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedDocId, setGeneratedDocId] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [docLanguage, setDocLanguage] = useState("es");
  const [userInstructions, setUserInstructions] = useState("");

  // Input mode: manual | case-builder
  const [inputMode, setInputMode] = useState<"manual" | "case-builder">("manual");

  // Case Builder — Step 1 (build) / Step 2 (generate)
  type ParsedFile = { name: string; text: string };
  const [cbStep, setCbStep] = useState<0 | 1>(0);
  const [cbParsedFiles, setCbParsedFiles] = useState<ParsedFile[]>([]);
  const [cbParsingFile, setCbParsingFile] = useState(false);
  const [cbBrief, setCbBrief] = useState("");
  const [cbIsAnalyzing, setCbIsAnalyzing] = useState(false);
  const [cbAnalysisError, setCbAnalysisError] = useState<string | null>(null);
  const [cbCaseSummary, setCbCaseSummary] = useState<string | null>(null);

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

  // Case Builder dropzone: parse each file via /api/parse-file immediately on drop
  // so we only send extracted text (not binary) to /api/case-builder — avoids 413.
  const { getRootProps: getCbRootProps, getInputProps: getCbInputProps, isDragActive: isCbDragActive } = useDropzone({
    onDrop: async (files: File[]) => {
      const slots = Math.max(0, 5 - cbParsedFiles.length);
      for (const file of files.slice(0, slots)) {
        setCbParsingFile(true);
        setCbAnalysisError(null);
        try {
          // PDFs are parsed entirely in the browser — no upload, no size limit.
          // DOCX/DOC fall back to /api/parse-file (typically small).
          const text = await extractTextFromFile(file);
          if (text.trim().length < 30) {
            setCbAnalysisError(`"${file.name}" no tiene texto extraíble (¿es una imagen escaneada?). Escribe los datos en el brief.`);
          } else {
            setCbParsedFiles((prev) => [...prev, { name: file.name, text: text.trim() }].slice(0, 5));
          }
        } catch (err) {
          setCbAnalysisError(`${file.name}: ${err instanceof Error ? err.message : "Error al procesar"}`);
        } finally {
          setCbParsingFile(false);
        }
      }
    },
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    multiple: true,
    disabled: cbIsAnalyzing || cbParsingFile,
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

  // Core generation — accepts an optional case summary override (from Case Builder step 1)
  const generateDocument = async (variables: Record<string, string>, caseSummaryOverride?: string) => {
    setIsLoading(true);
    setGenerateError(null);
    setGeneratedContent(null);

    const isTranslation = !!template.endpoint;
    const endpoint = template.endpoint ?? "/api/generate";
    const requestBody = isTranslation
      ? variables
      : {
          template: template.slug,
          variables,
          title: `${template.name} - ${new Date().toLocaleDateString("es-CO")}`,
          language: docLanguage,
          ...(userInstructions.trim() && { userInstructions: userInstructions.trim() }),
          ...(caseSummaryOverride && { caseSummary: caseSummaryOverride }),
        };

    if (isTranslation) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90_000);
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
        setGenerateError(
          err instanceof Error && err.name === "AbortError"
            ? "La generación tardó demasiado. Intenta de nuevo o usa un documento más corto."
            : "Error de conexión. Verifica tu internet e intenta de nuevo."
        );
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
      return;
    }

    // SSE streaming path
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        const errMsg = (data as { error?: string }).error || "Error al generar el documento. Intenta de nuevo.";
        // 403 = plan limit — surface it clearly
        setGenerateError(response.status === 403
          ? `Plan limitado: ${errMsg}`
          : errMsg
        );
        return;
      }

      const reader = response.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      // Accumulate locally — set state once on "done" so the modal always opens with the full document.
      let accumulated = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as {
              type: string;
              text?: string;
              id?: string;
              title?: string;
              usedCompanyContext?: boolean;
              message?: string;
            };

            if (event.type === "done") {
              setGeneratedContent(accumulated);
              setGeneratedDocId(event.id ?? null);
              setGeneratedTitle(event.title || template.name);
              setShowModal(true);
            } else if (event.type === "delta") {
              accumulated += event.text ?? "";
            } else if (event.type === "error") {
              setGenerateError(event.message || "Error al generar el documento. Intenta de nuevo.");
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch (err) {
      setGenerateError(
        err instanceof Error && err.name === "AbortError"
          ? "La generación tardó demasiado. Intenta de nuevo o usa un documento más corto."
          : "Error de conexión. Verifica tu internet e intenta de nuevo."
      );
    } finally {
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

  // Case Builder Step 1: send extracted text + brief as JSON (no binary upload → no 413)
  const handleAnalyzeCase = async () => {
    if (!cbBrief.trim() && cbParsedFiles.length === 0) {
      setCbAnalysisError("Sube al menos un formulario o escribe un brief del caso.");
      return;
    }
    setCbIsAnalyzing(true);
    setCbAnalysisError(null);

    const formsText = cbParsedFiles
      .map((f) => `--- ${f.name} ---\n${f.text}`)
      .join("\n\n");

    try {
      const res = await fetch("/api/case-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: cbBrief, formsText, template: templateSlug }),
      });
      const text = await res.text();
      let data: { success: boolean; data?: { case_summary: string }; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        setCbAnalysisError(`Error del servidor (${res.status}). Intenta de nuevo.`);
        return;
      }
      if (data.success) {
        setCbCaseSummary(data.data!.case_summary);
        setCbStep(1);
      } else {
        setCbAnalysisError(data.error || "Error al analizar el caso.");
      }
    } catch (err) {
      setCbAnalysisError(`Error de conexión: ${err instanceof Error ? err.message : "desconocido"}`);
    } finally {
      setCbIsAnalyzing(false);
    }
  };

  const handleModalClose = () => {
    router.push("/dashboard/documentos");
  };

  const resetCaseBuilder = () => {
    setCbStep(0);
    setCbParsedFiles([]);
    setCbParsingFile(false);
    setCbBrief("");
    setCbIsAnalyzing(false);
    setCbAnalysisError(null);
    setCbCaseSummary(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/crear"
          className="mb-3 inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {template.name}
            </h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{template.description}</p>
      </div>

      {generateError && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
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
            onClick={() => setInputMode("manual")}
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
            onClick={() => { setInputMode("case-builder"); resetCaseBuilder(); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              inputMode === "case-builder"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            Case Builder
          </button>
        </div>
      )}

      {/* ─── Case Builder ──────────────────────────────────────────── */}
      {inputMode === "case-builder" && !template.endpoint && (
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                cbStep === 0 ? "bg-blue-600 text-white" : "bg-green-600 text-white"
              }`}
            >
              {cbStep === 0 ? "1" : <CheckCircle2 className="h-4 w-4" />}
            </div>
            <span
              className={`text-sm font-medium ${
                cbStep === 0 ? "text-slate-900 dark:text-white" : "text-green-600 dark:text-green-400"
              }`}
            >
              Construir caso
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 mx-1" />
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                cbStep === 1
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
              }`}
            >
              2
            </div>
            <span
              className={`text-sm font-medium ${
                cbStep === 1
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              Generar documento
            </span>
          </div>

          {/* ── Step 1: Upload forms + brief ── */}
          {cbStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos del caso</CardTitle>
                <p className="text-xs text-slate-500">
                  Sube los formularios del caso (I-130, I-485, contratos, etc.) y escribe un brief. La IA extraerá y confirmará la información clave antes de generar el documento.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Multi-file dropzone */}
                <div>
                  <Label className="mb-1.5 block text-sm">
                    Formularios / Documentos{" "}
                    <span className="font-normal text-slate-400">(hasta 5 archivos, opcional)</span>
                  </Label>
                  <div
                    {...getCbRootProps()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                      isCbDragActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500"
                    } ${cbIsAnalyzing || cbParsingFile ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <input {...getCbInputProps()} />
                    {cbParsingFile ? (
                      <>
                        <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-500" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Procesando archivo...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="mb-2 h-8 w-8 text-slate-400" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {isCbDragActive ? "Suelta los archivos aquí..." : "Arrastra formularios o haz clic"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">PDF, DOCX, TXT — hasta 5 archivos</p>
                      </>
                    )}
                  </div>

                  {cbParsedFiles.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {cbParsedFiles.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs dark:border-green-800 dark:bg-green-950/20"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                          <span className="flex-1 truncate text-slate-700 dark:text-slate-300">{f.name}</span>
                          <span className="shrink-0 text-slate-400">{f.text.length.toLocaleString()} chars</span>
                          <button
                            type="button"
                            onClick={() => setCbParsedFiles((prev) => prev.filter((_, j) => j !== i))}
                            className="rounded-full p-0.5 hover:bg-green-100 dark:hover:bg-green-900/30"
                          >
                            <X className="h-3 w-3 text-slate-500" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Case brief */}
                <div className="space-y-1.5">
                  <Label htmlFor="cbBrief" className="text-sm">
                    Brief del caso
                  </Label>
                  <Textarea
                    id="cbBrief"
                    placeholder="Ej: María García (colombiana) peticionada por su esposo John Smith (USC). Casados 15/03/2023 en NYC. Presentando I-485 con I-130 aprobado. Sin historial criminal ni solicitudes previas."
                    value={cbBrief}
                    onChange={(e) => setCbBrief(e.target.value)}
                    rows={4}
                    maxLength={3000}
                    disabled={cbIsAnalyzing}
                    className="resize-none text-sm"
                  />
                  <p className="text-xs text-slate-400">
                    Describe brevemente: partes, formularios, fechas, base legal. La IA completará el resto desde los documentos subidos.
                  </p>
                </div>

                {cbAnalysisError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {cbAnalysisError}
                  </div>
                )}

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleAnalyzeCase}
                  disabled={cbIsAnalyzing || cbParsingFile || (!cbBrief.trim() && cbParsedFiles.length === 0)}
                >
                  {cbIsAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analizando caso...
                    </>
                  ) : (
                    <>
                      Analizar caso
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Step 2: Review confirmed summary + generate ── */}
          {cbStep === 1 && cbCaseSummary !== null && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Resumen confirmado por IA
                    </CardTitle>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Revisa la información extraída. Puedes editarla antes de generar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setCbStep(0); setCbCaseSummary(null); }}
                    className="flex shrink-0 items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    <Edit3 className="h-3 w-3" />
                    Volver a editar
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Editable summary */}
                <Textarea
                  value={cbCaseSummary}
                  onChange={(e) => setCbCaseSummary(e.target.value)}
                  rows={12}
                  className="resize-none border-slate-200 bg-slate-50 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />

                {/* Language */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Idioma del documento</Label>
                  <Select value={docLanguage} onValueChange={setDocLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOC_LANGUAGES.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Extra instructions */}
                <div className="space-y-1.5">
                  <Label htmlFor="cbInstructions" className="text-sm">
                    Instrucciones adicionales{" "}
                    <span className="font-normal text-slate-400">(opcional)</span>
                  </Label>
                  <Textarea
                    id="cbInstructions"
                    placeholder="Ej: Enfatizar historial de viajes, incluir cita a regulación 8 CFR..."
                    value={userInstructions}
                    onChange={(e) => setUserInstructions(e.target.value)}
                    rows={2}
                    maxLength={2000}
                    className="resize-none text-sm"
                  />
                </div>

                {generateError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {generateError}
                  </div>
                )}

                <p className="text-center text-xs text-slate-400">
                  El contenido generado por IA es un borrador que debe ser revisado por un profesional legal.
                </p>

                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={() => generateDocument({}, cbCaseSummary ?? undefined)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando documento...
                    </>
                  ) : (
                    "Generar Documento"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── Manual / Wizard mode ──────────────────────────────────── */}
      {(inputMode === "manual" || !!template.endpoint) && (
        <>
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
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="userInstructions" className="text-sm">
                    Instrucciones específicas{" "}
                    <span className="font-normal text-slate-400">(opcional)</span>
                  </Label>
                  <Textarea
                    id="userInstructions"
                    placeholder="Ej: Incluir cláusula de confidencialidad estricta, usar lenguaje formal corporativo, enfatizar penalidades por incumplimiento..."
                    value={userInstructions}
                    onChange={(e) => setUserInstructions(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="resize-none text-sm"
                  />
                  <p className="text-xs text-slate-400">
                    Guía a la IA con instrucciones adicionales para personalizar el documento.
                  </p>
                </div>
              </div>
            ) : null;

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

            return (
              <div className="mx-auto max-w-2xl">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Información del Documento</CardTitle>
                    <p className="text-xs text-slate-500">
                      {template.variables.length} campos requeridos
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {template.variables.map((variable) => (
                        <div key={variable.name} className="space-y-1.5">
                          <Label htmlFor={variable.name} className="text-sm">
                            {variable.label}
                            {variable.required && (
                              <span className="ml-1 text-red-500">*</span>
                            )}
                          </Label>

                          {variable.type === "text" && (
                            <Input
                              id={variable.name}
                              placeholder={variable.placeholder}
                              required={variable.required}
                              value={formData[variable.name] || ""}
                              onChange={(e) => handleInputChange(variable.name, e.target.value)}
                              className="text-sm"
                            />
                          )}

                          {variable.type === "textarea" && (
                            <Textarea
                              id={variable.name}
                              placeholder={variable.placeholder}
                              required={variable.required}
                              rows={3}
                              value={formData[variable.name] || ""}
                              onChange={(e) => handleInputChange(variable.name, e.target.value)}
                              className="text-sm"
                            />
                          )}

                          {variable.type === "date" && (
                            <Input
                              id={variable.name}
                              type="date"
                              required={variable.required}
                              value={formData[variable.name] || ""}
                              onChange={(e) => handleInputChange(variable.name, e.target.value)}
                              className="text-sm"
                            />
                          )}

                          {variable.type === "select" && variable.options && (
                            <Select
                              value={formData[variable.name] || ""}
                              onValueChange={(value) => handleInputChange(variable.name, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una opción" />
                              </SelectTrigger>
                              <SelectContent>
                                {variable.options.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      ))}

                      {extraControls}

                      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                        El contenido generado por IA es un borrador que debe ser revisado por un profesional legal. Luuc.ai no sustituye el asesoramiento jurídico.
                      </p>

                      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generando documento...
                          </>
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
