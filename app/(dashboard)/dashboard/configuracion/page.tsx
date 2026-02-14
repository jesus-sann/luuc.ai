"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  FileText,
  User,
  Bell,
  Shield,
  CreditCard,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/hooks/use-translations";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  status: string;
}

export default function ConfiguracionPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const settingsSections = [
    {
      title: t("configuracion.company"),
      description: t("configuracion.companyDesc"),
      icon: Building2,
      href: "/dashboard/configuracion/empresa",
      color: "bg-blue-500",
    },
    {
      title: t("configuracion.refDocs"),
      description: t("configuracion.refDocsDesc"),
      icon: FileText,
      href: "/dashboard/configuracion/documentos",
      color: "bg-green-500",
    },
    {
      title: t("configuracion.profile"),
      description: t("configuracion.profileDesc"),
      icon: User,
      href: "/dashboard/configuracion/perfil",
      color: "bg-purple-500",
    },
    {
      title: t("configuracion.notifications"),
      description: t("configuracion.notificationsDesc"),
      icon: Bell,
      href: "/dashboard/configuracion/notificaciones",
      color: "bg-orange-500",
      comingSoon: true,
    },
    {
      title: t("configuracion.security"),
      description: t("configuracion.securityDesc"),
      icon: Shield,
      href: "/dashboard/configuracion/seguridad",
      color: "bg-red-500",
    },
    {
      title: t("configuracion.plans"),
      description: t("configuracion.plansDesc"),
      icon: CreditCard,
      href: "/dashboard/configuracion/planes",
      color: "bg-indigo-500",
    },
  ];

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch("/api/company/setup");
        const data = await response.json();
        if (data.success && data.data) {
          setCompany(data.data);
        }
      } catch (error) {
        console.error("Error fetching company:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("configuracion.title")}</h1>
        <p className="text-slate-500">
          {t("configuracion.description")}
        </p>
      </div>

      {/* Status de empresa */}
      {!loading && (
        <Card className={company ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30" : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30"}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${company ? "bg-green-100" : "bg-yellow-100"}`}>
                <Building2 className={`h-5 w-5 ${company ? "text-green-600" : "text-yellow-600"}`} />
              </div>
              <div>
                <p className={`font-medium ${company ? "text-green-800" : "text-yellow-800"}`}>
                  {company ? `${t("configuracion.company")}: ${company.name}` : t("configuracion.companyNotConfigured")}
                </p>
                <p className={`text-sm ${company ? "text-green-600" : "text-yellow-600"}`}>
                  {company
                    ? t("configuracion.companyConfigured")
                    : t("configuracion.companyNeeded")}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/configuracion/empresa"
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                company
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-yellow-600 text-white hover:bg-yellow-700"
              }`}
            >
              {company ? t("configuracion.viewCompany") : t("configuracion.configureCompany")}
            </Link>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </CardContent>
        </Card>
      )}

      {/* Secciones de configuración */}
      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Link
            key={section.title}
            href={section.comingSoon ? "#" : section.href}
            className={section.comingSoon ? "cursor-not-allowed" : ""}
          >
            <Card className={`transition-all ${section.comingSoon ? "opacity-60" : "hover:border-slate-300 hover:shadow-md"}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${section.color}`}>
                    <section.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium">
                      {section.title}
                      {section.comingSoon && (
                        <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                          {t("configuracion.comingSoon")}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
                {!section.comingSoon && (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info del usuario */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("configuracion.accountInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">{t("configuracion.email")}</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t("configuracion.currentPlan")}</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 capitalize">
{(user.user_metadata?.plan as string) || t("common.free")}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
