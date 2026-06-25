export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const maxDuration = 30;
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateTextSimple } from "@/lib/ai-provider";
import { withRateLimit } from "@/lib/api-middleware";
import { auditLog } from "@/lib/audit-log";

const SYSTEM_PROMPT = `You are a corporate legal assistant for Luuc.ai. You ONLY answer questions about:
- Corporate law and governance
- Contracts and commercial agreements
- Regulatory compliance
- Business legal matters
- Labor/employment law
- Intellectual property in business contexts

If the user asks about anything unrelated to corporate/legal topics, politely decline and redirect them to legal topics.

Keep answers concise, practical, and professional. Always clarify you are an AI and cannot replace professional legal advice.
Respond in the same language the user writes in.`;

interface ChatRequestBody {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
}

async function handler(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body: ChatRequestBody = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Mensaje requerido" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Mensaje demasiado largo (máx 2000 caracteres)" },
        { status: 400 }
      );
    }

    // Build conversation context — validate each history entry (H-4)
    const MAX_HISTORY_MSG = 2000;
    const validatedHistory = (Array.isArray(history) ? history : [])
      .slice(-10)
      .filter(
        (m): m is { role: "user" | "assistant"; content: string } =>
          typeof m === "object" &&
          m !== null &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_MSG) }));

    const conversationContext = validatedHistory
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    const userPrompt = conversationContext
      ? `Previous conversation:\n${conversationContext}\n\nUser: ${message.trim()}`
      : message.trim();

    const reply = await generateTextSimple(SYSTEM_PROMPT, userPrompt, 1024);

    auditLog({
      userId: user.id,
      companyId: user.company_id ?? undefined,
      action: "chat.query",
      resourceType: "chat",
      metadata: { messageLength: message.trim().length },
      ip: request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({
      success: true,
      data: { reply },
    });
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error procesando la consulta" },
      { status: 500 }
    );
  }
}

// SECURITY FIX: Aplicar rate limiting al endpoint de chat
export const POST = withRateLimit(handler, "generate");
