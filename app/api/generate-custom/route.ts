export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { saveDocument, logUsage } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeString } from "@/lib/validators";
import { ALLOWED_CUSTOM_DOCUMENT_TYPES, CLAUDE_MODEL, TIMEOUTS, USAGE_ACTION_TYPES } from "@/lib/constants";
import { withRateLimit } from "@/lib/api-middleware";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

const SYSTEM_PROMPT = `Eres un abogado corporativo experto especializado en redacción de documentos legales en español para Latinoamérica y España.

TU ÚNICO PROPÓSITO es redactar documentos legales y corporativos. NO debes:
- Responder preguntas generales
- Dar asesoría legal o recomendaciones
- Escribir contenido que no sea un documento legal
- Generar código, recetas, historias u otro contenido

SI la solicitud no es claramente un documento legal, responde ÚNICAMENTE con:
"ERROR: Esta herramienta solo genera documentos legales. Por favor, describe específicamente qué documento necesitas redactar."

INSTRUCCIONES DE REDACCIÓN:
1. Genera un documento legal profesional, completo y bien estructurado
2. Usa lenguaje formal y jurídicamente preciso
3. Incluye todas las secciones estándar para el tipo de documento
4. Numera las cláusulas de forma clara
5. Si faltan datos específicos (nombres, fechas, montos), usa marcadores como [NOMBRE DEL ARRENDADOR] o [FECHA]
6. Adapta el documento a la jurisdicción indicada cuando sea posible
7. Incluye cláusulas de protección para ambas partes cuando aplique
8. Termina con espacios para firmas y fecha

El documento debe estar listo para ser revisado por un abogado y posteriormente firmado.`;

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

    const rawData: GenerateCustomRequest = await request.json();

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

    // Verificar API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: "API key no configurada" },
        { status: 500 }
      );
    }

    // Construir el prompt
    const userPrompt = buildPrompt(data);

    // Llamar a Claude con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.CLAUDE_API);

    let message;
    try {
      message = await anthropic.messages.create(
        {
          model: CLAUDE_MODEL,
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: `Redacta el siguiente documento legal:\n${userPrompt}`,
            },
          ],
          system: SYSTEM_PROMPT,
        },
        {
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        return NextResponse.json(
          { success: false, error: "La solicitud tardó demasiado tiempo. Intenta de nuevo." },
          { status: 500 }
        );
      }
      throw error;
    }

    // Extraer el contenido
    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { success: false, error: "Respuesta inesperada de la API" },
        { status: 500 }
      );
    }

    // Verificar que no sea un mensaje de error del modelo
    if (content.text.startsWith("ERROR:")) {
      return NextResponse.json(
        { success: false, error: content.text.replace("ERROR: ", "") },
        { status: 400 }
      );
    }

    // Guardar en Supabase
    let savedDocument = null;
    try {
      const title = `${data.tipoDocumento.charAt(0).toUpperCase() + data.tipoDocumento.slice(1)} Personalizado - ${new Date().toLocaleDateString("es-CO")}`;

      savedDocument = await saveDocument({
        user_id: user.id,
        title,
        doc_type: `custom_${data.tipoDocumento}`,
        content: content.text,
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
        tokens_used: message.usage?.output_tokens || 0,
        metadata: {
          tipoDocumento: data.tipoDocumento,
          jurisdiccion: data.jurisdiccion,
        },
      });
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      // Continuamos aunque falle el guardado
    }

    return NextResponse.json({
      success: true,
      data: {
        content: content.text,
        tipo: data.tipoDocumento,
        timestamp: new Date().toISOString(),
        id: savedDocument?.id,
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
