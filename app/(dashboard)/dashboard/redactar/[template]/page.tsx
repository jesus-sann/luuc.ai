"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Download, Copy, Check } from "lucide-react";
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
  const router = useRouter();
  const templateSlug = params.template as string;
  const template = getTemplateBySlug(templateSlug);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!template) {
    return (
      <div className="text-center">
        <p className="text-slate-600">Template no encontrado</p>
        <Link href="/dashboard/redactar">
          <Button className="mt-4">Volver</Button>
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
    } catch (error) {
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/redactar"
          className="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a templates
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">{template.name}</h1>
        <p className="mt-2 text-slate-600">{template.description}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {template.variables.map((variable) => (
                <div key={variable.name} className="space-y-2">
                  <Label htmlFor={variable.name}>
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
                      onChange={(e) =>
                        handleInputChange(variable.name, e.target.value)
                      }
                    />
                  )}

                  {variable.type === "textarea" && (
                    <Textarea
                      id={variable.name}
                      placeholder={variable.placeholder}
                      required={variable.required}
                      rows={4}
                      value={formData[variable.name] || ""}
                      onChange={(e) =>
                        handleInputChange(variable.name, e.target.value)
                      }
                    />
                  )}

                  {variable.type === "date" && (
                    <Input
                      id={variable.name}
                      type="date"
                      required={variable.required}
                      value={formData[variable.name] || ""}
                      onChange={(e) =>
                        handleInputChange(variable.name, e.target.value)
                      }
                    />
                  )}

                  {variable.type === "select" && variable.options && (
                    <Select
                      value={formData[variable.name] || ""}
                      onValueChange={(value) =>
                        handleInputChange(variable.name, value)
                      }
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

              <Button type="submit" className="w-full" disabled={isLoading}>
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

        {/* Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Documento Generado</CardTitle>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="max-h-[600px] overflow-auto rounded-lg bg-slate-50 p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                  {generatedContent}
                </pre>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-sm text-slate-500">
                  Completa el formulario para generar el documento
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
