"use client";

import { useState } from "react";
import { Loader2, Target, Lightbulb, Upload } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { AnalysisModal } from "@/components/analysis-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisResponse } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/use-translations";

const DOC_LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];


export default function RevisarPage() {
  const t = useTranslations();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [focusContext, setFocusContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisLanguage, setAnalysisLanguage] = useState("es");

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
      // Parse file server-side (supports PDF, DOCX, TXT)
      const formData = new FormData();
      formData.append("file", selectedFile);

      const parseRes = await fetch("/api/parse-file", {
        method: "POST",
        body: formData,
      });
      const parseData = await parseRes.json();

      if (!parseData.success) {
        setError(parseData.error || t("revisar.errorReading"));
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: parseData.data.text,
          filename: selectedFile.name,
          focusContext: focusContext.trim() || undefined,
          language: analysisLanguage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.data);
        setShowModal(true);
      } else {
        setError(data.error || t("revisar.errorAnalyzing"));
      }
    } catch {
      setError(t("revisar.errorConnection"));
    } finally {
      setIsLoading(false);
    }
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
    <>
    {/* Analysis Results Modal */}
    {analysisResult && (
      <AnalysisModal
        open={showModal}
        onOpenChange={(open) => {
          setShowModal(open);
          if (!open) handleNewAnalysis();
        }}
        result={analysisResult}
        filename={selectedFile?.name || "Documento"}
      />
    )}

    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
          {t("revisar.badge")}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("revisar.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("revisar.description")}
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Upload */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-slate-400" />
              <CardTitle className="text-base">{t("revisar.uploadTitle")}</CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              {t("revisar.uploadFormats")}
            </p>
          </CardHeader>
          <CardContent>
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Focus Context */}
        <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-900 dark:from-blue-950/20 dark:to-slate-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">{t("revisar.focusTitle")}</CardTitle>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {t("revisar.focusOptional")}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder={t("revisar.focusPlaceholder")}
              rows={3}
              value={focusContext}
              onChange={(e) => setFocusContext(e.target.value)}
              className="resize-none bg-white text-sm dark:bg-slate-800"
              disabled={isLoading}
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Lightbulb className="h-3.5 w-3.5" />
                <span>{t("revisar.focusExamples")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[t("revisar.example1"), t("revisar.example2"), t("revisar.example3"), t("revisar.example4")].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                    disabled={isLoading}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Language */}
        <div className="space-y-1.5">
          <Label className="text-sm">{t("revisar.analysisLanguage")}</Label>
          <Select value={analysisLanguage} onValueChange={setAnalysisLanguage}>
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

        {/* Disclaimer */}
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          {t("disclaimer.ai")}
        </p>

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
                {t("revisar.analyzing")}
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                {t("revisar.analyzeButton")}
              </>
            )}
          </Button>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
