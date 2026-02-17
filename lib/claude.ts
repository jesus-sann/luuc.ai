import { generateTextSimple } from "@/lib/ai-provider";
import { type AIProvider } from "@/lib/constants";
import { TIMEOUTS } from "@/lib/constants";

export async function generateWithClaude(
  systemPrompt: string,
  userPrompt: string,
  provider?: AIProvider
): Promise<string> {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.CLAUDE_API);

  try {
    const result = await Promise.race([
      generateTextSimple(systemPrompt, userPrompt, 4096, provider),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () => {
          reject(new Error("AI request timed out after 60 seconds"));
        });
      }),
    ]);

    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function generateDocument(
  templateName: string,
  variables: Record<string, string>,
  provider?: AIProvider,
  language?: string
): Promise<string> {
  return generateDocumentWithContext(templateName, variables, "", "", provider, language);
}

/**
 * Genera un documento usando contexto de documentos de referencia de la empresa
 * CLAVE: Esta funcion permite que los documentos generados respeten el estilo de la firma
 */
export async function generateDocumentWithContext(
  templateName: string,
  variables: Record<string, string>,
  companyContext: string,
  companyInstructions: string,
  provider?: AIProvider,
  language?: string,
  userInstructions?: string
): Promise<string> {
  const lang = language || "es";
  const langInstructions: Record<string, { locale: string; region: string }> = {
    es: { locale: "español", region: "Colombia y Latinoamérica" },
    en: { locale: "English", region: "the United States and international contexts" },
    pt: { locale: "português", region: "Brasil e contextos internacionais" },
    fr: { locale: "français", region: "la France et contextes internationaux" },
    de: { locale: "Deutsch", region: "Deutschland und internationale Kontexte" },
  };
  const li = langInstructions[lang] || langInstructions["es"];

  let systemPrompt = `Eres un abogado corporativo experto redactando documentos legales en ${li.locale} para ${li.region}.

REGLAS FUNDAMENTALES:
1. Redacta documentos legales profesionales y completos
2. Usa lenguaje formal y preciso
3. Incluye todas las cláusulas estándar para el tipo de documento
4. NO incluyas placeholders como [INSERTAR] - usa la información proporcionada
5. Formatea con secciones claras y numeradas
6. Si falta información crítica, usa términos genéricos apropiados`;

  // Agregar instrucciones específicas de la empresa si existen
  if (companyInstructions) {
    systemPrompt += `

INSTRUCCIONES ESPECÍFICAS DE LA FIRMA:
${companyInstructions}`;
  }

  // Agregar contexto de documentos de referencia si existe
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

  let userPrompt = `TIPO DE DOCUMENTO: ${templateName}

INFORMACIÓN PROPORCIONADA:
${Object.entries(variables)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}`;

  // Add user-specific instructions if provided
  if (userInstructions && userInstructions.trim()) {
    userPrompt += `

INSTRUCCIONES ESPECÍFICAS DEL USUARIO:
"""
${userInstructions.trim()}
"""

IMPORTANTE: Presta especial atención a las instrucciones del usuario. Adapta el documento para cumplir con sus requisitos específicos.`;
  }

  userPrompt += `

Genera el documento legal completo${companyContext ? " respetando el estilo de los documentos de referencia" : ""}:`;

  return generateWithClaude(systemPrompt, userPrompt, provider);
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

  // Truncate content if too long and log it
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

/**
 * Generate a concise, descriptive title for a legal document based on its content.
 * Falls back to the provided fallback title if AI call fails.
 */
export async function generateDocumentTitle(
  content: string,
  fallbackTitle: string,
  provider?: AIProvider
): Promise<string> {
  try {
    const systemPrompt = "You extract a concise professional title from legal documents. Return ONLY the title, nothing else. Max 80 characters. No quotes.";
    const snippet = content.substring(0, 2000);
    const userPrompt = `Extract a short descriptive title for this legal document:\n\n${snippet}`;
    const title = await generateTextSimple(systemPrompt, userPrompt, 100, provider);
    const cleaned = title.trim().replace(/^["']|["']$/g, "");
    return cleaned.length > 0 && cleaned.length <= 100 ? cleaned : fallbackTitle;
  } catch {
    return fallbackTitle;
  }
}
