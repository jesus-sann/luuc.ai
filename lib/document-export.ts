import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Header,
  Footer,
  HeadingLevel,
  AlignmentType,
  PageNumber,
  BorderStyle,
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

/** Fetch an image URL and return bytes + MIME type. */
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

// ─── Line classifiers ────────────────────────────────────────────────────────

/** True if a line looks like a date (e.g. "June __, 2026" / "January 15, 2026"). */
function isDateLine(line: string): boolean {
  return /^(January|February|March|April|May|June|July|August|September|October|November|December)\b.{0,20}\d{4}$/.test(line.trim());
}

/** True if a line starts with "RE:" or "Re:" — the reference block of a letter. */
function isRELine(line: string): boolean {
  return /^RE:/i.test(line.trim());
}

/**
 * True if the line is a structural section heading:
 *  - Markdown # / ## prefix
 *  - ALL-CAPS text (≥4 alpha chars)
 *  - Roman-numeral or numbered sections  (I. / II. / 1. / 1.1)
 *  - Named keywords (CLÁUSULA, ARTÍCULO …)
 */
function isHeading(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (/^#{1,3}\s/.test(t)) return true;
  const letters = t.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ]/g, "");
  if (letters.length >= 4 && letters === letters.toUpperCase()) return true;
  if (/^(CLÁUSULA|CLAUSULA|ARTÍCULO|ARTICULO|SECCIÓN|SECCION|CAPÍTULO|CAPITULO)\b/i.test(t)) return true;
  if (/^(I{1,3}V?|VI{0,3}|IX|X{1,3})\.\s/i.test(t) && t.length < 120) return true; // Roman numerals
  return false;
}

/** True if a line is a bold sub-heading (A. / B. / C. pattern). */
function isSubHeading(line: string): boolean {
  return /^\*\*[A-Z]\.\s/.test(line.trim()) || /^[A-Z]\.\s[A-Z]/.test(line.trim());
}

/** Strip leading # markers. */
function stripMdHeading(line: string): string {
  return line.replace(/^#{1,3}\s*/, "").trim();
}

/** Strip ALL markdown syntax → plain text. */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s*/, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

// ─── Inline markdown → TextRun[] ────────────────────────────────────────────

function parseInline(
  text: string,
  baseSize = 24,
  font = "Calibri",
  extraBold = false
): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|([^*]+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m[1] !== undefined)
      runs.push(new TextRun({ text: m[1], bold: true, size: baseSize, font }));
    else if (m[2] !== undefined)
      runs.push(new TextRun({ text: m[2], italics: true, size: baseSize, font }));
    else if (m[3])
      runs.push(new TextRun({ text: m[3], bold: extraBold, size: baseSize, font }));
  }
  return runs.length ? runs : [new TextRun({ text, bold: extraBold, size: baseSize, font })];
}

// ─── DOCX Generation ────────────────────────────────────────────────────────

