export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai-provider";
import { generateDocumentTitle } from "@/lib/claude";
import { saveDocument, logUsage } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeString } from "@/lib/validators";
import { ALLOWED_CUSTOM_DOCUMENT_TYPES, TIMEOUTS, USAGE_ACTION_TYPES } from "@/lib/constants";
import { withRateLimit } from "@/lib/api-middleware";

// Palabras clave que indican solicitudes NO permitidas
const BLOCKED_PATTERNS = [
  // Preguntas generales
  /^(qué|que|cómo|como|por qué|porque|cuál|cual|cuándo|cuando|dónde|donde)\s+(es|son|significa|hacer|funciona)/i,
  /explica(me)?|define|qué significa/i,

  // Asesoría legal directa
  /debo demandar|puedo demandar|me pueden demandar/i,
  /es legal|es ilegal|tengo derecho/i,
  /qué dice la ley|según la ley/i,
  /asesor(ía|ia) legal|consejo legal|opinión legal/i,

  // Contenido no relacionado
  /receta|cocina|ejercicio|dieta/i,
  /código|programación|software|app/i,
  /historia de|biografía|resumen del libro/i,
  /chiste|broma|poema|canción|cuento/i,

  // Contenido inapropiado
  /hack|pirate|ilegal|fraude|evadir/i,
  /arma|droga|violencia/i,
];

// Palabras clave que DEBEN estar presentes (al menos una)
const REQUIRED_LEGAL_CONTEXT = [
  /contrato|acuerdo|convenio/i,
  /carta|comunicación|notificación/i,
  /política|reglamento|normativa/i,
  /acta|minuta|constancia/i,
  /poder|autorización|mandato/i,
  /memorando|memo|circular/i,
  /cláusula|término|condición/i,
  /parte|firmante|otorgante/i,
  /documento|escrito|instrumento/i,
  /legal|jurídico|corporativo/i,
  /empresa|compañía|sociedad/i,
  /arrendamiento|alquiler|renta/i,
  /prestación|servicio|trabajo/i,
  /confidencial|nda|secreto/i,
  /terminación|rescisión|finiquito/i,
];

interface GenerateCustomRequest {
  tipoDocumento: string;
  descripcion: string;
  partes?: string;
  duracion?: string;
  valor?: string;
  jurisdiccion?: string;
  detallesAdicionales?: string;
}

function validateRequest(data: GenerateCustomRequest): {
  valid: boolean;
  error?: string;
  sanitized?: GenerateCustomRequest;
} {
  // 1. Verificar tipo de documento permitido
  if (!data.tipoDocumento || !(ALLOWED_CUSTOM_DOCUMENT_TYPES as readonly string[]).includes(data.tipoDocumento)) {
    return { valid: false, error: "Tipo de documento no válido." };
  }

  // 2. Verificar descripción mínima
  if (!data.descripcion || typeof data.descripcion !== 'string' || data.descripcion.trim().length < 20) {
    return { valid: false, error: "La descripción debe tener al menos 20 caracteres." };
  }

  // 3. Sanitizar inputs
  const sanitizedData: GenerateCustomRequest = {
    tipoDocumento: sanitizeString(data.tipoDocumento, 100),
    descripcion: sanitizeString(data.descripcion, 5000),
    partes: data.partes ? sanitizeString(data.partes, 1000) : undefined,
    duracion: data.duracion ? sanitizeString(data.duracion, 500) : undefined,
    valor: data.valor ? sanitizeString(data.valor, 500) : undefined,
    jurisdiccion: data.jurisdiccion ? sanitizeString(data.jurisdiccion, 200) : undefined,
    detallesAdicionales: data.detallesAdicionales ? sanitizeString(data.detallesAdicionales, 2000) : undefined,
  };

  // 4. Verificar patrones bloqueados
  const fullText = `${sanitizedData.descripcion} ${sanitizedData.detallesAdicionales || ""}`.toLowerCase();

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(fullText)) {
      return {
        valid: false,
        error: "Esta herramienta está diseñada exclusivamente para redacción de documentos legales. Para consultas generales o asesoría legal, consulta con un abogado.",
      };
    }
  }

  // 5. Verificar que tenga contexto legal
  const hasLegalContext = REQUIRED_LEGAL_CONTEXT.some((pattern) => pattern.test(fullText));

  if (!hasLegalContext) {
    return {
      valid: false,
      error: "Por favor, describe un documento legal o corporativo específico. Incluye detalles como el tipo de contrato, las partes involucradas, o el propósito del documento.",
    };
  }

  return { valid: true, sanitized: sanitizedData };
}

function buildPrompt(data: GenerateCustomRequest): string {
  let context = `
TIPO DE DOCUMENTO SOLICITADO: ${data.tipoDocumento.toUpperCase()}

DESCRIPCIÓN DEL USUARIO:
${data.descripcion}
`;

  if (data.partes) {
    context += `\nPARTES INVOLUCRADAS: ${data.partes}`;
  }
  if (data.duracion) {
    context += `\nDURACIÓN/VIGENCIA: ${data.duracion}`;
  }
  if (data.valor) {
    context += `\nVALOR/MONTO: ${data.valor}`;
  }
  if (data.jurisdiccion) {
    context += `\nJURISDICCIÓN: ${data.jurisdiccion}`;
  }
  if (data.detallesAdicionales) {
    context += `\nDETALLES ADICIONALES: ${data.detallesAdicionales}`;
  }

  return context;
}

