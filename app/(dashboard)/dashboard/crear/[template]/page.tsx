"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Download, Copy, Check, FileText, FileDown } from "lucide-react";
import Link from "next/link";
import { getTemplateBySlug } from "@/lib/templates";
import { Button } from "@/components/ui/button";
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
  const templateSlug = params.template as string;
  const template = getTemplateBySlug(templateSlug);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedDocId, setGeneratedDocId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiProvider, setAiProvider] = useState("auto");
  const [docLanguage, setDocLanguage] = useState("es");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: template.slug,
          variables: formData,
          title: `${template.name} - ${new Date().toLocaleDateString("es-CO")}`,
          ...(aiProvider !== "auto" && { provider: aiProvider }),
          language: docLanguage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.data.content);
        setGeneratedDocId(data.data.id || null);
      } else {
        alert("Error generando documento: " + data.error);
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (generatedContent) {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (format: "docx" | "pdf") => {
    if (generatedDocId) {
      const link = document.createElement("a");
      link.href = `/api/documents/${generatedDocId}/export?format=${format}`;
      link.click();
    }
  };

  const handleNewDocument = () => {
    setGeneratedContent(null);
    setGeneratedDocId(null);
    setFormData({});
    setAiProvider("auto");
    setDocLanguage("es");
  };

  if (generatedContent) {
    return (
      <div>
        <div className="mb-6">
          <Link href="/dashboard/crear" className="mb-3 inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Volver
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">{template.name}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Documento generado</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("docx")}>
                <FileDown className="h-4 w-4 mr-1" /> DOCX
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("pdf")}>
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleNewDocument}>
                Nuevo
              </Button>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="max-h-[700px] overflow-auto rounded-lg bg-slate-50 p-5 dark:bg-slate-800">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {generatedContent}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    </div>
  );
}
