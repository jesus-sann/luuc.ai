"use client";

import { useState } from "react";
import { Loader2, Target, Lightbulb, Upload } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { RiskPanel } from "@/components/risk-panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisResponse } from "@/types";

const FOCUS_EXAMPLES = [
  "Identifica riesgos para la empresa en este contrato laboral",
  "Analiza las cláusulas de confidencialidad",
  "Revisa condiciones de terminación y penalidades",
  "Evalúa obligaciones problemáticas para el arrendatario",
];

export default function RevisarPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [focusContext, setFocusContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await readFileContent(selectedFile);

      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          filename: selectedFile.name,
          focusContext: focusContext.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.data);
      } else {
        setError(data.error || "Error analizando documento");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Error leyendo archivo"));
      reader.readAsText(file);
    });
  };

  const handleExampleClick = (example: string) => {
    setFocusContext(example);
  };

  const handleNewAnalysis = () => {
    setSelectedFile(null);
    setFocusContext("");
    setAnalysisResult(null);
    setError(null);
  };

  // After analysis: full-width results
  if (analysisResult) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
              Revisión
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Resultados del Análisis
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {selectedFile?.name}
            </p>
          </div>
          <Button onClick={handleNewAnalysis} variant="outline">
            Nuevo Análisis
          </Button>
        </div>
        <RiskPanel
          score={analysisResult.score}
          findings={analysisResult.riesgos}
          missingClauses={analysisResult.clausulas_faltantes}
          summary={analysisResult.resumen}
          observations={analysisResult.observaciones_generales}
        />
      </div>
    );
  }

  // Before analysis: single centered column
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
          Revisión
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Analiza riesgos en tus documentos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sube un documento legal y recibe un análisis detallado con recomendaciones
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Upload */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-slate-400" />
              <CardTitle className="text-base">Subir Documento</CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Formatos soportados: PDF, DOCX, TXT
            </p>
          </CardHeader>
          <CardContent>
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Focus Context */}
        <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Enfoque del Análisis</CardTitle>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                Opcional
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Ej: Quiero que revises este contrato laboral e identifiques los riesgos para la empresa..."
              rows={3}
              value={focusContext}
              onChange={(e) => setFocusContext(e.target.value)}
              className="resize-none bg-white text-sm"
              disabled={isLoading}
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Ejemplos:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FOCUS_EXAMPLES.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    disabled={isLoading}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analyze Button */}
        {selectedFile && (
          <Button
            onClick={handleAnalyze}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizando documento...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Analizar Documento
              </>
            )}
          </Button>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
