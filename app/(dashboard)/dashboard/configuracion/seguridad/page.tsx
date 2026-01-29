"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Loader2,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function SeguridadPage() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "La contraseña debe incluir al menos una mayúscula";
    }
    if (!/[a-z]/.test(pwd)) {
      return "La contraseña debe incluir al menos una minúscula";
    }
    if (!/[0-9]/.test(pwd)) {
      return "La contraseña debe incluir al menos un número";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validar nueva contraseña
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Verificar que las contraseñas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    // Primero verificar la contraseña actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setError("No se pudo obtener información del usuario");
      setSaving(false);
      return;
    }

    // Intentar re-autenticar con la contraseña actual
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: formData.currentPassword,
    });

    if (signInError) {
      setError("La contraseña actual es incorrecta");
      setSaving(false);
      return;
    }

    // Actualizar la contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: formData.newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess("Contraseña actualizada exitosamente");
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setSaving(false);

    setTimeout(() => setSuccess(""), 5000);
  };

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
          <h1 className="text-2xl font-bold text-slate-900">Seguridad</h1>
          <p className="text-slate-500">
            Administra tu contraseña y seguridad de la cuenta
          </p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-600">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Cambiar contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              <p className="mb-1 font-medium">La contraseña debe tener:</p>
              <ul className="list-inside list-disc space-y-0.5">
                <li
                  className={
                    formData.newPassword.length >= 8 ? "text-green-600" : ""
                  }
                >
                  Al menos 8 caracteres
                </li>
                <li
                  className={
                    /[A-Z]/.test(formData.newPassword) ? "text-green-600" : ""
                  }
                >
                  Al menos una letra mayúscula
                </li>
                <li
                  className={
                    /[a-z]/.test(formData.newPassword) ? "text-green-600" : ""
                  }
                >
                  Al menos una letra minúscula
                </li>
                <li
                  className={
                    /[0-9]/.test(formData.newPassword) ? "text-green-600" : ""
                  }
                >
                  Al menos un número
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/dashboard/configuracion">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Cambiar Contraseña
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info de seguridad */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Consejos de seguridad</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-blue-700">
                <li>No compartas tu contraseña con nadie</li>
                <li>Usa una contraseña única para cada servicio</li>
                <li>Cambia tu contraseña regularmente</li>
                <li>Cierra sesión en dispositivos compartidos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sesiones activas (próximamente) */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Sesiones Activas
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
              Próximamente
            </span>
          </CardTitle>
          <CardDescription>
            Administra los dispositivos donde has iniciado sesión
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
