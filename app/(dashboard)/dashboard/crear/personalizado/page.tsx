"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DocumentViewerModal } from "@/components/document-viewer-modal";
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

export default function CreacionPersonalizadaPage() {
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [aiProvider, setAiProvider] = useState("auto");
  const [docLanguage, setDocLanguage] = useState("es");
  const [partes, setPartes] = useState("");
  const [duracion, setDuracion] = useState("");
  const [valor, setValor] = useState("");
  const [jurisdiccion, setJurisdiccion] = useState("");
  const [detallesAdicionales, setDetallesAdicionales] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedDocId, setGeneratedDocId] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
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
          ...(aiProvider !== "auto" && { provider: aiProvider }),
          language: docLanguage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.data.content);
        setGeneratedDocId(data.data.id || null);
        setGeneratedTitle(data.data.title || "Documento Personalizado");
        setShowModal(true);
      } else {
        setError(data.error || "Error generando documento");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewDocument = () => {
    setGeneratedContent(null);
    setGeneratedDocId(null);
    setShowModal(false);
    setTipoDocumento("");
    setDescripcion("");
    setPartes("");
    setDuracion("");
    setValor("");
    setJurisdiccion("");
    setDetallesAdicionales("");
    setAiProvider("auto");
    setDocLanguage("es");
    setError(null);
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/crear"
          className="mb-3 inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Volver
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-600">
              Personalizado
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Creación Personalizada
            </h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Describe qué documento necesitas y la IA generará un borrador profesional
        </p>
      </div>

      <div className="mb-6 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium text-blue-600">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">1</span>
          Describe
        </span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 dark:bg-slate-700">2</span>
          Genera
        </span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 dark:bg-slate-700">3</span>
          Descarga
        </span>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Describe tu Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="tipo" className="text-sm">
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
                            — {type.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="descripcion" className="text-sm">
                  ¿Qué documento necesitas? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Ej: Necesito un contrato de arrendamiento comercial para un local en Bogotá..."
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="text-sm"
                  required
                />
                <p className="text-xs text-slate-400">
                  Sé lo más específico posible sobre el propósito y características.
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Información adicional (opcional)
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="partes" className="text-sm">Partes involucradas</Label>
                    <Input id="partes" placeholder="Ej: Empresa ABC y Juan Pérez" value={partes} onChange={(e) => setPartes(e.target.value)} className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="duracion" className="text-sm">Duración / Vigencia</Label>
                    <Input id="duracion" placeholder="Ej: 2 años, indefinido" value={duracion} onChange={(e) => setDuracion(e.target.value)} className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="valor" className="text-sm">Valor / Monto</Label>
                    <Input id="valor" placeholder="Ej: $5,000,000 COP" value={valor} onChange={(e) => setValor(e.target.value)} className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jurisdiccion" className="text-sm">Jurisdicción</Label>
                    <Select value={jurisdiccion} onValueChange={setJurisdiccion}>
                      <SelectTrigger><SelectValue placeholder="Selecciona país" /></SelectTrigger>
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
                <div className="mt-3 space-y-1.5">
                  <Label htmlFor="detalles" className="text-sm">Cláusulas o detalles específicos</Label>
                  <Textarea id="detalles" placeholder="Ej: Incluir cláusula de confidencialidad..." rows={2} value={detallesAdicionales} onChange={(e) => setDetallesAdicionales(e.target.value)} className="text-sm" />
                </div>
              </div>

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

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                El contenido generado por IA es un borrador que debe ser revisado por un profesional legal. Luuc.ai no sustituye el asesoramiento jurídico.
              </p>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || !tipoDocumento || !descripcion}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando borrador...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Generar Borrador</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

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
        />
      )}
    </div>
  );
}
