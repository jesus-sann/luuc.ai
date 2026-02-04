export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateTextSimple } from "@/lib/ai-provider";
import { withRateLimit } from "@/lib/api-middleware";

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

    // Build conversation context from history (last 10 messages max)
    const recentHistory = (history || []).slice(-10);
    const conversationContext = recentHistory
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    const userPrompt = conversationContext
      ? `Previous conversation:\n${conversationContext}\n\nUser: ${message.trim()}`
      : message.trim();

    const reply = await generateTextSimple(SYSTEM_PROMPT, userPrompt, 1024);

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
