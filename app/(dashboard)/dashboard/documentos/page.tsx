"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Search, Calendar, MoreVertical, Download, Trash2, Eye, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document, Analysis } from "@/types";

export default function DocumentosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"generados" | "analizados">(
    "generados"
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents and analyses on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsRes, analysesRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/analyses"),
      ]);

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData.data || []);
      }

      if (analysesRes.ok) {
        const analysesData = await analysesRes.json();
        setAnalyses(analysesData.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (doc: Document) => {
    // Open in new window with content
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${doc.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #1e293b; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <h1>${doc.title}</h1>
          <pre>${doc.content}</pre>
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handleDownloadDocument = (doc: Document) => {
    const blob = new Blob([doc.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDuplicateDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/duplicate`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchData(); // Refresh list
        alert("Documento duplicado exitosamente");
      } else {
        const data = await res.json();
        alert(data.error || "Error al duplicar documento");
      }
    } catch (err) {
      console.error("Error duplicating document:", err);
      alert("Error al duplicar documento");
    }
    setOpenMenuId(null);
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este documento?")) {
      return;
    }

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchData(); // Refresh list
        alert("Documento eliminado exitosamente");
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar documento");
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Error al eliminar documento");
    }
    setOpenMenuId(null);
  };

  const handleViewAnalysis = async (analysisId: string) => {
    try {
      const res = await fetch(`/api/analyses/${analysisId}`);
      if (res.ok) {
        const data = await res.json();
        const analysis = data.data;

        // Open in new window with analysis details
        const newWindow = window.open("", "_blank");
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Análisis: ${analysis.filename}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                h1 { color: #1e293b; }
                h2 { color: #334155; margin-top: 30px; }
                .risk-score { font-size: 24px; font-weight: bold; color: #dc2626; }
                .summary { background: #f1f5f9; padding: 20px; border-radius: 8px; }
                .risk-item { background: #fff; border-left: 4px solid #dc2626; padding: 15px; margin: 10px 0; }
              </style>
            </head>
            <body>
              <h1>${analysis.filename}</h1>
              <div class="risk-score">Puntuación de Riesgo: ${analysis.risk_score}/10</div>
              <h2>Resumen</h2>
              <div class="summary">${analysis.summary}</div>
              <h2>Hallazgos</h2>
              ${analysis.findings.map((f: any) => `
                <div class="risk-item">
                  <strong>${f.nivel}:</strong> ${f.descripcion}<br/>
                  <em>Recomendación: ${f.recomendacion}</em>
                </div>
              `).join('')}
            </body>
            </html>
          `);
          newWindow.document.close();
        }
      }
    } catch (err) {
      console.error("Error viewing analysis:", err);
      alert("Error al ver el análisis");
    }
    setOpenMenuId(null);
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este análisis?")) {
      return;
    }

    try {
      const res = await fetch(`/api/analyses/${analysisId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchData(); // Refresh list
        alert("Análisis eliminado exitosamente");
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar análisis");
      }
    } catch (err) {
      console.error("Error deleting analysis:", err);
      alert("Error al eliminar análisis");
    }
    setOpenMenuId(null);
  };

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
          {loading ? (
            <Card>
              <CardContent className="flex min-h-[400px] items-center justify-center p-12">
                <p className="text-slate-600">Cargando documentos...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex min-h-[400px] items-center justify-center p-12">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-12">
                <div className="mb-4 rounded-full bg-blue-100 p-4">
                  <FileText className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">
                  Aún no tienes documentos generados
                </h3>
                <p className="mb-6 max-w-md text-center text-slate-600">
                  Comienza a redactar tu primer documento legal en minutos con la ayuda de nuestra IA
                </p>
                <Link href="/dashboard/redactar">
                  <Button size="lg">
                    <FileText className="mr-2 h-4 w-4" />
                    Crear primer documento
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            documents.map((doc) => (
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
                              handleViewDocument(doc);
                              setOpenMenuId(null);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            Ver documento
                          </button>
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            onClick={() => {
                              handleDownloadDocument(doc);
                              setOpenMenuId(null);
                            }}
                          >
                            <Download className="h-4 w-4" />
                            Descargar
                          </button>
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            onClick={() => handleDuplicateDocument(doc.id)}
                          >
                            <Copy className="h-4 w-4" />
                            Duplicar
                          </button>
                          <hr className="my-1 border-slate-200" />
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteDocument(doc.id)}
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
          {loading ? (
            <Card>
              <CardContent className="flex min-h-[400px] items-center justify-center p-12">
                <p className="text-slate-600">Cargando análisis...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex min-h-[400px] items-center justify-center p-12">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          ) : analyses.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-12">
                <div className="mb-4 rounded-full bg-green-100 p-4">
                  <Search className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">
                  No hay análisis realizados aún
                </h3>
                <p className="mb-6 max-w-md text-center text-slate-600">
                  Sube un contrato o documento legal para obtener un análisis detallado de riesgos y recomendaciones
                </p>
                <Link href="/dashboard/revisar">
                  <Button size="lg">
                    <Search className="mr-2 h-4 w-4" />
                    Analizar documento
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            analyses.map((analysis) => (
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
                              onClick={() => handleViewAnalysis(analysis.id)}
                            >
                              <Eye className="h-4 w-4" />
                              Ver análisis
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                              onClick={() => {
                                handleViewAnalysis(analysis.id);
                              }}
                            >
                              <Download className="h-4 w-4" />
                              Descargar reporte
                            </button>
                            <hr className="my-1 border-slate-200" />
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteAnalysis(analysis.id)}
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
