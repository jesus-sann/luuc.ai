"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Download, FileDown, Pencil, Eye, Save, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SuggestionsPanel } from "@/components/suggestions-panel";
import type { AISuggestion } from "@/types/suggestions";

interface DocumentViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  documentId?: string | null;
  onContentChange?: (content: string) => void;
  onSaveSuccess?: (newContent: string) => void;
  suggestions?: AISuggestion[];
  suggestionsLoading?: boolean;
  onSuggestionClick?: (suggestion: AISuggestion) => void;
  locale?: "es" | "en";
}

// Converts plain text with basic markdown to styled HTML for the paper view
function renderDocumentContent(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Heading 1 — lines starting with # or ALL CAPS short lines
    if (/^#{1}\s+/.test(line)) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<h1 class="doc-h1">${line.replace(/^#+\s+/, "")}</h1>`);
      continue;
    }
    // Heading 2
    if (/^#{2,3}\s+/.test(line)) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<h2 class="doc-h2">${line.replace(/^#+\s+/, "")}</h2>`);
      continue;
    }
    // Horizontal rule
    if (/^[-_*]{3,}$/.test(line.trim())) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<hr class="doc-hr" />`);
      continue;
    }
    // Bullet list
    if (/^[\-\*]\s+/.test(line)) {
      if (!inList) { result.push("<ul class=\"doc-ul\">"); inList = true; }
      const content = inlineFormat(line.replace(/^[\-\*]\s+/, ""));
      result.push(`<li class="doc-li">${content}</li>`);
      continue;
    }
    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      if (!inList) { result.push("<ol class=\"doc-ol\">"); inList = true; }
      const content = inlineFormat(line.replace(/^\d+\.\s+/, ""));
      result.push(`<li class="doc-li">${content}</li>`);
      continue;
    }
    // Empty line
    if (line === "") {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<br />`);
      continue;
    }
    // Normal paragraph
    if (inList) { result.push("</ul>"); inList = false; }
    result.push(`<p class="doc-p">${inlineFormat(line)}</p>`);
  }
  if (inList) result.push("</ul>");
  return result.join("");
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}

interface FirmProfile {
  name: string;
  address: string;
  phone: string;
  website: string;
  logo_url: string | null;
  letterhead_url: string | null;
  primary_color: string;
  tagline: string;
}

const DEFAULT_PROFILE: FirmProfile = {
  name: "Your Firm",
  address: "",
  phone: "",
  website: "",
  logo_url: null,
  letterhead_url: null,
  primary_color: "#0f2044",
  tagline: "",
};

function useFirmProfile() {
  const [profile, setProfile] = useState<FirmProfile>(DEFAULT_PROFILE);
  useEffect(() => {
    fetch("/api/company/setup")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const c = data.data;
          const addressParts = [c.address_line1, c.address_line2, c.city && c.state ? `${c.city}, ${c.state} ${c.zip || ""}`.trim() : (c.city || c.state || "")].filter(Boolean);
          setProfile({
            name: c.name || "Your Firm",
            address: addressParts.join(" · "),
            phone: c.phone || "",
            website: c.website || "",
            logo_url: c.logo_url || null,
            letterhead_url: c.letterhead_url || null,
            primary_color: c.primary_color || "#0f2044",
            tagline: c.tagline || "",
          });
        }
      })
      .catch(() => {});
  }, []);
  return profile;
}