export async function generateDocx(
  title: string,
  content: string,
  firm?: FirmInfo | null
): Promise<Buffer> {
  const FONT = "Times New Roman";
  const SIZE = 24; // half-points = 12pt

  // ── Build document header (repeats on every page) ──
  const headerChildren: Paragraph[] = [];
  const letterheadUrl = firm?.letterhead_url || firm?.logo_url;

  if (letterheadUrl) {
    const img = await fetchImageBytes(letterheadUrl);
    if (img) {
      headerChildren.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: img.data,
              transformation: { width: 600, height: 90 },
              type: img.mimeType === "image/png" ? "png" : "jpg",
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 80 },
        })
      );
    }
  } else if (firm?.name) {
    headerChildren.push(
      new Paragraph({
        children: [new TextRun({ text: firm.name, bold: true, size: 28, font: FONT })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
      })
    );
    const parts = [
      firm.address_line1,
      [firm.city, firm.state, firm.zip].filter(Boolean).join(", "),
      firm.phone,
      firm.website,
    ].filter(Boolean) as string[];
    if (parts.length) {
      headerChildren.push(
        new Paragraph({
          children: [new TextRun({ text: parts.join("  •  "), size: 18, font: FONT, color: "666666" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        })
      );
    }
  }

  // Thin rule under header
  if (headerChildren.length) {
    headerChildren.push(
      new Paragraph({
        border: {
          bottom: { color: "CCCCCC", size: 4, space: 1, style: BorderStyle.SINGLE },
        },
        spacing: { after: 0 },
      })
    );
  }

  // ── Parse content lines ──
  const body: Paragraph[] = [];
  const lines = content.split("\n");
  let runBuffer: TextRun[] = [];
  let isRE = false; // inside a RE: block

  const flushBuffer = (align = AlignmentType.JUSTIFIED) => {
    if (!runBuffer.length) return;
    body.push(
      new Paragraph({
        children: runBuffer,
        spacing: { after: 160, line: 276 },
        alignment: align,
        ...(isRE && { indent: { left: 720 } }),
      })
    );
    runBuffer = [];
  };

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (!trimmed) {
      flushBuffer();
      isRE = false;
      continue;
    }

    // Date line → right-aligned, no bold
    if (isDateLine(trimmed)) {
      flushBuffer();
      body.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: SIZE, font: FONT })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 200 },
        })
      );
      continue;
    }

    // Markdown heading
    const mdLevel = trimmed.match(/^(#{1,3})\s/) ? trimmed.match(/^(#{1,3})\s/)![1].length : 0;
    if (mdLevel > 0) {
      flushBuffer();
      isRE = false;
      const text = stripMdHeading(trimmed);
      body.push(
        new Paragraph({
          children: [new TextRun({ text, bold: true, size: mdLevel === 1 ? 28 : SIZE, font: FONT })],
          heading: mdLevel === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 120 },
        })
      );
      continue;
    }

    // ALL-CAPS / roman numeral section heading
    if (isHeading(trimmed)) {
      flushBuffer();
      isRE = false;
      body.push(
        new Paragraph({
          children: [new TextRun({ text: stripMarkdown(trimmed), bold: true, size: SIZE, font: FONT })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 120 },
        })
      );
      continue;
    }

    // RE: block — bold, indented
    if (isRELine(trimmed)) {
      flushBuffer();
      isRE = true;
      runBuffer = parseInline(trimmed, SIZE, FONT, true);
      continue;
    }

    // Sub-heading (A. / B. / C.)
    if (isSubHeading(trimmed)) {
      flushBuffer();
      isRE = false;
      body.push(
        new Paragraph({
          children: parseInline(trimmed, SIZE, FONT),
          spacing: { before: 200, after: 80 },
          indent: { left: 360 },
        })
      );
      continue;
    }

    // Normal body line — accumulate into paragraph buffer
    if (runBuffer.length > 0) {
      runBuffer.push(new TextRun({ text: " ", size: SIZE, font: FONT }));
    }
    runBuffer.push(...parseInline(trimmed, SIZE, FONT, isRE));
  }

  flushBuffer();

  // ── Assemble document ──
  const topMargin = headerChildren.length ? 1800 : 1440; // extra space for header

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: topMargin, bottom: 1440, left: 1440, right: 1440 },
            size: { width: 12240, height: 15840 },
          },
        },
        headers: headerChildren.length
          ? { default: new Header({ children: headerChildren }) }
          : undefined,
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, font: FONT })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: body,
      },
    ],
    numbering: { config: [] },
    styles: {
      default: { document: { run: { font: "Times New Roman", size: SIZE } } },
    },
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

// ─── PDF Generation ──────────────────────────────────────────────────────────

