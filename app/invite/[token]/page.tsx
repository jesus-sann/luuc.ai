"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface InvitationInfo {
  email: string;
  company_name: string;
  role: string;
  invited_by_name: string;
  expires_at: string;
}

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "ready" | "accepting" | "success" | "error">("loading");
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitation details on mount
  useEffect(() => {
    async function fetchInvitation() {
      try {
        const res = await fetch(`/api/invitations/verify?token=${token}`);
        const data = await res.json();

        if (data.success) {
          setInvitation(data.data);
          setStatus("ready");
        } else {
          setError(data.error || "Invitación inválida o expirada");
          setStatus("error");
        }
      } catch {
        setError("Error al verificar la invitación");
        setStatus("error");
      }
    }

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAccept = async () => {
    setStatus("accepting");

    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError(data.error || "No se pudo aceptar la invitación");
        setStatus("error");
      }
    } catch {
      setError("Error al aceptar la invitación");
      setStatus("error");
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "member": return "Miembro";
      case "viewer": return "Visualizador";
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
            {status === "loading" || status === "accepting" ? (
              <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            ) : status === "error" ? (
              <XCircle className="h-7 w-7 text-red-600" />
            ) : (
              <Users className="h-7 w-7 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verificando invitación..."}
            {status === "ready" && "Invitación de equipo"}
            {status === "accepting" && "Aceptando invitación..."}
            {status === "success" && "¡Bienvenido al equipo!"}
            {status === "error" && "Error"}
          </CardTitle>
          <CardDescription>
            {status === "ready" && invitation && (
              <>Has sido invitado a unirte a un equipo en Luuc.ai</>
            )}
            {status === "success" && (
              <>Redirigiendo al dashboard...</>
            )}
            {status === "error" && error}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {status === "ready" && invitation && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {invitation.company_name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Invitado por {invitation.invited_by_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Tu rol será:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {getRoleName(invitation.role)}
                  </span>
                </div>
              </div>

              {/* Email notice */}
              <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                Esta invitación es para <strong>{invitation.email}</strong>.
                Asegúrate de haber iniciado sesión con esta cuenta.
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAccept}
                >
                  Aceptar Invitación
                </Button>
                <Link href="/">
                  <Button variant="outline" size="lg" className="w-full">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <p className="text-center text-slate-600 dark:text-slate-400">
                {error?.includes("sesión") ? (
                  <>Debes iniciar sesión para aceptar esta invitación.</>
                ) : (
                  <>La invitación puede haber expirado o ya fue utilizada.</>
                )}
              </p>
              <div className="flex flex-col gap-3">
                {error?.includes("sesión") && (
                  <Link href={`/login?redirect=/invite/${token}`}>
                    <Button size="lg" className="w-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
                <Link href="/">
                  <Button variant="outline" size="lg" className="w-full">
                    Volver al Inicio
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Ahora eres parte del equipo. Serás redirigido al dashboard.
              </p>
              <Link href="/dashboard">
                <Button>Ir al Dashboard</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
