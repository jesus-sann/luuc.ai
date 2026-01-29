"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Search,
  Upload,
  FileText,
  TrendingUp,
  Folder,
  Plus,
  Trash2,
  X,
  BookOpen,
  BarChart2,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KBDocument {
  id: string;
  title: string;
  category: string;
  filename: string | null;
  file_type: string | null;
  file_size: number | null;
  usage_count: number;
  created_at: string;
  content_summary: string | null;
}

interface KBCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  document_count: number;
}

interface KBStats {
  totalDocuments: number;
  totalSize: number;
  categoriesCount: number;
  lastUploadedAt: string | null;
  mostUsedCategory: string;
  recentUploads: KBDocument[];
}

// Mapeo de iconos de Lucide
const iconMap: Record<string, React.ReactNode> = {
  folder: <Folder className="w-6 h-6" />,
  "file-text": <FileText className="w-6 h-6" />,
  "check-circle": <CheckCircle className="w-6 h-6" />,
  "book-open": <BookOpen className="w-6 h-6" />,
  "bar-chart-2": <BarChart2 className="w-6 h-6" />,
};

export default function KnowledgeBasePage() {
  const [stats, setStats] = useState<KBStats | null>(null);
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("folder");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/knowledge-base/stats");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/knowledge-base/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  const fetchDocuments = useCallback(
    async (category?: string, search?: string) => {
      try {
        let url = "/api/knowledge-base?";
        if (category) url += `category=${category}&`;
        if (search) url += `search=${encodeURIComponent(search)}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) setDocuments(data.data);
      } catch (err) {
        console.error("Error fetching documents:", err);
      }
    },
    []
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchDocuments(), fetchCategories()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchStats, fetchDocuments, fetchCategories]);

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch("/api/knowledge-base/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName,
          icon: newCategoryIcon,
        }),
      });

      if (res.ok) {
        setNewCategoryName("");
        setNewCategoryIcon("folder");
        setShowNewCategoryModal(false);
        fetchCategories();
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear categoria");
      }
    } catch (err) {
      setError("Error de conexion");
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!selectedCategory) {
        setError("Por favor selecciona una categoria primero");
        return;
      }

      setIsUploading(true);
      setError(null);

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name.replace(/\.[^/.]+$/, ""));
        formData.append("category", selectedCategory);
        formData.append("tags", JSON.stringify([]));
        formData.append("metadata", JSON.stringify({}));

        try {
          const res = await fetch("/api/knowledge-base", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const errorData = await res.json();
            setError(`Error en ${file.name}: ${errorData.error}`);
          }
        } catch (err) {
          setError(`Error subiendo ${file.name}`);
        }
      }

      setIsUploading(false);
      fetchStats();
      fetchDocuments(selectedCategory);
      fetchCategories();
    },
    [selectedCategory, fetchStats, fetchDocuments, fetchCategories]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    disabled: !selectedCategory || isUploading,
  });

  const deleteDocument = async (docId: string) => {
    if (!confirm("Estas seguro de eliminar este documento?")) return;

    try {
      const res = await fetch(`/api/knowledge-base/${docId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchDocuments(selectedCategory || undefined);
        fetchStats();
        fetchCategories();
      }
    } catch (err) {
      setError("Error al eliminar documento");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    fetchDocuments(slug);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.length > 2) {
      fetchDocuments(selectedCategory || undefined, value);
    } else if (value.length === 0) {
      fetchDocuments(selectedCategory || undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Base de Conocimiento
        </h1>
        <p className="text-slate-600">
          Alimenta a LUUC con la documentacion de tu empresa para generar
          documentos coherentes con tus estandares
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto hover:text-red-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Archivos</p>
                  <p className="text-2xl font-bold">{stats.totalDocuments}</p>
                </div>
                <FileText className="text-blue-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Tamano Total</p>
                  <p className="text-2xl font-bold">
                    {formatFileSize(stats.totalSize)}
                  </p>
                </div>
                <Folder className="text-green-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Categorias</p>
                  <p className="text-2xl font-bold">{stats.categoriesCount}</p>
                </div>
                <TrendingUp className="text-purple-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Mas Usada</p>
                  <p className="text-sm font-medium capitalize truncate">
                    {stats.mostUsedCategory || "N/A"}
                  </p>
                </div>
                <TrendingUp className="text-orange-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar documentos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-8 transition-all ${
          !selectedCategory
            ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-50"
            : isDragActive
              ? "border-blue-500 bg-blue-50 cursor-pointer"
              : "border-slate-300 hover:border-slate-400 cursor-pointer"
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-blue-600 font-medium">Procesando archivos...</p>
          </div>
        ) : (
          <>
            <Upload
              className={`mx-auto mb-4 w-12 h-12 ${
                selectedCategory ? "text-slate-400" : "text-slate-300"
              }`}
            />
            {!selectedCategory ? (
              <>
                <p className="text-lg font-medium mb-2 text-slate-400">
                  Selecciona una categoria primero
                </p>
                <p className="text-sm text-slate-400">
                  Elige una categoria abajo para poder subir archivos
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  {isDragActive
                    ? "Suelta los archivos aqui!"
                    : "Arrastra archivos o haz clic para subir"}
                </p>
                <p className="text-sm text-slate-500">
                  Soporta: PDF, DOCX, TXT, MD (max 10MB)
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Se subira a:{" "}
                  {categories.find((c) => c.slug === selectedCategory)?.name}
                </p>
              </>
            )}
          </>
        )}
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Categorias
          </h2>
          <Button onClick={() => setShowNewCategoryModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoria
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedCategory === cat.slug
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-slate-200 hover:border-slate-300 hover:shadow"
              }`}
            >
              <div
                className="mb-2"
                style={{ color: cat.color }}
              >
                {iconMap[cat.icon] || <Folder className="w-6 h-6" />}
              </div>
              <p className="font-medium text-sm">{cat.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                {cat.document_count}{" "}
                {cat.document_count === 1 ? "archivo" : "archivos"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {selectedCategory
            ? `Documentos en "${categories.find((c) => c.slug === selectedCategory)?.name}"`
            : "Todos los Documentos"}
        </h2>

        {documents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto text-slate-300 w-16 h-16 mb-4" />
              <p className="text-slate-500 text-lg">
                {selectedCategory
                  ? "No hay documentos en esta categoria"
                  : "No hay documentos. Sube el primero!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1">{doc.title}</h3>
                      {doc.content_summary && (
                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                          {doc.content_summary}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded">
                          {categories.find((c) => c.slug === doc.category)
                            ?.name || doc.category}
                        </span>
                        {doc.filename && <span>{doc.filename}</span>}
                        {doc.file_type && (
                          <span>{doc.file_type.toUpperCase()}</span>
                        )}
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>Usado {doc.usage_count} veces</span>
                        <span>
                          {new Date(doc.created_at).toLocaleDateString("es-CO")}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nueva Categoria</CardTitle>
                <button
                  onClick={() => setShowNewCategoryModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre de la categoria
                </label>
                <Input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: Contratos, Reportes, Manuales..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Icono</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(iconMap).map(([key, icon]) => (
                    <button
                      key={key}
                      onClick={() => setNewCategoryIcon(key)}
                      className={`p-2 rounded-lg border-2 transition ${
                        newCategoryIcon === key
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewCategoryModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={createCategory}
                  disabled={!newCategoryName.trim()}
                >
                  Crear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