export async function generatePdf(
  title: string,
  content: string,
  firm?: FirmInfo | null
): Promise<Buffer> {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = 215.9;
  const pageH = 279.4;
  const margin = 25.4; // 1 inch
  const contentW = pageW - margin * 2;

  // Pre-fetch letterhead image so we can draw it on every page
  const letterheadUrl = firm?.letterhead_url || firm?.logo_url;
  let lhImg: { base64: string; fmt: "PNG" | "JPEG"; mimeType: string } | null = null;
  let lhH = 0; // letterhead height in mm

  if (letterheadUrl) {
    const raw = await fetchImageBytes(letterheadUrl);
    if (raw) {
      lhImg = {
        base64: Buffer.from(raw.data).toString("base64"),
        fmt: raw.mimeType === "image/png" ? "PNG" : "JPEG",
        mimeType: raw.mimeType,
      };
      lhH = 22; // 22mm tall image
    }
  }

  const textLhH = !lhImg && firm?.name ? (firm.phone || firm.address_line1 ? 14 : 9) : 0;
  const headerH = lhImg ? lhH + 4 : textLhH > 0 ? textLhH + 4 : 0; // total header block height

  /** Draw the letterhead on whatever the current page is. */
  const drawHeader = () => {
    if (lhImg) {
      doc.addImage(
        `data:${lhImg.mimeType};base64,${lhImg.base64}`,
        lhImg.fmt,
        margin,
        10,
        contentW,
        lhH
      );
      doc.setDrawColor(200);
      doc.line(margin, 10 + lhH + 1, pageW - margin, 10 + lhH + 1);
    } else if (firm?.name) {
      let hy = 14;
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.text(firm.name, pageW / 2, hy, { align: "center" });
      hy += 5;
      const parts = [
        firm.address_line1,
        [firm.city, firm.state, firm.zip].filter(Boolean).join(", "),
        firm.phone,
        firm.website,
      ].filter(Boolean) as string[];
      if (parts.length) {
        doc.setFont("times", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(parts.join("  •  "), pageW / 2, hy, { align: "center" });
        doc.setTextColor(0);
        hy += 4;
      }
      doc.setDrawColor(200);
      doc.line(margin, hy, pageW - margin, hy);
    }
  };

  // Starting y — below header block
  let y = margin + headerH;

  const addPage = () => {
    doc.addPage();
    drawHeader();
    y = margin + headerH;
  };

  const checkSpace = (needed: number) => {
    if (y + needed > pageH - margin) addPage();
  };

  // Draw header on page 1
  drawHeader();

  // ── Render content ──
  const lines = content.split("\n");
  let paraBuffer = "";
  let inRE = false;

  const flushPara = (rightAlign = false) => {
    if (!paraBuffer.trim()) return;
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    const lineW = inRE ? contentW - 12 : contentW;
    const xStart = inRE ? margin + 12 : margin;
    const wrapped = doc.splitTextToSize(paraBuffer.trim(), lineW);
    for (const wl of wrapped) {
      checkSpace(5);
      doc.text(wl, rightAlign ? pageW - margin : xStart, y, {
        align: rightAlign ? "right" : "left",
      });
      y += 5;
    }
    y += 3;
    paraBuffer = "";
  };

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (!trimmed) {
      flushPara();
      inRE = false;
      y += 1;
      continue;
    }

    // Date → right-aligned
    if (isDateLine(trimmed)) {
      flushPara();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      checkSpace(6);
      y += 4;
      doc.text(trimmed, pageW - margin, y, { align: "right" });
      y += 7;
      continue;
    }

    // Markdown heading
    if (/^#{1,3}\s/.test(trimmed)) {
      flushPara();
      inRE = false;
      const lvl = (trimmed.match(/^(#{1,3})\s/)![1]).length;
      const text = stripMdHeading(trimmed);
      doc.setFont("times", "bold");
      doc.setFontSize(lvl === 1 ? 13 : 11);
      const hw = doc.splitTextToSize(text, contentW);
      checkSpace(hw.length * 6 + 6);
      y += 4;
      for (const hl of hw) { doc.text(hl, margin, y); y += 6; }
      y += 2;
      continue;
    }

    // ALL-CAPS / roman numeral heading
    if (isHeading(trimmed)) {
      flushPara();
      inRE = false;
      const text = stripMarkdown(trimmed);
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      const hw = doc.splitTextToSize(text, contentW);
      checkSpace(hw.length * 6 + 6);
      y += 4;
      for (const hl of hw) { doc.text(hl, margin, y); y += 6; }
      y += 2;
      continue;
    }

    // RE: block
    if (isRELine(trimmed)) {
      flushPara();
      inRE = true;
      paraBuffer = stripMarkdown(trimmed);
      continue;
    }

    // Sub-heading (A. / B. / C.)
    if (isSubHeading(trimmed)) {
      flushPara();
      inRE = false;
      const text = stripMarkdown(trimmed);
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      const hw = doc.splitTextToSize(text, contentW - 12);
      checkSpace(hw.length * 6 + 4);
      y += 3;
      for (const hl of hw) { doc.text(hl, margin + 12, y); y += 6; }
      y += 2;
      continue;
    }

    // Normal body — accumulate
    const plain = stripMarkdown(trimmed);
    paraBuffer += (paraBuffer ? " " : "") + plain;
  }

  flushPara();

  // Page numbers on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`${i}`, pageW / 2, pageH - 8, { align: "center" });
    doc.setTextColor(0);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
