"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Folder,
  Loader2,
  CalendarDays,
  Lightbulb,
  BarChart2,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface KBDocument {
  id: string;
  title: string;
  category: string;
  created_at: string;
}

interface KBCategory {
  id: string;
  name: string;
  slug: string;
  document_count: number;
  color: string;
}

interface KBStats {
  totalDocuments: number;
  totalSize: number;
  categoriesCount: number;
  lastUploadedAt: string | null;
  mostUsedCategory: string;
  recentUploads: KBDocument[];
}

function getQualityLabel(total: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (total < 5) {
    return {
      label: "Inicial",
      color: "text-orange-700 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    };
  }
  if (total < 20) {
    return {
      label: "En desarrollo",
      color: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    };
  }
  return {
    label: "Sólida",
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function KnowledgeBaseEstadoPage() {
  const [stats, setStats] = useState<KBStats | null>(null);
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsRes, catRes] = await Promise.all([
          fetch("/api/knowledge-base/stats"),
          fetch("/api/knowledge-base/categories"),
        ]);
        const [statsData, catData] = await Promise.all([
          statsRes.json(),
          catRes.json(),
        ]);
        if (statsData.success) setStats(statsData.data);
        if (catData.success) setCategories(catData.data);
      } catch (err) {
        console.error("Error loading KB estado:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const quality = stats ? getQualityLabel(stats.totalDocuments) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/knowledge-base"
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Estado del Conocimiento
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Resumen del contenido en tu base de conocimiento
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total de documentos</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalDocuments ?? 0}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Categorías</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats?.categoriesCount ?? 0}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                <Folder className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tamaño total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats ? formatFileSize(stats.totalSize) : "0 B"}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <BarChart2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Última carga</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {stats?.lastUploadedAt
                    ? formatDate(stats.lastUploadedAt)
                    : "Sin archivos"}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                <CalendarDays className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality indicator + tip */}
      {stats && quality && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex-shrink-0 rounded-full bg-blue-100 p-2 dark:bg-blue-900/40">
              <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <p className="font-medium text-blue-900 dark:text-blue-200">
                  Calidad de la base de conocimiento:
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${quality.bg} ${quality.color}`}
                >
                  {quality.label}
                </span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Tu base de conocimiento tiene{" "}
                <strong>{stats.totalDocuments}</strong>{" "}
                {stats.totalDocuments === 1 ? "documento" : "documentos"}.
                Agrega más contratos aprobados para mejorar la calidad del AI.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Folder className="h-5 w-5" />
              Documentos por categoría
            </CardTitle>
            <CardDescription>
              Distribución del contenido en tu base de conocimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">
                No hay categorías creadas aún.
              </p>
            ) : (
              <div className="space-y-3">
                {categories
                  .sort((a, b) => b.document_count - a.document_count)
                  .map((cat) => (
                    <div key={cat.id} className="flex items-center gap-3">
                      <div
                        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color || "#3B82F6" }}
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {cat.name}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {cat.document_count}{" "}
                          {cat.document_count === 1 ? "archivo" : "archivos"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5" />
              Últimas cargas
            </CardTitle>
            <CardDescription>
              Los 5 documentos más recientemente subidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!stats?.recentUploads?.length ? (
              <p className="py-4 text-center text-sm text-slate-500">
                No hay documentos cargados aún.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentUploads.slice(0, 5).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                        {doc.title}
                      </span>
                    </div>
                    <span className="ml-2 flex-shrink-0 text-xs text-slate-500">
                      {formatDate(doc.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
