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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card className="h-full cursor-pointer transition-all hover:border-blue-300 hover:shadow-md">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            {template.variables.length} campos requeridos
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
