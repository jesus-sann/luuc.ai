import Link from "next/link";
import { FileText, Search, FolderOpen, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Bienvenido a Luuc.ai
        </h1>
        <p className="mt-2 text-slate-600">
          Tu asistente legal corporativo potenciado por inteligencia artificial
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/redactar">
          <Card className="cursor-pointer transition-all hover:border-blue-300 hover:shadow-md">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Redactar Documento</CardTitle>
              <CardDescription>
                Crea contratos, NDAs, políticas y más con ayuda de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0 text-blue-600">
                Comenzar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/revisar">
          <Card className="cursor-pointer transition-all hover:border-green-300 hover:shadow-md">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Revisar Documento</CardTitle>
              <CardDescription>
                Analiza contratos existentes e identifica riesgos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0 text-green-600">
                Analizar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/knowledge-base">
          <Card className="cursor-pointer transition-all hover:border-orange-300 hover:shadow-md">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Base de Conocimiento</CardTitle>
              <CardDescription>
                Sube documentos de tu empresa para personalizar la IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0 text-orange-600">
                Gestionar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/documentos">
          <Card className="cursor-pointer transition-all hover:border-purple-300 hover:shadow-md">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FolderOpen className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Mis Documentos</CardTitle>
              <CardDescription>
                Accede a tus documentos generados y análisis previos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0 text-purple-600">
                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documentos Generados</CardDescription>
            <CardTitle className="text-4xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Análisis Realizados</CardDescription>
            <CardTitle className="text-4xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Riesgos Detectados</CardDescription>
            <CardTitle className="text-4xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tiempo Ahorrado</CardDescription>
            <CardTitle className="text-4xl">0h</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
