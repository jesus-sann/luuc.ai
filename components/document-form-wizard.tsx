"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Template, TemplateStep, TemplateVariable } from "@/types";

interface DocumentFormWizardProps {
  template: Template;
  onSubmit: (values: Record<string, string>) => void;
  isLoading: boolean;
  extraControls?: React.ReactNode;
}

// Returns all variables referenced in steps (in-order, deduplicated)
function getStepVariables(
  step: TemplateStep,
  template: Template
): TemplateVariable[] {
  return step.fields
    .map((fieldName) => template.variables.find((v) => v.name === fieldName))
    .filter((v): v is TemplateVariable => v !== undefined);
}

// Summary step index is always steps.length
const SUMMARY_STEP_INDEX = -1; // sentinel; computed as steps.length in practice

export function DocumentFormWizard({
  template,
  onSubmit,
  isLoading,
  extraControls,
}: DocumentFormWizardProps) {
  const steps = template.steps!; // caller guarantees steps is defined
  const totalFieldSteps = steps.length;

  const [currentStep, setCurrentStep] = useState(0); // 0-based; totalFieldSteps = summary
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSummary = currentStep === totalFieldSteps;
  const step = isSummary ? null : steps[currentStep];

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    if (!step) return true;
    const vars = getStepVariables(step, template);
    const newErrors: Record<string, string> = {};
    for (const v of vars) {
      if (v.required && !values[v.name]?.trim()) {
        newErrors[v.name] = "Este campo es obligatorio";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
    setErrors({});
  };

  const handleEditStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setErrors({});
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  const renderField = (variable: TemplateVariable) => {
    const value = values[variable.name] || "";
    const error = errors[variable.name];

    return (
      <div key={variable.name} className="space-y-1.5">
        <Label htmlFor={variable.name} className="text-sm">
          {variable.label}
          {variable.required && <span className="ml-1 text-red-500">*</span>}
        </Label>

        {variable.type === "text" && (
          <Input
            id={variable.name}
            placeholder={variable.placeholder}
            value={value}
            onChange={(e) => handleChange(variable.name, e.target.value)}
            className={`text-sm ${error ? "border-red-400 focus-visible:ring-red-400" : ""}`}
          />
        )}

        {variable.type === "textarea" && (
          <Textarea
            id={variable.name}
            placeholder={variable.placeholder}
            rows={4}
            value={value}
            onChange={(e) => handleChange(variable.name, e.target.value)}
            className={`text-sm ${error ? "border-red-400 focus-visible:ring-red-400" : ""}`}
          />
        )}

        {variable.type === "date" && (
          <Input
            id={variable.name}
            type="date"
            value={value}
            onChange={(e) => handleChange(variable.name, e.target.value)}
            className={`text-sm ${error ? "border-red-400 focus-visible:ring-red-400" : ""}`}
          />
        )}

        {variable.type === "select" && variable.options && (
          <Select
            value={value}
            onValueChange={(val) => handleChange(variable.name, val)}
          >
            <SelectTrigger
              className={`text-sm ${error ? "border-red-400" : ""}`}
            >
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              {variable.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((s, idx) => {
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <div key={idx} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => isDone ? handleEditStep(idx) : undefined}
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isDone
                    ? "cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
                    : isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                }`}
                disabled={!isDone}
                aria-label={`Ir al paso ${idx + 1}: ${s.title}`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </button>
              <span
                className={`hidden whitespace-nowrap text-xs sm:block ${
                  isActive
                    ? "font-semibold text-slate-900 dark:text-white"
                    : isDone
                      ? "text-blue-600"
                      : "text-slate-400"
                }`}
              >
                {s.title}
              </span>
              {idx < steps.length - 1 && (
                <div
                  className={`mx-1 h-px w-6 flex-shrink-0 ${
                    isDone ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </div>
          );
        })}
        {/* Summary step indicator */}
        <div className="flex items-center gap-1">
          <div
            className={`mx-1 h-px w-6 flex-shrink-0 ${
              isSummary ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
          <div
            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              isSummary
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-400 dark:bg-slate-800"
            }`}
          >
            {steps.length + 1}
          </div>
          <span
            className={`hidden whitespace-nowrap text-xs sm:block ${
              isSummary
                ? "font-semibold text-slate-900 dark:text-white"
                : "text-slate-400"
            }`}
          >
            Resumen
          </span>
        </div>
      </div>

      {/* Field step */}
      {!isSummary && step && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Paso {currentStep + 1} de {totalFieldSteps}: {step.title}
            </CardTitle>
            <p className="text-xs text-slate-500">
              {getStepVariables(step, template).filter((v) => v.required).length} campos obligatorios
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {getStepVariables(step, template).map(renderField)}

            {/* Extra controls on last field step */}
            {currentStep === totalFieldSteps - 1 && extraControls && (
              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                {extraControls}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
              )}
              <Button
                type="button"
                className="ml-auto flex items-center gap-1"
                onClick={handleNext}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary step */}
      {isSummary && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen del documento</CardTitle>
              <p className="text-xs text-slate-500">
                Revisa la información antes de generar el documento.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {steps.map((s, stepIdx) => {
                const stepVars = getStepVariables(s, template);
                return (
                  <div key={stepIdx}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {s.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleEditStep(stepIdx)}
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Edit2 className="h-3 w-3" />
                        Editar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {stepVars.map((v) => (
                        <div key={v.name} className="flex gap-2 text-sm">
                          <span className="w-40 flex-shrink-0 text-slate-500">
                            {v.label}
                          </span>
                          <span className="flex-1 font-medium text-slate-900 dark:text-white break-words">
                            {values[v.name] || (
                              <span className="font-normal italic text-slate-400">
                                No proporcionado
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    {stepIdx < steps.length - 1 && (
                      <div className="mt-4 border-t border-slate-100 dark:border-slate-800" />
                    )}
                  </div>
                );
              })}

              {/* Extra controls on summary */}
              {extraControls && (
                <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                  {extraControls}
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-slate-400 text-center">
            El contenido generado por IA es un borrador que debe ser revisado por un profesional legal. Luuc.ai no sustituye el asesoramiento jurídico.
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              type="button"
              className="ml-auto w-full sm:w-auto"
              size="lg"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Generando documento..." : "Generar Documento"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
