import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function getRiskColor(nivel: string): string {
  const colors: Record<string, string> = {
    CRITICO: "bg-red-500 text-white",
    ALTO: "bg-orange-500 text-white",
    MEDIO: "bg-yellow-500 text-black",
    BAJO: "bg-green-500 text-white",
  };
  return colors[nivel] || "bg-gray-500 text-white";
}

export function getRiskBorderColor(nivel: string): string {
  const colors: Record<string, string> = {
    CRITICO: "border-red-500",
    ALTO: "border-orange-500",
    MEDIO: "border-yellow-500",
    BAJO: "border-green-500",
  };
  return colors[nivel] || "border-gray-500";
}
