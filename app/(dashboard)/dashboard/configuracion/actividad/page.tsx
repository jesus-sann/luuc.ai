"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Breadcrumb } from "@/components/breadcrumb";
import { useAuth } from "@/hooks/use-auth";

interface AuditLogUser {
  name: string | null;
  email: string;
  role: string | null;
}

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  users: AuditLogUser | null;
}

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

const ACTION_LABELS: Record<string, string> = {
  "document.generate": "Documento generado",
  "document.view": "Documento visto",
  "document.review": "Documento revisado",
  "document.delete": "Documento eliminado",
  "document.duplicate": "Documento duplicado",
  "document.update": "Documento actualizado",
  "kb.upload": "Archivo subido a KB",
  "kb.delete": "Archivo eliminado de KB",
  "settings.update": "Configuración actualizada",
  "auth.login": "Inicio de sesión",
  "auth.logout": "Cierre de sesión",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Propietario",
  admin: "Administrador",
  attorney: "Abogado",
  member: "Miembro",
  viewer: "Visualizador",
};

function LogSkeleton() {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

export default function ActividadPage() {
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  const LIMIT = 50;

  const fetchLogs = useCallback(
    async (currentPage: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(LIMIT),
        });
        if (fromDate) params.set("from", fromDate);
        if (toDate) params.set("to", toDate);
        if (userFilter && userFilter !== "all") params.set("userId", userFilter);

        const res = await fetch(`/api/audit-logs?${params.toString()}`);
        if (res.status === 403) {
          setAccessDenied(true);
          return;
        }
        const data = await res.json();

        if (data.success) {
          setLogs(data.data.logs);
          setTotal(data.data.total);
          setHasMore(data.data.hasMore);
        }
      } catch (err) {
        console.error("Error fetching audit logs:", err);
      } finally {
        setLoading(false);
      }
    },
    [fromDate, toDate, userFilter]
  );

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/invitations");
      const data = await res.json();
      if (data.success && data.data?.members) {
        setTeamMembers(data.data.members);
      }
    } catch (err) {
      console.error("Error fetching team:", err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchTeam();
    }
  }, [authLoading, fetchTeam]);

  useEffect(() => {
    if (!authLoading) {
      setPage(1);
      fetchLogs(1);
    }
  }, [authLoading, fromDate, toDate, userFilter, fetchLogs]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchLogs(newPage);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserDisplay = (log: AuditLog) => {
    if (!log.users) return log.user_id ? "Usuario eliminado" : "Sistema";
    return log.users.name || log.users.email;
  };

  const getRoleDisplay = (log: AuditLog) => {
    if (!log.users?.role) return "—";
    return ROLE_LABELS[log.users.role] ?? log.users.role;
  };

  const getActionLabel = (action: string) => {
    return ACTION_LABELS[action] ?? action;
  };

  if (accessDenied) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-medium text-slate-900 dark:text-white">
          Acceso restringido
        </p>
        <p className="text-sm text-slate-500">
          Solo administradores y propietarios pueden ver el registro de actividad.
        </p>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  const startRecord = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const endRecord = Math.min(page * LIMIT, total);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Configuración", href: "/dashboard/configuracion" },
          { label: "Registro de Actividad" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/configuracion"
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Registro de Actividad
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Historial de acciones realizadas por los miembros del equipo
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="from-date" className="text-sm">
                Desde
              </Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to-date" className="text-sm">
                Hasta
              </Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Usuario</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(fromDate || toDate || (userFilter && userFilter !== "all")) && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-slate-500"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setUserFilter("all");
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad
            </CardTitle>
            {!loading && (
              <CardDescription>
                {total === 0
                  ? "Sin registros"
                  : `${startRecord}–${endRecord} de ${total} registros`}
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LogSkeleton />
          ) : logs.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 inline-flex rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                <Activity className="h-8 w-8 text-slate-400" />
              </div>
              <p className="font-medium text-slate-900 dark:text-white">
                No hay actividad registrada aún
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Las acciones del equipo aparecerán aquí una vez que comiencen a usar la plataforma.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-3 text-left font-medium text-slate-500">
                        Fecha / Hora
                      </th>
                      <th className="pb-3 text-left font-medium text-slate-500">
                        Usuario
                      </th>
                      <th className="pb-3 text-left font-medium text-slate-500">
                        Rol
                      </th>
                      <th className="pb-3 text-left font-medium text-slate-500">
                        Acción
                      </th>
                      <th className="pb-3 text-left font-medium text-slate-500">
                        Recurso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                          {getUserDisplay(log)}
                        </td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                          {getRoleDisplay(log)}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                            {getActionLabel(log.action)}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">
                          {log.resource_type}
                          {log.resource_id && (
                            <span className="ml-1 font-mono text-xs text-slate-400">
                              #{log.resource_id.slice(0, 8)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
                {logs.map((log) => (
                  <div key={log.id} className="py-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {getUserDisplay(log)}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                        {getActionLabel(log.action)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDateTime(log.created_at)} · {getRoleDisplay(log)} · {log.resource_type}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className="text-sm text-slate-500">
                  {total === 0 ? "0 registros" : `${startRecord}–${endRecord} de ${total} registros`}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasMore}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
