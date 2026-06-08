import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  Footer,
  PageNumber,
} from "docx";
import { jsPDF } from "jspdf";

// ─── Firm info type ──────────────────────────────────────────────────────────

export interface FirmInfo {
  name?: string | null;
  letterhead_url?: string | null;
  logo_url?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  website?: string | null;
  bar_number?: string | null;
}

/** Fetch an image from a URL and return its bytes + detected MIME type. */
async function fetchImageBytes(
  url: string
): Promise<{ data: ArrayBuffer; mimeType: "image/png" | "image/jpeg" } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    const mimeType = ct.includes("png") ? "image/png" : "image/jpeg";
    return { data: await res.arrayBuffer(), mimeType };
  } catch {
    return null;
  }
}

// ─── Markdown helpers ───────────────────────────────────────────────────────

/** Return 1-3 if the line starts with # / ## / ###, else 0. */
function mdHeadingLevel(line: string): number {
  const m = line.match(/^(#{1,3})\s/);
  return m ? m[1].length : 0;
}

/** Strip leading # markers and trailing colons from a heading line. */
function stripMdHeading(line: string): string {
  return line.replace(/^#{1,3}\s*/, "").replace(/:$/, "").trim();
}

/**
 * Parse a line of text that may contain **bold** and *italic* spans into an
 * array of docx TextRun objects so formatting is preserved in the .docx file.
 */
function parseInlineMarkdown(
  text: string,
  baseSize = 24,
  baseFont = "Calibri"
): TextRun[] {
  const runs: TextRun[] = [];
  // Match **bold**, *italic*, or plain text segments in order
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|([^*]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match[1] !== undefined) {
      runs.push(new TextRun({ text: match[1], bold: true, size: baseSize, font: baseFont }));
    } else if (match[2] !== undefined) {
      runs.push(new TextRun({ text: match[2], italics: true, size: baseSize, font: baseFont }));
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], size: baseSize, font: baseFont }));
    }
  }
  return runs.length ? runs : [new TextRun({ text, size: baseSize, font: baseFont })];
}

/**
 * Strip ALL markdown syntax from a line, returning plain text.
 * Used by the PDF generator which cannot do inline mixed styles.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s*/, "")   // headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/\*(.+?)\*/g, "$1")     // italic
    .replace(/__(.+?)__/g, "$1")     // alt bold
    .replace(/_(.+?)_/g, "$1")       // alt italic
    .replace(/`(.+?)`/g, "$1")       // inline code
    .trim();
}

/** True if a line is a structural heading (markdown or ALL-CAPS or numbered). */
function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (mdHeadingLevel(trimmed) > 0) return true;
  // ALL CAPS lines (≥4 letters, >60% uppercase)
  const letters = trimmed.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ]/g, "");
  if (letters.length >= 4 && letters === letters.toUpperCase()) return true;
  // Named section keywords
  if (/^(CLÁUSULA|CLAUSULA|ARTÍCULO|ARTICULO|SECCIÓN|SECCION|CAPÍTULO|CAPITULO)\b/i.test(trimmed)) return true;
  // Short lines ending with a colon
  if (trimmed.endsWith(":") && trimmed.length < 80) return true;
  return false;
}

// ─── DOCX Generation ────────────────────────────────────────────────────────