function getSystemPrompt(language?: string): string {
  const lang = language || "es";
  const langMap: Record<string, { locale: string; region: string }> = {
    es: { locale: "español", region: "Latinoamérica y España" },
    en: { locale: "English", region: "the United States and international jurisdictions" },
    pt: { locale: "português", region: "Brasil e jurisdições internacionais" },
    fr: { locale: "français", region: "la France et juridictions internationales" },
    de: { locale: "Deutsch", region: "Deutschland und internationale Gerichtsbarkeiten" },
  };
  const li = langMap[lang] || langMap["es"];

  return `You are an expert corporate lawyer specializing in drafting legal documents in ${li.locale} for ${li.region}.

YOUR SOLE PURPOSE is to draft legal and corporate documents. You must NOT:
- Answer general questions
- Give legal advice or recommendations
- Write content that is not a legal document
- Generate code, recipes, stories or other content

IF the request is not clearly a legal document, respond ONLY with:
"ERROR: This tool only generates legal documents. Please specifically describe what document you need drafted."

DRAFTING INSTRUCTIONS:
1. Generate a professional, complete, and well-structured legal document
2. Use formal and legally precise language IN ${li.locale.toUpperCase()}
3. Include all standard sections for the document type
4. Clearly number all clauses
5. If specific data is missing (names, dates, amounts), use placeholders
6. Adapt the document to the indicated jurisdiction when possible
7. Include protective clauses for all parties when applicable
8. End with spaces for signatures and date

The document must be ready for review by a lawyer and subsequently signed.
IMPORTANT: The ENTIRE document must be written in ${li.locale}.`;
}

async function handler(request: NextRequest) {
  try {
    // Obtener usuario actual - REQUERIDO
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Verificar límites del plan
    const FREE_LIMIT = parseInt(process.env.FREE_TIER_DOCUMENT_LIMIT || "10");
    if (user.plan === "free" && user.usage_count >= FREE_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: `Has alcanzado el límite de ${FREE_LIMIT} documentos de tu plan gratuito. Actualiza a Pro para continuar.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const providerOverride = body.provider;
    const languageOverride = body.language;
    const rawData: GenerateCustomRequest = body;

    // SEGURIDAD: Validar y sanitizar la solicitud
    const validation = validateRequest(rawData);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Usar datos sanitizados
    const data = validation.sanitized!;

    // Construir el prompt
    const userPrompt = buildPrompt(data);

    // Llamar al AI provider con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.CLAUDE_API);

    let aiResponse;
    try {
      aiResponse = await Promise.race([
        generateText(getSystemPrompt(languageOverride), `Redacta el siguiente documento legal:\n${userPrompt}`, 4096, providerOverride),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener("abort", () => {
            reject(new Error("timeout"));
          });
        }),
      ]);
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.message === "timeout") {
        return NextResponse.json(
          { success: false, error: "La solicitud tardó demasiado tiempo. Intenta de nuevo." },
          { status: 500 }
        );
      }
      throw error;
    }

    const generatedText = aiResponse.text;

    // Verificar que no sea un mensaje de error del modelo
    if (generatedText.startsWith("ERROR:")) {
      return NextResponse.json(
        { success: false, error: generatedText.replace("ERROR: ", "") },
        { status: 400 }
      );
    }

    // Generate AI title
    const fallbackTitle = `${data.tipoDocumento.charAt(0).toUpperCase() + data.tipoDocumento.slice(1)} Personalizado - ${new Date().toLocaleDateString("es-CO")}`;
    const title = await generateDocumentTitle(generatedText, fallbackTitle);

    // Guardar en Supabase
    let savedDocument = null;
    try {

      savedDocument = await saveDocument({
        user_id: user.id,
        title,
        doc_type: `custom_${data.tipoDocumento}`,
        content: generatedText,
        variables: {
          tipoDocumento: data.tipoDocumento,
          descripcion: data.descripcion,
          partes: data.partes || "",
          duracion: data.duracion || "",
          valor: data.valor || "",
          jurisdiccion: data.jurisdiccion || "",
          detallesAdicionales: data.detallesAdicionales || "",
        },
        is_custom: true,
      });

      // Registrar uso
      await logUsage({
        user_id: user.id,
        action_type: USAGE_ACTION_TYPES.CUSTOM_GENERATE,
        tokens_used: aiResponse.tokensUsed || 0,
        metadata: {
          tipoDocumento: data.tipoDocumento,
          jurisdiccion: data.jurisdiccion,
          aiProvider: aiResponse.provider,
        },
      });
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
    }

    return NextResponse.json({
      success: true,
      data: {
        content: generatedText,
        title,
        tipo: data.tipoDocumento,
        timestamp: new Date().toISOString(),
        id: savedDocument?.id,
        provider: aiResponse.provider,
      },
    });
  } catch (error) {
    console.error("Error generating custom document:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handler, "generate");
