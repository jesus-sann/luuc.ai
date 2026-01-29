"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle,
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

interface Company {
  id: string;
  name: string;
  industry: string | null;
  description: string | null;
  document_rules: {
    style?: string;
    tone?: string;
    customInstructions?: string;
  } | null;
  status: string;
}

const industries = [
  { value: "legal", label: "Firma de Abogados" },
  { value: "corporate", label: "Departamento Legal Corporativo" },
  { value: "fintech", label: "Fintech / Servicios Financieros" },
  { value: "tech", label: "Tecnología" },
  { value: "healthcare", label: "Salud" },
  { value: "real_estate", label: "Inmobiliario" },
  { value: "consulting", label: "Consultoría" },
  { value: "other", label: "Otro" },
];

const documentStyles = [
  { value: "formal", label: "Formal - Lenguaje muy técnico y tradicional" },
  { value: "semiformal", label: "Semi-formal - Profesional pero accesible" },
  { value: "modern", label: "Moderno - Claro y directo" },
];

export default function EmpresaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isNewCompany, setIsNewCompany] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    description: "",
    style: "formal",
    tone: "",
    customInstructions: "",
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch("/api/company/setup");
        const data = await response.json();

        if (data.success && data.data) {
          const company = data.data as Company;
          setFormData({
            name: company.name || "",
            industry: company.industry || "",
            description: company.description || "",
            style: company.document_rules?.style || "formal",
            tone: company.document_rules?.tone || "",
            customInstructions: company.document_rules?.customInstructions || "",
          });
          setIsNewCompany(false);
        } else {
          setIsNewCompany(true);
        }
      } catch (error) {
        console.error("Error fetching company:", error);
        setIsNewCompany(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const method = isNewCompany ? "POST" : "PUT";
      const body = {
        name: formData.name,
        industry: formData.industry,
        description: formData.description,
        document_rules: {
          style: formData.style,
          tone: formData.tone,
          customInstructions: formData.customInstructions,
        },
      };

      const response = await fetch("/api/company/setup", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Error al guardar");
        return;
      }

      setSuccess(isNewCompany ? "Empresa creada exitosamente" : "Cambios guardados");
      setIsNewCompany(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
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
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/configuracion"
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isNewCompany ? "Configurar Empresa" : "Mi Empresa"}
          </h1>
          <p className="text-slate-500">
            {isNewCompany
              ? "Configura los datos de tu firma para personalizar los documentos"
              : "Administra la información de tu empresa"}
          </p>
        </div>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información de la Empresa
            </CardTitle>
            <CardDescription>
              Datos básicos de tu firma o departamento legal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la empresa *</Label>
                <Input
                  id="name"
                  placeholder="Ej: García & Asociados"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industria *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) =>
                    setFormData({ ...formData, industry: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una industria" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente tu empresa o área de práctica..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferencias de documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Preferencias de Documentos</CardTitle>
            <CardDescription>
              Define cómo quieres que la IA redacte tus documentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="style">Estilo de redacción</Label>
              <Select
                value={formData.style}
                onValueChange={(value) =>
                  setFormData({ ...formData, style: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tono específico (opcional)</Label>
              <Input
                id="tone"
                placeholder="Ej: Profesional pero cercano, conservador, innovador..."
                value={formData.tone}
                onChange={(e) =>
                  setFormData({ ...formData, tone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customInstructions">
                Instrucciones adicionales para la IA (opcional)
              </Label>
              <Textarea
                id="customInstructions"
                placeholder="Ej: Siempre incluir cláusula de arbitraje, usar numeración romana para cláusulas principales, evitar términos en inglés..."
                value={formData.customInstructions}
                onChange={(e) =>
                  setFormData({ ...formData, customInstructions: e.target.value })
                }
                rows={4}
              />
              <p className="text-xs text-slate-500">
                Estas instrucciones se aplicarán a todos los documentos generados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botón guardar */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/configuracion">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isNewCompany ? "Crear Empresa" : "Guardar Cambios"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
