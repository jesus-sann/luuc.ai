import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Footer,
  PageNumber,
  NumberFormat,
} from "docx";
import { jsPDF } from "jspdf";

/**
 * Detect if a line is a heading/title in the generated legal document.
 * Patterns: ALL CAPS lines, numbered sections (1., 2., CLÁUSULA PRIMERA, etc.)
 */
function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  // ALL CAPS lines (at least 4 chars, >60% uppercase letters)
  const letters = trimmed.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ]/g, "");
  if (letters.length >= 4 && letters === letters.toUpperCase()) return true;
  // Numbered sections: "1.", "1.1", "CLÁUSULA", "ARTÍCULO", "SECCIÓN"
  if (/^(\d+\.?\d*[\.\-\)]?\s)/.test(trimmed) && trimmed.length < 120) return true;
  if (/^(CLÁUSULA|CLAUSULA|ARTÍCULO|ARTICULO|SECCIÓN|SECCION|CAPÍTULO|CAPITULO)\b/i.test(trimmed)) return true;
  // Lines ending with colon that are short (section titles)
  if (trimmed.endsWith(":") && trimmed.length < 80) return true;
  return false;
}

function isTitle(line: string): boolean {
  const trimmed = line.trim();
  // Document title: usually the first non-empty ALL CAPS line, or contains key words
  if (/^(CONTRATO|ACUERDO|CARTA|ACTA|POLÍTICA|MEMORANDO|NDA|PODER)/i.test(trimmed)) return true;
  return false;
}

// ─── DOCX Generation ───

export async function generateDocx(title: string, content: string): Promise<Buffer> {
  const lines = content.split("\n");
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 32, font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Separator
  children.push(new Paragraph({ spacing: { after: 200 } }));

  let inParagraph = false;
  let paragraphText = "";

  const flushParagraph = () => {
    if (paragraphText.trim()) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: paragraphText.trim(), size: 24, font: "Calibri" })],
          spacing: { after: 120, line: 276 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
    paragraphText = "";
    inParagraph = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (isTitle(trimmed) && children.length <= 3) {
      flushParagraph();
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 28, font: "Calibri" })],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );
    } else if (isHeading(trimmed)) {
      flushParagraph();
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 24, font: "Calibri" })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
    } else {
      // Continuation of paragraph or new paragraph text
      if (inParagraph) {
        paragraphText += " " + trimmed;
      } else {
        paragraphText = trimmed;
        inParagraph = true;
      }
    }
  }

  flushParagraph();

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
            size: { width: 12240, height: 15840 }, // Letter size in twips
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
        document: {
          run: { font: "Calibri", size: 24 },
        },
      },
    },
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

// ─── PDF Generation ───

export function generatePdf(title: string, content: string): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 25;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      addPage();
    }
  };

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(title, contentWidth);
  checkSpace(titleLines.length * 8);
  doc.text(titleLines, pageWidth / 2, y, { align: "center" });
  y += titleLines.length * 8 + 6;

  // Separator line
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
    const blockHeight = wrapped.length * 5;
    checkSpace(Math.min(blockHeight, 20)); // at least check first few lines fit
    for (const wline of wrapped) {
      checkSpace(5);
      doc.text(wline, margin, y);
      y += 5;
    }
    y += 3;
    paragraphBuffer = "";
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      y += 2;
      continue;
    }

    if (isHeading(trimmed)) {
      flushParagraph();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const headingLines = doc.splitTextToSize(trimmed, contentWidth);
      checkSpace(headingLines.length * 6 + 4);
      y += 3;
      for (const hl of headingLines) {
        doc.text(hl, margin, y);
        y += 6;
      }
      y += 2;
    } else {
      paragraphBuffer += (paragraphBuffer ? " " : "") + trimmed;
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
