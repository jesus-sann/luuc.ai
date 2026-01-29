"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Target, Lightbulb } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { RiskPanel } from "@/components/risk-panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisResponse } from "@/types";

const FOCUS_EXAMPLES = [
  "Identifica riesgos para la empresa en este contrato laboral a término fijo",
  "Analiza si las cláusulas de confidencialidad son suficientemente protectoras",
  "Revisa las condiciones de terminación y penalidades",
  "Evalúa el desempeño del empleado según estas actas de 1:1",
  "Identifica obligaciones que podrían ser problemáticas para el arrendatario",
];

export default function RevisarPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [focusContext, setFocusContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(
    null
  );
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
      // Read file content
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
    } catch (err) {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };

      reader.onerror = () => {
        reject(new Error("Error leyendo archivo"));
      };

      // For now, read as text. In production, you'd use pdf-parse or mammoth
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Revisar Documento</h1>
        <p className="mt-2 text-slate-600">
          Sube un documento para analizar riesgos y obtener recomendaciones
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subir Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            </CardContent>
          </Card>

          {/* Focus Context Box */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">Enfoque del Análisis</CardTitle>
              </div>
              <p className="text-sm text-slate-600">
                Describe qué aspectos específicos quieres que revisemos (opcional)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Ej: Quiero que revises este contrato laboral e identifiques los riesgos a futuro para la empresa, especialmente en cláusulas de terminación..."
                  rows={4}
                  value={focusContext}
                  onChange={(e) => setFocusContext(e.target.value)}
                  className="resize-none bg-white"
                  disabled={isLoading}
                />
              </div>

              {/* Example Suggestions */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Ejemplos de enfoques:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_EXAMPLES.slice(0, 3).map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      disabled={isLoading}
                    >
                      {example.length > 50 ? example.substring(0, 50) + "..." : example}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analyze Button */}
          {selectedFile && !analysisResult && (
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

          {analysisResult && (
            <Button
              onClick={handleNewAnalysis}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Nuevo Análisis
            </Button>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Instructions */}
          {!analysisResult && !selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle>Instrucciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>1. Sube un documento en formato PDF, DOCX o TXT</p>
                <p>2. <strong>(Opcional)</strong> Especifica el enfoque del análisis</p>
                <p>3. Haz clic en "Analizar Documento"</p>
                <p>4. Revisa el análisis de riesgos y las recomendaciones</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div>
          {analysisResult ? (
            <RiskPanel
              score={analysisResult.score}
              findings={analysisResult.riesgos}
              missingClauses={analysisResult.clausulas_faltantes}
              summary={analysisResult.resumen}
              observations={analysisResult.observaciones_generales}
            />
          ) : (
            <Card className="h-full min-h-[400px]">
              <CardContent className="flex h-full flex-col items-center justify-center p-8">
                <div className="mb-4 rounded-full bg-slate-100 p-4">
                  <Target className="h-8 w-8 text-slate-400" />
                </div>
                <p className="mb-2 text-center text-sm font-medium text-slate-700">
                  Los resultados del análisis aparecerán aquí
                </p>
                <p className="text-center text-xs text-slate-500">
                  Sube un documento y opcionalmente especifica qué aspectos revisar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
