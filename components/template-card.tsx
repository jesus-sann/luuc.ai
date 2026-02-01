"use client";

import Link from "next/link";
import {
  Shield,
  FileText,
  FileX,
  Users,
  BookOpen,
  LucideIcon,
} from "lucide-react";
import { Template } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  Shield,
  FileText,
  FileX,
  Users,
  BookOpen,
};

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const Icon = iconMap[template.icon] || FileText;

  return (
    <Link href={`/dashboard/redactar/${template.slug}`}>
      <div className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-blue-100">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{template.name}</h3>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {template.description}
            </p>
          </div>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
            <FileText className="h-3 w-3" />
            {template.outputType}
          </span>
          <span>·</span>
          <span>{template.variables.length} campos</span>
        </div>
      </div>
    </Link>
  );
}
