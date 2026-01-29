"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Upload,
  File,
  MoreVertical,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CompanyDocument {
  id: string;
  company_id: string;
  title: string;
  content: string;
  doc_type: string | null;
  category: string;
  word_count: number;
  created_at: string;
}

const docTypes = [
  { value: "contrato", label: "Contrato" },
  { value: "acuerdo", label: "Acuerdo" },
  { value: "nda", label: "NDA / Confidencialidad" },
  { value: "laboral", label: "Documento Laboral" },
  { value: "corporativo", label: "Documento Corporativo" },
  { value: "litigio", label: "Escrito de Litigio" },
  { value: "otro", label: "Otro" },
];

const categories = [
  { value: "aprobado", label: "Documento Aprobado" },
  { value: "plantilla", label: "Plantilla Base" },
  { value: "ejemplo", label: "Ejemplo de Estilo" },
];

export default function DocumentosReferenciaPage() {
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<CompanyDocument | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    docType: "",
    category: "aprobado",
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/company/documents");
      const data = await response.json();

      if (data.success) {
        setDocuments(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/company/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Error al subir documento");
        return;
      }

      setSuccess("Documento subido exitosamente");
      setDocuments([data.data, ...documents]);
      setFormData({
        title: "",
        content: "",
        docType: "",
        category: "aprobado",
      });
      setShowForm(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("¿Estás seguro de eliminar este documento?")) return;

    setDeleting(docId);
    setError("");

    try {
      const response = await fetch(`/api/company/documents?docId=${docId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Error al eliminar");
        return;
      }

      setDocuments(documents.filter((d) => d.id !== docId));
      setSuccess("Documento eliminado");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setDeleting(null);
      setOpenMenuId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDocTypeLabel = (value: string | null) => {
    if (!value) return "Sin tipo";
    const found = docTypes.find((t) => t.value === value);
    return found?.label || value;
  };

  const getCategoryLabel = (value: string) => {
    const found = categories.find((c) => c.value === value);
    return found?.label || value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/configuracion"
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Documentos de Referencia
            </h1>
            <p className="text-slate-500">
              Sube documentos aprobados para que la IA aprenda tu estilo
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Subir Documento
            </>
          )}
        </Button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-600">
          <CheckCircle className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* Formulario de subida */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir Nuevo Documento
            </CardTitle>
            <CardDescription>
              Pega el contenido de un documento aprobado para que la IA aprenda
              tu estilo de redacción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del documento *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Contrato de Servicios Profesionales"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docType">Tipo de documento</Label>
                  <Select
                    value={formData.docType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, docType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {docTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido del documento *</Label>
                <Textarea
                  id="content"
                  placeholder="Pega aquí el contenido completo del documento..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={12}
                  required
                />
                <p className="text-xs text-slate-500">
                  Mínimo 100 caracteres. Actual: {formData.content.length}{" "}
                  caracteres
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Documento
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Info sobre documentos de referencia */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">¿Para qué sirven los documentos de referencia?</p>
              <p className="mt-1 text-blue-700">
                La IA analiza estos documentos para aprender el estilo, formato
                y terminología que usa tu firma. Entre más documentos subas,
                mejor será la calidad de los documentos generados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <File className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 font-medium text-slate-900">
              No hay documentos de referencia
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Sube tu primer documento para comenzar
            </p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Subir Documento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:border-slate-300">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-green-100 p-2">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{doc.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">
                          {getDocTypeLabel(doc.doc_type)}
                        </span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                          {getCategoryLabel(doc.category)}
                        </span>
                        <span>{doc.word_count} palabras</span>
                        <span>•</span>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Menú de acciones */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        setOpenMenuId(openMenuId === doc.id ? null : doc.id)
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>

                    {openMenuId === doc.id && (
                      <>
                        {/* Overlay para cerrar el menú */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        {/* Menú desplegable */}
                        <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            onClick={() => {
                              setViewingDoc(doc);
                              setOpenMenuId(null);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            Ver contenido
                          </button>
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(doc.id)}
                            disabled={deleting === doc.id}
                          >
                            {deleting === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de vista previa */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-semibold text-slate-900">{viewingDoc.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingDoc(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                {viewingDoc.content}
              </pre>
            </div>
            <div className="border-t p-4">
              <Button variant="outline" onClick={() => setViewingDoc(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
