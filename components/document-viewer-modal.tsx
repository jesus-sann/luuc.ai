"use client";

import { useState } from "react";
import { FileText, Copy, Check, Download, FileDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DocumentViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  documentId?: string | null;
  /** Called when user edits content in the modal */
  onContentChange?: (content: string) => void;
}

export function DocumentViewerModal({
  open,
  onOpenChange,
  title,
  content,
  documentId,
  onContentChange,
}: DocumentViewerModalProps) {
  const [copied, setCopied] = useState(false);
  const [editableContent, setEditableContent] = useState(content);

  // Sync when content prop changes (new document opened)
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setEditableContent(content);
    }
    onOpenChange(isOpen);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "docx" | "pdf") => {
    if (documentId) {
      const link = document.createElement("a");
      link.href = `/api/documents/${documentId}/export?format=${format}`;
      link.click();
    }
  };

  const handleContentEdit = (value: string) => {
    setEditableContent(value);
    onContentChange?.(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-4xl flex-col p-0">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate text-base font-semibold text-slate-900 dark:text-white">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Puedes editar el contenido antes de descargar
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Editable Content */}
        <div className="flex-1 overflow-hidden px-6 py-4">
          <textarea
            value={editableContent}
            onChange={(e) => handleContentEdit(e.target.value)}
            className="h-full min-h-[400px] w-full resize-none rounded-lg border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            spellCheck={false}
          />
        </div>

        {/* Footer with Actions */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-slate-200 px-6 py-3 dark:border-slate-700">
          <div className="text-xs text-slate-400">
            {editableContent.split(/\s+/).filter(Boolean).length} palabras
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <Copy className="mr-1.5 h-3.5 w-3.5" />
              )}
              {copied ? "Copiado" : "Copiar"}
            </Button>
            {documentId && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleDownload("docx")}>
                  <FileDown className="mr-1.5 h-3.5 w-3.5" />
                  DOCX
                </Button>
                <Button size="sm" onClick={() => handleDownload("pdf")} className="bg-blue-600 text-white hover:bg-blue-700">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