export function DocumentViewerModal({
  open,
  onOpenChange,
  title,
  content,
  documentId,
  onContentChange,
  onSaveSuccess,
  suggestions = [],
  suggestionsLoading = false,
  onSuggestionClick,
  locale = "es",
}: DocumentViewerModalProps) {
  const [copied, setCopied] = useState(false);
  const [editableContent, setEditableContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const firm = useFirmProfile();

  const hasChanges = editableContent !== content;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setEditableContent(content);
      setIsEditing(false);
      setSaveStatus("idle");
    }
    onOpenChange(isOpen);
  };

  const handleSave = async () => {
    if (!documentId || !hasChanges) return;
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editableContent }),
      });
      const data = await response.json();
      if (data.success) {
        setSaveStatus("saved");
        onSaveSuccess?.(editableContent);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
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
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const navColor = firm.primary_color || "#0f2044";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-full max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl">

        {/* Top chrome: firm-colored toolbar */}
        <div className="flex-shrink-0 px-5 py-3" style={{ backgroundColor: navColor }}>
          <DialogHeader className="m-0 p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold text-white">
                    {title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-blue-200/70">
                    {wordCount} words · {today}
                  </DialogDescription>
                </div>
              </div>

              {/* Mode toggle */}
              <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    !isEditing ? "bg-white text-[#0f2044]" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  View
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    isEditing ? "bg-white text-[#0f2044]" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Paper document area */}
        <div className="flex-1 overflow-auto bg-[#e8e8e8] px-6 py-6">
          {isEditing ? (
            <textarea
              value={editableContent}
              onChange={(e) => handleContentEdit(e.target.value)}
              className="min-h-[600px] w-full resize-none rounded-none border-0 bg-white p-10 font-mono text-[13.5px] leading-6 text-slate-700 shadow-[0_2px_16px_rgba(0,0,0,0.15)] focus:outline-none"
              spellCheck={false}
            />
          ) : (
            <div className="mx-auto max-w-[680px] rounded-sm bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18)]">
              {/* Letterhead — custom image if set, otherwise auto-generated from firm profile */}
              {firm.letterhead_url ? (
                <div style={{ borderBottom: `4px solid ${navColor}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={firm.letterhead_url}
                    alt={`${firm.name} letterhead`}
                    className="w-full object-contain"
                    style={{ maxHeight: "160px" }}
                  />
                </div>
              ) : (
                <div className="px-12 py-6" style={{ borderBottom: `4px solid ${navColor}` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {firm.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={firm.logo_url} alt={firm.name} className="mb-1 h-8 object-contain" />
                      ) : (
                        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: navColor }}>
                          {firm.name}
                        </p>
                      )}
                      {firm.tagline && (
                        <p className="text-[9px] uppercase tracking-widest text-slate-400">{firm.tagline}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {firm.address && <p className="text-[9px] text-slate-400">{firm.address}</p>}
                      {firm.phone && <p className="text-[9px] text-slate-400">{firm.phone}</p>}
                      {firm.website && (
                        <p className="text-[9px] text-slate-400">{firm.website.replace(/^https?:\/\//, "")}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Document body */}
              <div
                className="document-body px-12 py-10"
                dangerouslySetInnerHTML={{ __html: renderDocumentContent(editableContent) }}
              />

              {/* Footer */}
              <div className="border-t border-slate-200 px-12 py-4">
                <p className="text-center text-[8.5px] text-slate-400">
                  DRAFT — This document was generated with AI assistance and must be reviewed by a licensed attorney before use.
                </p>
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {(suggestionsLoading || suggestions.length > 0) && (
            <div className="mx-auto mt-4 max-w-[680px]">
              <SuggestionsPanel
                suggestions={suggestions}
                isLoading={suggestionsLoading}
                onSuggestionClick={onSuggestionClick}
                locale={locale}
                defaultExpanded={true}
              />
            </div>
          )}
        </div>

        {/* Footer toolbar */}
        <div className="flex flex-shrink-0 items-center gap-2 border-t border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
          {documentId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload("docx")}
                className="gap-1.5 text-xs"
              >
                <FileDown className="h-3.5 w-3.5" />
                DOCX
              </Button>
              <Button
                size="sm"
                onClick={() => handleDownload("pdf")}
                className="gap-1.5 text-xs text-white"
                style={{ backgroundColor: navColor }}
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>
            </>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>

          <div className="flex-1" />

          {documentId && hasChanges && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className={`gap-1.5 text-xs ${
                saveStatus === "saved"
                  ? "bg-green-600 hover:bg-green-700"
                  : saveStatus === "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
              } text-white`}
            >
              {isSaving ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
              ) : saveStatus === "saved" ? (
                <><Check className="h-3.5 w-3.5" />Saved</>
              ) : saveStatus === "error" ? (
                <>Save failed</>
              ) : (
                <><Save className="h-3.5 w-3.5" />Save changes</>
              )}
            </Button>
          )}

          <Button
            onClick={() => handleOpenChange(false)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
