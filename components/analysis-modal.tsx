"use client";

import { AlertTriangle, CheckCircle, Info, XCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AnalysisResponse } from "@/types";
import { cn, getRiskColor, getRiskBorderColor } from "@/lib/utils";

interface AnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: AnalysisResponse;
  filename: string;
}

const getRiskIcon = (nivel: string) => {
  switch (nivel) {
    case "CRITICO": return XCircle;
    case "ALTO": return AlertTriangle;
    case "MEDIO": return Info;
    case "BAJO": return CheckCircle;
    default: return Info;
  }
};

const getScoreColor = (score: number) => {
  if (score <= 3) return "text-green-600 dark:text-green-400";
  if (score <= 5) return "text-yellow-600 dark:text-yellow-400";
  if (score <= 7) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

const getScoreBg = (score: number) => {
  if (score <= 3) return "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800";
  if (score <= 5) return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800";
  if (score <= 7) return "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800";
  return "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800";
};

const getScoreLabel = (score: number) => {
  if (score <= 3) return "Bajo Riesgo";
  if (score <= 5) return "Riesgo Moderado";
  if (score <= 7) return "Riesgo Alto";
  return "Riesgo Crítico";
};

export function AnalysisModal({
  open,
  onOpenChange,
  result,
  filename,
}: AnalysisModalProps) {
  const { score, riesgos, clausulas_faltantes, resumen, observaciones_generales } = result;

  const criticalCount = riesgos.filter((f) => f.nivel === "CRITICO").length;
  const highCount = riesgos.filter((f) => f.nivel === "ALTO").length;
  const mediumCount = riesgos.filter((f) => f.nivel === "MEDIO").length;
  const lowCount = riesgos.filter((f) => f.nivel === "BAJO").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl p-0">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Análisis de Riesgo
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                {filename}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Divider */}
        <div className="mx-6 border-t border-slate-200 dark:border-slate-700" />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
          {/* Score Banner */}
          <div className={cn("flex items-center justify-between rounded-xl border p-4", getScoreBg(score))}>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Score de Riesgo</p>
              <p className={cn("text-3xl font-bold", getScoreColor(score))}>
                {score}/10
              </p>
              <p className={cn("text-sm font-medium", getScoreColor(score))}>
                {getScoreLabel(score)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              {criticalCount > 0 && (
                <div className="rounded-lg bg-white/80 px-3 py-1.5 dark:bg-slate-800/80">
                  <p className="text-lg font-bold text-red-600">{criticalCount}</p>
                  <p className="text-[10px] font-medium text-red-600">Críticos</p>
                </div>
              )}
              {highCount > 0 && (
                <div className="rounded-lg bg-white/80 px-3 py-1.5 dark:bg-slate-800/80">
                  <p className="text-lg font-bold text-orange-600">{highCount}</p>
                  <p className="text-[10px] font-medium text-orange-600">Altos</p>
                </div>
              )}
              {mediumCount > 0 && (
                <div className="rounded-lg bg-white/80 px-3 py-1.5 dark:bg-slate-800/80">
                  <p className="text-lg font-bold text-yellow-600">{mediumCount}</p>
                  <p className="text-[10px] font-medium text-yellow-600">Medios</p>
                </div>
              )}
              {lowCount > 0 && (
                <div className="rounded-lg bg-white/80 px-3 py-1.5 dark:bg-slate-800/80">
                  <p className="text-lg font-bold text-green-600">{lowCount}</p>
                  <p className="text-[10px] font-medium text-green-600">Bajos</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Resumen Ejecutivo</h3>
            <p className="text-[15px] leading-7 text-slate-600 dark:text-slate-300">{resumen}</p>
          </div>

          {/* Findings */}
          {riesgos.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                Riesgos Identificados ({riesgos.length})
              </h3>
              <div className="space-y-3">
                {riesgos.map((finding, index) => {
                  const Icon = getRiskIcon(finding.nivel);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "rounded-xl border-l-4 bg-slate-50 p-4 dark:bg-slate-800/50",
                        getRiskBorderColor(finding.nivel)
                      )}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", getRiskColor(finding.nivel))}>
                          <Icon className="h-3 w-3" />
                          {finding.nivel}
                        </span>
                        {finding.clausula && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">{finding.clausula}</span>
                        )}
                      </div>
                      <p className="mb-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                        {finding.descripcion}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Recomendación:</span> {finding.recomendacion}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Missing Clauses */}
          {clausulas_faltantes.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Cláusulas Faltantes</h3>
              <ul className="space-y-1.5">
                {clausulas_faltantes.map((clause, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                    {clause}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Observations */}
          {observaciones_generales && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Observaciones</h3>
              <p className="text-[15px] leading-7 text-slate-600 dark:text-slate-300">{observaciones_generales}</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-slate-200 dark:border-slate-700" />

        {/* Footer */}
        <div className="flex-shrink-0 px-6 pt-3">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            El contenido generado por IA es un borrador que debe ser revisado por un profesional legal. Luuc.ai no sustituye el asesoramiento jurídico.
          </p>
        </div>
        <div className="flex-shrink-0 px-6 py-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            size="lg"
          >
            Nuevo Análisis
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
