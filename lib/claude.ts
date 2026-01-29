import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateWithClaude(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }

  throw new Error("Unexpected response format from Claude");
}

export async function generateDocument(
  templateName: string,
  variables: Record<string, string>
): Promise<string> {
  return generateDocumentWithContext(templateName, variables, "", "");
}

/**
 * Genera un documento usando contexto de documentos de referencia de la empresa
 * CLAVE: Esta función permite que los documentos generados respeten el estilo de la firma
 */
export async function generateDocumentWithContext(
  templateName: string,
  variables: Record<string, string>,
  companyContext: string,
  companyInstructions: string
): Promise<string> {
  let systemPrompt = `Eres un abogado corporativo experto redactando documentos legales en español para Colombia y Latinoamérica.

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

  const userPrompt = `TIPO DE DOCUMENTO: ${templateName}

INFORMACIÓN PROPORCIONADA:
${Object.entries(variables)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Genera el documento legal completo${companyContext ? " respetando el estilo de los documentos de referencia" : ""}:`;

  return generateWithClaude(systemPrompt, userPrompt);
}

export async function analyzeDocument(
  content: string,
  focusContext?: string
): Promise<string> {
  const systemPrompt = `Eres un abogado corporativo experto analizando documentos legales.
Tu tarea es identificar riesgos, cláusulas problemáticas y áreas de mejora.
${focusContext ? "ENFOQUE ESPECIAL: El usuario ha solicitado que te enfoques en aspectos específicos. Prioriza tu análisis según sus indicaciones." : ""}
Responde SIEMPRE en formato JSON válido.`;

  let userPrompt = `DOCUMENTO A ANALIZAR:
"""
${content.substring(0, 15000)}
"""
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
  "resumen": "Resumen ejecutivo de 2-3 oraciones${focusContext ? ", enfocado en lo que el usuario solicitó" : ""}",
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
  "observaciones_generales": "Observaciones adicionales${focusContext ? " relacionadas con el enfoque solicitado" : ""}"
}

IMPORTANTE:
- nivel debe ser: CRITICO, ALTO, MEDIO o BAJO
- score debe ser un número del 1-10 (1=muy seguro, 10=muy riesgoso)
- Responde SOLO con el JSON, sin texto adicional`;

  return generateWithClaude(systemPrompt, userPrompt);
}
