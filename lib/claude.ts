import { generateTextSimple } from "@/lib/ai-provider";
import { AI_MODELS, TIMEOUTS } from "@/lib/constants";

export async function generateWithClaude(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.CLAUDE_API);

  try {
    const result = await generateTextSimple(systemPrompt, userPrompt, 4096, controller.signal);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Shared prompt builder used by both the streaming and non-streaming paths
// ---------------------------------------------------------------------------
function buildDocumentPrompts(
  templateName: string,
  variables: Record<string, string>,
  companyContext: string,
  companyInstructions: string,
  language?: string,
  userInstructions?: string,
  caseSummary?: string,
  templateSystemPrompt?: string
): { systemPrompt: string; userPrompt: string } {
  const lang = language || "es";
  const langInstructions: Record<string, { locale: string; region: string }> = {
    es: { locale: "español", region: "Colombia y Latinoamérica" },
    en: { locale: "English", region: "the United States" },
    pt: { locale: "português", region: "Brasil e contextos internacionais" },
    fr: { locale: "français", region: "la France et contextes internationaux" },
    de: { locale: "Deutsch", region: "Deutschland und internationale Kontexte" },
  };
  const li = langInstructions[lang] || langInstructions["es"];

  const persona =
    lang === "en"
      ? `You are an experienced US immigration attorney drafting professional legal documents for ${li.region}.`
      : `Eres un abogado experto redactando documentos legales en ${li.locale} para ${li.region}.`;

  let systemPrompt = `${persona}

FUNDAMENTAL RULES:
1. Draft professional, complete, and well-structured legal documents.
2. Use formal, precise legal language${lang !== "en" ? ` in ${li.locale}` : ""}.
3. Include all standard sections for the document type.
4. CRITICAL — NEVER invent or assume attorney names, firm names, bar numbers, addresses, phone numbers, or any other identifying information that is not explicitly provided in the FIRM IDENTITY section or in the case details below. If a piece of information is missing, insert an exact placeholder such as [Attorney Name], [Bar Number], [Firm Address] — do not fill it in from your training data.
5. Use clear, numbered sections and formal structure appropriate for the document type.
6. If non-identifying case information is missing (e.g. a date, a statute number), use the appropriate generic legal term or a bracketed placeholder.
7. CRITICAL — Reference ONLY the law firm and attorneys identified in the FIRM IDENTITY section. NEVER cite, mention, or substitute a different law firm or attorney from your training data.
8. For US immigration cover letters: follow this structure — date → recipient USCIS address → RE: line → salutation → organized body paragraphs supporting each ground of eligibility → signature block with attorney name placeholder if not provided.`;

  // Template-specific structure instructions take priority over the generic rules above
  if (templateSystemPrompt) {
    systemPrompt += `

═══════════════════════════════════════════════════════════════════════════════
DOCUMENT TYPE INSTRUCTIONS (follow exactly — these override generic rules)
═══════════════════════════════════════════════════════════════════════════════
${templateSystemPrompt}
═══════════════════════════════════════════════════════════════════════════════`;
  }

  if (companyInstructions) {
    systemPrompt += `

═══════════════════════════════════════════════════════════════════════════════
FIRM IDENTITY & INSTRUCTIONS (authoritative — override any training data)
═══════════════════════════════════════════════════════════════════════════════
${companyInstructions}
═══════════════════════════════════════════════════════════════════════════════`;
  }

  if (companyContext) {
    systemPrompt += `

═══════════════════════════════════════════════════════════════════════════════
DOCUMENTOS DE REFERENCIA DE LA FIRMA
═══════════════════════════════════════════════════════════════════════════════

A continuación se presentan documentos previamente aprobados por esta firma.
DEBES usar estos como REFERENCIA para:
- Mantener el MISMO estilo de redacción
- Usar estructuras y cláusulas SIMILARES cuando aplique
- Preservar el TONO y formalidad de la firma
- Adaptar párrafos exitosos al nuevo documento

${companyContext}

═══════════════════════════════════════════════════════════════════════════════

IMPORTANTE: El documento que generes debe ser COHERENTE con el estilo mostrado
en los documentos de referencia. Adapta el contenido a las variables proporcionadas
pero mantén la esencia y calidad de los documentos aprobados.`;
  }

  let userPrompt = `TIPO DE DOCUMENTO: ${templateName}\n\n`;

  if (caseSummary && caseSummary.trim()) {
    userPrompt += `RESUMEN DEL CASO:
═══════════════════════════════════════════════════════════════════════════════
${caseSummary.trim()}
═══════════════════════════════════════════════════════════════════════════════

Con base en el resumen del caso proporcionado, extrae toda la información relevante (partes, fechas, montos, condiciones, etc.) y úsala para generar el documento.`;
  } else {
    userPrompt += `INFORMACIÓN PROPORCIONADA:
${Object.entries(variables)
  .filter(([, v]) => v)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}`;
  }

  if (userInstructions && userInstructions.trim()) {
    userPrompt += `

INSTRUCCIONES ESPECÍFICAS DEL USUARIO:
"""
${userInstructions.trim()}
"""

IMPORTANTE: Presta especial atención a las instrucciones del usuario. Adapta el documento para cumplir con sus requisitos específicos.`;
  }

  userPrompt += `\n\nGenera el documento legal completo${companyContext ? " respetando el estilo de los documentos de referencia" : ""}:`;

  return { systemPrompt, userPrompt };
}

export async function generateDocument(
  templateName: string,
  variables: Record<string, string>,
  language?: string
): Promise<string> {
  return generateDocumentWithContext(templateName, variables, "", "", language);
}

export async function generateDocumentWithContext(
  templateName: string,
  variables: Record<string, string>,
  companyContext: string,
  companyInstructions: string,
  language?: string,
  userInstructions?: string,
  caseSummary?: string,
  templateSystemPrompt?: string
): Promise<string> {
  const { systemPrompt, userPrompt } = buildDocumentPrompts(
    templateName, variables, companyContext, companyInstructions,
    language, userInstructions, caseSummary, templateSystemPrompt
  );
  return generateWithClaude(systemPrompt, userPrompt);
}

// Streaming variant — yields text chunks as Claude generates them.
export async function* streamDocumentWithContext(
  templateName: string,
  variables: Record<string, string>,
  companyContext: string,
  companyInstructions: string,
  language?: string,
  userInstructions?: string,
  caseSummary?: string,
  templateSystemPrompt?: string
): AsyncGenerator<string> {
  const { systemPrompt, userPrompt } = buildDocumentPrompts(
    templateName, variables, companyContext, companyInstructions,
    language, userInstructions, caseSummary, templateSystemPrompt
  );

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = await client.messages.create({
    model: AI_MODELS.ANTHROPIC,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    stream: true,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

export async function analyzeDocument(
  content: string,
  focusContext?: string,
  language?: string
): Promise<string> {
  const lang = language || "es";
  const langMap: Record<string, string> = {
    es: "español", en: "English", pt: "português", fr: "français", de: "Deutsch",
  };
  const locale = langMap[lang] || "español";

  const systemPrompt = `You are an expert corporate lawyer analyzing legal documents.
Your task is to identify risks, problematic clauses, and areas for improvement.
${focusContext ? "SPECIAL FOCUS: The user has requested that you focus on specific aspects. Prioritize your analysis according to their instructions." : ""}
IMPORTANT: All text values in your JSON response MUST be written in ${locale}.
Always respond in valid JSON format.`;

  const maxContentLength = 15000;
  const wasTruncated = content.length > maxContentLength;
  const truncatedContent = content.substring(0, maxContentLength);

  if (wasTruncated) {
    console.warn(
      `Content truncated for analysis: ${content.length} chars -> ${maxContentLength} chars (${Math.round((maxContentLength / content.length) * 100)}% retained)`
    );
  }

  let userPrompt = `DOCUMENTO A ANALIZAR:
"""
${truncatedContent}
"""
${wasTruncated ? "\n[NOTA: El documento fue truncado debido a su extenso tamaño. Análisis basado en los primeros 15,000 caracteres.]" : ""}
`;

  if (focusContext) {
    userPrompt += `
ENFOQUE SOLICITADO POR EL USUARIO:
"${focusContext}"

Prioriza tu análisis según el enfoque solicitado. Asegúrate de abordar específicamente lo que el usuario quiere saber.
`;
  }

  userPrompt += `
Analiza el documento y responde en este formato JSON exacto:
{
  "resumen": "Resumen ejecutivo de 2-3 oraciones${focusContext ? ", enfocado en lo que el usuario solicitó" : ""}${wasTruncated ? ". NOTA: Análisis basado en los primeros 15,000 caracteres del documento." : ""}",
  "score": 5,
  "riesgos": [
    {
      "nivel": "ALTO",
      "descripcion": "Descripción del riesgo",
      "clausula": "Cláusula o sección afectada",
      "recomendacion": "Recomendación de mejora"
    }
  ],
  "clausulas_faltantes": ["Lista de cláusulas importantes que faltan"],
  "observaciones_generales": "Observaciones adicionales${focusContext ? " relacionadas con el enfoque solicitado" : ""}${wasTruncated ? " [El documento original era más extenso, este análisis se basa en una muestra.]" : ""}"
}

IMPORTANTE:
- nivel debe ser: CRITICO, ALTO, MEDIO o BAJO
- score debe ser un número del 1-10 (1=muy seguro, 10=muy riesgoso)
- Responde SOLO con el JSON, sin texto adicional`;

  return generateWithClaude(systemPrompt, userPrompt);
}

// Heuristic title extraction — no AI call, instant.
// Immigration cover letters always include a "RE:" line which is the best title.
export function generateDocumentTitle(content: string, fallbackTitle: string): string {
  const lines = content.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  for (const line of lines) {
    const m = line.match(/^(?:RE|SUBJECT|ASUNTO):\s+(.+)/i);
    if (m) {
      const t = m[1].trim();
      if (t.length >= 5 && t.length <= 100) return t;
    }
  }

  const skip = [
    /^(January|February|March|April|May|June|July|August|September|October|November|December)/i,
    /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
    /^\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/,
    /^(Dear|Estimad|A quien|To whom)/i,
    /^(USCIS|U\.S\.|United States|Embassy|Consulate|Department)/i,
    /^\[/,
  ];
  for (const line of lines.slice(0, 10)) {
    if (line.length < 10 || line.length > 120) continue;
    if (skip.some((p) => p.test(line))) continue;
    const cleaned = line.replace(/^[#*\-=>\s]+/, "").trim();
    if (cleaned.length >= 10) return cleaned.substring(0, 80);
  }

  return fallbackTitle;
}