export async function generateDocx(title: string, content: string, firm?: FirmInfo | null): Promise<Buffer> {
  const lines = content.split("\n");
  const children: Paragraph[] = [];

  // ── Letterhead / firm header ──
  const letterheadUrl = firm?.letterhead_url || firm?.logo_url;
  if (letterheadUrl) {
    const img = await fetchImageBytes(letterheadUrl);
    if (img) {
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: img.data,
              transformation: { width: 540, height: 100 },
              type: img.mimeType === "image/png" ? "png" : "jpg",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }
  } else if (firm?.name) {
    // Text-based firm header
    children.push(
      new Paragraph({
        children: [new TextRun({ text: firm.name, bold: true, size: 28, font: "Calibri" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      })
    );
    const addressParts = [
      firm.address_line1,
      firm.address_line2,
      [firm.city, firm.state, firm.zip].filter(Boolean).join(", "),
      firm.phone,
      firm.website,
    ].filter(Boolean);
    if (addressParts.length) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: addressParts.join("  |  "), size: 18, font: "Calibri", color: "666666" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }
  }

  // Horizontal rule (empty paragraph with border)
  if (firm?.name || letterheadUrl) {
    children.push(
      new Paragraph({
        border: { bottom: { color: "CCCCCC", size: 6, space: 1, style: "single" } },
        spacing: { after: 240 },
      })
    );
  }

  // Document title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 32, font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );
  children.push(new Paragraph({ spacing: { after: 200 } }));

  // Buffer consecutive body lines into paragraphs so word-wrap works correctly
  let paragraphRuns: TextRun[] = [];

  const flushParagraph = () => {
    if (paragraphRuns.length) {
      children.push(
        new Paragraph({
          children: paragraphRuns,
          spacing: { after: 120, line: 276 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
      paragraphRuns = [];
    }
  };

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const mdLevel = mdHeadingLevel(trimmed);

    if (mdLevel > 0) {
      flushParagraph();
      const text = stripMdHeading(trimmed);
      const level = mdLevel === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2;
      children.push(
        new Paragraph({
          children: [new TextRun({ text, bold: true, size: mdLevel === 1 ? 28 : 24, font: "Calibri" })],
          heading: level,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (isHeading(trimmed)) {
      flushParagraph();
      const text = stripMarkdown(trimmed);
      children.push(
        new Paragraph({
          children: [new TextRun({ text, bold: true, size: 24, font: "Calibri" })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
    } else {
      // Body line — parse inline markdown and append to current paragraph buffer.
      // A new paragraph starts after a blank line (handled above by flushParagraph).
      const runs = parseInlineMarkdown(trimmed);
      if (paragraphRuns.length > 0) {
        // Add a space between lines that were joined
        paragraphRuns.push(new TextRun({ text: " ", size: 24, font: "Calibri" }));
      }
      paragraphRuns.push(...runs);
    }
  }

  flushParagraph();

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
            size: { width: 12240, height: 15840 },
          },
        },
        children,
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Calibri" }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
      },
    ],
    numbering: { config: [] },
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 24 } },
      },
    },
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

// ─── PDF Generation ──────────────────────────────────────────────────────────

export async function generatePdf(title: string, content: string, firm?: FirmInfo | null): Promise<Buffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 25;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPage = () => { doc.addPage(); y = margin; };
  const checkSpace = (needed: number) => { if (y + needed > pageHeight - margin) addPage(); };

  // ── Letterhead / firm header ──
  const letterheadUrl = firm?.letterhead_url || firm?.logo_url;
  if (letterheadUrl) {
    const img = await fetchImageBytes(letterheadUrl);
    if (img) {
      const imgData = Buffer.from(img.data).toString("base64");
      const fmt = img.mimeType === "image/png" ? "PNG" : "JPEG";
      const imgH = 20; // 20mm tall
      const imgW = contentWidth;
      doc.addImage(`data:${img.mimeType};base64,${imgData}`, fmt, margin, y, imgW, imgH);
      y += imgH + 4;
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    }
  } else if (firm?.name) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(firm.name, pageWidth / 2, y, { align: "center" });
    y += 6;
    const addressParts = [
      firm.address_line1,
      [firm.city, firm.state, firm.zip].filter(Boolean).join(", "),
      firm.phone,
      firm.website,
    ].filter(Boolean);
    if (addressParts.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(addressParts.join("   |   "), pageWidth / 2, y, { align: "center" });
      doc.setTextColor(0);
      y += 5;
    }
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(title, contentWidth);
  checkSpace(titleLines.length * 8);
  doc.text(titleLines, pageWidth / 2, y, { align: "center" });
  y += titleLines.length * 8 + 6;

  // Separator
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Content
  const lines = content.split("\n");
  let paragraphBuffer = "";

  const flushParagraph = () => {
    if (!paragraphBuffer.trim()) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const wrapped = doc.splitTextToSize(paragraphBuffer.trim(), contentWidth);
    for (const wline of wrapped) {
      checkSpace(5);
      doc.text(wline, margin, y);
      y += 5;
    }
    y += 3;
    paragraphBuffer = "";
  };

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (!trimmed) {
      flushParagraph();
      y += 2;
      continue;
    }

    const mdLevel = mdHeadingLevel(trimmed);

    if (mdLevel > 0 || isHeading(trimmed)) {
      flushParagraph();
      const text = mdLevel > 0 ? stripMdHeading(trimmed) : stripMarkdown(trimmed);
      const fontSize = mdLevel === 1 ? 13 : 11;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(fontSize);
      const headingLines = doc.splitTextToSize(text, contentWidth);
      checkSpace(headingLines.length * 6 + 4);
      y += 3;
      for (const hl of headingLines) {
        doc.text(hl, margin, y);
        y += 6;
      }
      y += 2;
    } else {
      // Strip markdown and accumulate into paragraph
      const plain = stripMarkdown(trimmed);
      paragraphBuffer += (paragraphBuffer ? " " : "") + plain;
    }
  }

  flushParagraph();

  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.setTextColor(0);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
