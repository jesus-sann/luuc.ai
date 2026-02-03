"use client";

import { useState } from "react";
import { Copy, Check, Download, FileDown, FileText, Pencil, Eye } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setEditableContent(content);
      setIsEditing(false);
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                {wordCount} palabras
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Divider */}
        <div className="mx-6 border-t border-slate-200 dark:border-slate-700" />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
          {/* Toolbar Banner */}
          <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsEditing(false)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  !isEditing
                    ? "bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Vista
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isEditing
                    ? "bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>

          {/* Document Content */}
          {isEditing ? (
            <textarea
              value={editableContent}
              onChange={(e) => handleContentEdit(e.target.value)}
              className="min-h-[350px] w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-[15px] leading-7 text-slate-600 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-blue-600"
              spellCheck={false}
            />
          ) : (
            <div className="min-h-[350px] whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-[15px] leading-7 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
              {editableContent}
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
        <div className="flex flex-shrink-0 items-center gap-3 px-6 py-4">
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
          <div className="flex-1" />
          <Button
            onClick={() => handleOpenChange(false)}
            className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
