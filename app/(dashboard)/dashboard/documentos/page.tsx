"use client";

import { useState } from "react";
import { FileText, Search, Calendar, MoreVertical, Download, Trash2, Eye, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data - En producción vendrá de Supabase
const mockDocuments = [
  {
    id: "1",
    title: "NDA - Empresa ABC",
    doc_type: "nda",
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    title: "Contrato de Servicios - Consultoría",
    doc_type: "contrato_servicios",
    created_at: "2024-01-14T15:45:00Z",
  },
  {
    id: "3",
    title: "Política de Trabajo Remoto",
    doc_type: "politica_interna",
    created_at: "2024-01-12T09:00:00Z",
  },
];

const mockAnalyses = [
  {
    id: "1",
    filename: "Contrato_Proveedor_XYZ.pdf",
    risk_score: 6.5,
    created_at: "2024-01-16T11:20:00Z",
  },
  {
    id: "2",
    filename: "NDA_Cliente_123.docx",
    risk_score: 3.2,
    created_at: "2024-01-15T14:30:00Z",
  },
];

export default function DocumentosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"generados" | "analizados">(
    "generados"
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-green-600 bg-green-100";
    if (score <= 5) return "text-yellow-600 bg-yellow-100";
    if (score <= 7) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mis Documentos</h1>
        <p className="mt-2 text-slate-600">
          Accede a tus documentos generados y análisis realizados
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex rounded-lg border">
          <button
            onClick={() => setActiveTab("generados")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "generados"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            } rounded-l-lg`}
          >
            Generados
          </button>
          <button
            onClick={() => setActiveTab("analizados")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "analizados"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            } rounded-r-lg`}
          >
            Analizados
          </button>
        </div>
      </div>

      {/* Documents List */}
      {activeTab === "generados" ? (
        <div className="space-y-4">
          {mockDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex h-48 flex-col items-center justify-center">
                <FileText className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">No hay documentos generados aún</p>
                <Button className="mt-4" variant="outline">
                  Crear primer documento
                </Button>
              </CardContent>
            </Card>
          ) : (
            mockDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{doc.title}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(doc.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setOpenMenuId(openMenuId === doc.id ? null : doc.id)
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>

                    {openMenuId === doc.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            onClick={() => {
                              setOpenMenuId(null);
                              // TODO: Implementar ver documento
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            Ver documento
                          </button>
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            onClick={() => {
                              setOpenMenuId(null);
                              // TODO: Implementar descargar
                            }}
                          >
                            <Download className="h-4 w-4" />
                            Descargar
                          </button>
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            onClick={() => {
                              setOpenMenuId(null);
                              // TODO: Implementar duplicar
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            Duplicar
                          </button>
                          <hr className="my-1 border-slate-200" />
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setOpenMenuId(null);
                              // TODO: Implementar eliminar
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {mockAnalyses.length === 0 ? (
            <Card>
              <CardContent className="flex h-48 flex-col items-center justify-center">
                <Search className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">No hay análisis realizados aún</p>
                <Button className="mt-4" variant="outline">
                  Analizar documento
                </Button>
              </CardContent>
            </Card>
          ) : (
            mockAnalyses.map((analysis) => (
              <Card
                key={analysis.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <Search className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {analysis.filename}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(analysis.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${getScoreColor(
                        analysis.risk_score
                      )}`}
                    >
                      Riesgo: {analysis.risk_score}/10
                    </span>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === `analysis-${analysis.id}`
                              ? null
                              : `analysis-${analysis.id}`
                          )
                        }
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {openMenuId === `analysis-${analysis.id}` && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                              onClick={() => {
                                setOpenMenuId(null);
                                // TODO: Implementar ver análisis
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              Ver análisis
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                              onClick={() => {
                                setOpenMenuId(null);
                                // TODO: Implementar descargar reporte
                              }}
                            >
                              <Download className="h-4 w-4" />
                              Descargar reporte
                            </button>
                            <hr className="my-1 border-slate-200" />
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setOpenMenuId(null);
                                // TODO: Implementar eliminar
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
