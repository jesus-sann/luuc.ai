"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Download, Copy, Check, FileText } from "lucide-react";
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

export default function TemplateFormPage() {
  const params = useParams();
  const templateSlug = params.template as string;
  const template = getTemplateBySlug(templateSlug);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-slate-500">Plantilla no encontrada</p>
        <Link href="/dashboard/redactar">
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
          template: template.name,
          variables: formData,
          title: `${template.name} - ${new Date().toLocaleDateString("es-CO")}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.data.content);
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

  const handleDownload = () => {
    if (generatedContent) {
      const blob = new Blob([generatedContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.name.replace(/\s+/g, "_")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleNewDocument = () => {
    setGeneratedContent(null);
    setFormData({});
  };

  // After generation: full-width document view
  if (generatedContent) {
    return (
      <div>
        <div className="mb-6">
          <Link
            href="/dashboard/redactar"
            className="mb-3 inline-flex items-center text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Volver
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{template.name}</h1>
                <p className="text-sm text-slate-500">Documento generado</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNewDocument}>
                Nuevo
              </Button>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="max-h-[700px] overflow-auto rounded-lg bg-slate-50 p-5">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                {generatedContent}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Before generation: single centered column
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/redactar"
          className="mb-3 inline-flex items-center text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Volver
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Plantilla
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{template.name}</h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500">{template.description}</p>
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
    </div>
  );
}
