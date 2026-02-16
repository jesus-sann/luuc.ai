"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  Loader2,
  UserPlus,
  Mail,
  MoreVertical,
  Trash2,
  RefreshCw,
  Crown,
  Shield,
  User,
  Clock,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Breadcrumb } from "@/components/breadcrumb";

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export default function EquipoPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Dropdown menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchTeam = async () => {
    try {
      const response = await fetch("/api/invitations");
      const data = await response.json();

      if (data.success) {
        setMembers(data.data.members || []);
        setInvitations(data.data.invitations || []);
        setCompanyName(data.data.companyName || "");
      } else {
        setError(data.error || "Error al cargar el equipo");
      }
    } catch (err) {
      console.error("Error fetching team:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Invitación enviada a ${inviteEmail}`);
        setInviteEmail("");
        setInviteRole("member");
        setInviteDialogOpen(false);
        fetchTeam();
      } else {
        setError(data.error || "Error al enviar invitación");
      }
    } catch (err) {
      console.error("Error inviting:", err);
      setError("Error de conexión");
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/invitations/${inviteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Invitación cancelada");
        fetchTeam();
      } else {
        setError(data.error || "Error al cancelar invitación");
      }
    } catch (err) {
      console.error("Error cancelling:", err);
      setError("Error de conexión");
    }
    setOpenMenuId(null);
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/invitations/${inviteId}`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Invitación reenviada");
        fetchTeam();
      } else {
        setError(data.error || "Error al reenviar invitación");
      }
    } catch (err) {
      console.error("Error resending:", err);
      setError("Error de conexión");
    }
    setOpenMenuId(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "member":
        return <User className="h-4 w-4 text-blue-600" />;
      case "viewer":
        return <Shield className="h-4 w-4 text-slate-500" />;
      default:
        return <User className="h-4 w-4 text-slate-500" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "member":
        return "Miembro";
      case "viewer":
        return "Visualizador";
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const pendingInvites = invitations.filter((i) => i.status === "pending");

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Configuración", href: "/dashboard/configuracion" },
          { label: "Equipo" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/configuracion"
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Equipo
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Administra los miembros de {companyName || "tu empresa"}
            </p>
          </div>
        </div>

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invitar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar nuevo miembro</DialogTitle>
              <DialogDescription>
                Envía una invitación por email para unirse a tu equipo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      Administrador - Puede invitar y gestionar usuarios
                    </SelectItem>
                    <SelectItem value="member">
                      Miembro - Puede crear y editar documentos
                    </SelectItem>
                    <SelectItem value="viewer">
                      Visualizador - Solo puede ver documentos
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={inviting}>
                  {inviting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar invitación
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 text-red-800 hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-600 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          {success}
          <button
            onClick={() => setSuccess("")}
            className="ml-2 text-green-800 hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Miembros ({members.length})
          </CardTitle>
          <CardDescription>
            Usuarios activos en tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="py-4 text-center text-slate-500">
              No hay miembros en tu equipo todavía.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      {getRoleIcon(member.role)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {member.name || member.email}
                      </p>
                      <p className="text-sm text-slate-500">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {getRoleName(member.role)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Invitaciones pendientes ({pendingInvites.length})
            </CardTitle>
            <CardDescription>
              Invitaciones que aún no han sido aceptadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                      <Mail className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {invite.email}
                      </p>
                      <p className="text-sm text-slate-500">
                        Enviada {formatDate(invite.created_at)} · Expira{" "}
                        {formatDate(invite.expires_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      {getRoleName(invite.role)}
                    </span>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === invite.id ? null : invite.id
                          )
                        }
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {openMenuId === invite.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                              onClick={() => handleResendInvite(invite.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                              Reenviar
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                              onClick={() => handleCancelInvite(invite.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Cancelar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
