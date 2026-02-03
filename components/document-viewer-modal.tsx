"use client";

import { useState } from "react";
import { Copy, Check, Download, FileDown } from "lucide-react";
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

  const wordCount = editableContent.split(/\s+/).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl p-0">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            {wordCount} palabras
          </DialogDescription>
        </DialogHeader>

        {/* Divider */}
        <div className="mx-6 border-t border-slate-200 dark:border-slate-700" />

        {/* Editable Content */}
        <div className="flex-1 overflow-auto px-6 py-5">
          <textarea
            value={editableContent}
            onChange={(e) => handleContentEdit(e.target.value)}
            className="min-h-[350px] w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-7 text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-300"
            spellCheck={false}
          />
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-slate-200 dark:border-slate-700" />

        {/* Footer */}
        <div className="flex-shrink-0 px-6 pt-3">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            El contenido generado por IA es un borrador que debe ser revisado por un profesional legal. Luuc.ai no sustituye el asesoramiento jurídico.
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3 px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="rounded-xl"
          >
            {copied ? (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" />
            )}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <div className="flex-1" />
          {documentId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("docx")}
                className="rounded-xl"
              >
                <FileDown className="mr-1.5 h-3.5 w-3.5" />
                DOCX
              </Button>
              <Button
                size="sm"
                onClick={() => handleDownload("pdf")}
                className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                PDF
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
