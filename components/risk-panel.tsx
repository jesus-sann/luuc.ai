"use client";

import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { RiskFinding } from "@/types";
import { cn, getRiskColor, getRiskBorderColor } from "@/lib/utils";

interface RiskPanelProps {
  score: number;
  findings: RiskFinding[];
  missingClauses: string[];
  summary: string;
  observations: string;
}

const getRiskIcon = (nivel: string) => {
  switch (nivel) {
    case "CRITICO":
      return XCircle;
    case "ALTO":
      return AlertTriangle;
    case "MEDIO":
      return Info;
    case "BAJO":
      return CheckCircle;
    default:
      return Info;
  }
};

const getScoreColor = (score: number) => {
  if (score <= 3) return "text-green-600";
  if (score <= 5) return "text-yellow-600";
  if (score <= 7) return "text-orange-600";
  return "text-red-600";
};

const getScoreLabel = (score: number) => {
  if (score <= 3) return "Bajo Riesgo";
  if (score <= 5) return "Riesgo Moderado";
  if (score <= 7) return "Riesgo Alto";
  return "Riesgo Crítico";
};

export function RiskPanel({
  score,
  findings,
  missingClauses,
  summary,
  observations,
}: RiskPanelProps) {
  const criticalCount = findings.filter((f) => f.nivel === "CRITICO").length;
  const highCount = findings.filter((f) => f.nivel === "ALTO").length;
  const mediumCount = findings.filter((f) => f.nivel === "MEDIO").length;
  const lowCount = findings.filter((f) => f.nivel === "BAJO").length;

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Score de Riesgo</p>
            <p className={cn("text-4xl font-bold", getScoreColor(score))}>
              {score}/10
            </p>
            <p className={cn("text-sm font-medium", getScoreColor(score))}>
              {getScoreLabel(score)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-red-50 px-3 py-2">
              <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              <p className="text-xs text-red-600">Críticos</p>
            </div>
            <div className="rounded-lg bg-orange-50 px-3 py-2">
              <p className="text-2xl font-bold text-orange-600">{highCount}</p>
              <p className="text-xs text-orange-600">Altos</p>
            </div>
            <div className="rounded-lg bg-yellow-50 px-3 py-2">
              <p className="text-2xl font-bold text-yellow-600">{mediumCount}</p>
              <p className="text-xs text-yellow-600">Medios</p>
            </div>
            <div className="rounded-lg bg-green-50 px-3 py-2">
              <p className="text-2xl font-bold text-green-600">{lowCount}</p>
              <p className="text-xs text-green-600">Bajos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-3 font-semibold text-slate-900">Resumen Ejecutivo</h3>
        <p className="text-sm text-slate-600">{summary}</p>
      </div>

      {/* Findings */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 font-semibold text-slate-900">
          Riesgos Identificados ({findings.length})
        </h3>
        <div className="space-y-4">
          {findings.map((finding, index) => {
            const Icon = getRiskIcon(finding.nivel);
            return (
              <div
                key={index}
                className={cn(
                  "rounded-lg border-l-4 bg-slate-50 p-4",
                  getRiskBorderColor(finding.nivel)
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      getRiskColor(finding.nivel)
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {finding.nivel}
                  </span>
                  {finding.clausula && (
                    <span className="text-xs text-slate-500">
                      {finding.clausula}
                    </span>
                  )}
                </div>
                <p className="mb-2 text-sm font-medium text-slate-800">
                  {finding.descripcion}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Recomendación:</span>{" "}
                  {finding.recomendacion}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing Clauses */}
      {missingClauses.length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-3 font-semibold text-slate-900">
            Cláusulas Faltantes
          </h3>
          <ul className="space-y-2">
            {missingClauses.map((clause, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                <span className="text-slate-600">{clause}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Observations */}
      {observations && (
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-3 font-semibold text-slate-900">
            Observaciones Generales
          </h3>
          <p className="text-sm text-slate-600">{observations}</p>
        </div>
      )}
    </div>
  );
}
