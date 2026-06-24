// Client-side file text extraction — runs entirely in the browser.
// PDFs are parsed with pdfjs-dist (no server call, no size limit).
// TXT/MD files are read with FileReader.
// DOCX files fall back to /api/parse-file (usually small enough).

const ALLOWED_MIMES: Record<string, string[]> = {
  ".pdf":  ["application/pdf"],
  ".txt":  ["text/plain"],
  ".md":   ["text/plain", "text/markdown"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
  ],
  ".doc":  ["application/msword", "application/octet-stream"],
};

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const ext = Object.keys(ALLOWED_MIMES).find((e) => name.endsWith(e));
  if (!ext) throw new Error("Formato no soportado (usa PDF, DOCX o TXT)");

  // file.type is '' on some browsers — treat as octet-stream
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIMES[ext].includes(mime)) {
    throw new Error(`Tipo de archivo inválido (${mime}) para extensión ${ext}`);
  }

  if (ext === ".txt" || ext === ".md") return readAsText(file);
  if (ext === ".pdf") return extractPdfText(file);
  return parseViaServer(file); // .docx / .doc
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Error leyendo el archivo"));
    reader.readAsText(file);
  });
}

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Dynamic import keeps pdfjs-dist out of the initial bundle
  const pdfjsLib = await import("pdfjs-dist");

  // Worker is served from public/ — no CDN dependency, always matches installed version.
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const parts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    if (pageText.trim()) parts.push(pageText.trim());
  }

  return parts.join("\n\n");
}

async function parseViaServer(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/parse-file", { method: "POST", body: fd });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `Error del servidor (${res.status})`);
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Error al procesar el archivo");
  return data.data.text as string;
}
