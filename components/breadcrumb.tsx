import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="mb-6 flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="flex items-center text-slate-500 hover:text-slate-700"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-slate-400" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-slate-500 hover:text-slate-700"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-900">{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
