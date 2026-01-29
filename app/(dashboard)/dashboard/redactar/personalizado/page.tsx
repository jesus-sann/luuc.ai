"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Download, Copy, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DOCUMENT_TYPES = [
  { value: "contrato", label: "Contrato", description: "Acuerdos legales entre partes" },
  { value: "carta", label: "Carta Formal", description: "Comunicaciones oficiales" },
  { value: "politica", label: "Política / Reglamento", description: "Normativas internas" },
  { value: "acta", label: "Acta / Acuerdo", description: "Registro de decisiones" },
  { value: "poder", label: "Poder / Autorización", description: "Delegación de facultades" },
  { value: "memorando", label: "Memorando", description: "Comunicación interna" },
  { value: "otro", label: "Otro documento legal", description: "Documentos especializados" },
];

export default function RedaccionPersonalizadaPage() {
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [partes, setPartes] = useState("");
  const [duracion, setDuracion] = useState("");
  const [valor, setValor] = useState("");
  const [jurisdiccion, setJurisdiccion] = useState("");
  const [detallesAdicionales, setDetallesAdicionales] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoDocumento,
          descripcion,
          partes,
          duracion,
          valor,
          jurisdiccion,
          detallesAdicionales,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.data.content);
      } else {
        setError(data.error || "Error generando documento");
      }
    } catch (err) {
      setError("Error de conexión. Intenta de nuevo.");
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
      a.download = `documento_personalizado_${new Date().toISOString().split("T")[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleNewDocument = () => {
    setGeneratedContent(null);
    setTipoDocumento("");
    setDescripcion("");
    setPartes("");
    setDuracion("");
    setValor("");
    setJurisdiccion("");
    setDetallesAdicionales("");
    setError(null);
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
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Redacción Personalizada</h1>
            <p className="mt-1 text-slate-600">
              Crea documentos legales personalizados describiendo lo que necesitas
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Esta herramienta está diseñada exclusivamente para redacción de documentos legales y corporativos.</strong>
          {" "}Describe el tipo de documento que necesitas y te generaremos un borrador profesional.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Describe tu Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Documento */}
              <div className="space-y-2">
                <Label htmlFor="tipo">
                  Tipo de Documento <span className="text-red-500">*</span>
                </Label>
                <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <span className="font-medium">{type.label}</span>
                          <span className="ml-2 text-xs text-slate-500">
                            - {type.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descripción Principal */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">
                  ¿Qué documento necesitas? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Ej: Necesito un contrato de arrendamiento comercial para un local en Bogotá, donde el arrendador es una empresa y el arrendatario es una persona natural. Debe incluir opción de compra al finalizar el contrato..."
                  rows={5}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500">
                  Sé lo más específico posible sobre el propósito y características del documento.
                </p>
              </div>

              {/* Campos Opcionales */}
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="mb-4 text-sm font-medium text-slate-700">
                  Información adicional (opcional)
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="partes">Partes involucradas</Label>
                    <Input
                      id="partes"
                      placeholder="Ej: Empresa ABC y Juan Pérez"
                      value={partes}
                      onChange={(e) => setPartes(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duracion">Duración / Vigencia</Label>
                    <Input
                      id="duracion"
                      placeholder="Ej: 2 años, indefinido"
                      value={duracion}
                      onChange={(e) => setDuracion(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor / Monto</Label>
                    <Input
                      id="valor"
                      placeholder="Ej: $5,000,000 COP"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jurisdiccion">Jurisdicción</Label>
                    <Select value={jurisdiccion} onValueChange={setJurisdiccion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona país" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Colombia">Colombia</SelectItem>
                        <SelectItem value="México">México</SelectItem>
                        <SelectItem value="Argentina">Argentina</SelectItem>
                        <SelectItem value="Chile">Chile</SelectItem>
                        <SelectItem value="Perú">Perú</SelectItem>
                        <SelectItem value="España">España</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="detalles">Cláusulas o detalles específicos</Label>
                  <Textarea
                    id="detalles"
                    placeholder="Ej: Incluir cláusula de confidencialidad, penalidad por incumplimiento del 10%, renovación automática..."
                    rows={3}
                    value={detallesAdicionales}
                    onChange={(e) => setDetallesAdicionales(e.target.value)}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !tipoDocumento || !descripcion}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando borrador...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar Borrador
                  </>
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
                  <Button variant="outline" size="sm" onClick={handleNewDocument}>
                    Nuevo
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
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200">
                <Sparkles className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm text-slate-500">
                  Describe tu documento para generar un borrador
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  El borrador aparecerá aquí
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
