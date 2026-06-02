/**
 * AI Provider Abstraction Layer
 *
 * Supports multiple AI providers for cost-effective testing:
 * - anthropic: Claude Sonnet 4 (production)
 * - google: Gemini 2.0 Flash (cheap testing)
 * - groq: Llama 3.3 70B (free testing)
 *
 * Switch providers via AI_PROVIDER env var.
 */

import { AI_MODELS, AI_PROVIDERS, type AIProvider } from "@/lib/constants";

// Provider response interface
export interface AIResponse {
  text: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
}

function getProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "anthropic") as AIProvider;
  if (!Object.values(AI_PROVIDERS).includes(provider)) {
    console.warn(`Unknown AI_PROVIDER "${provider}", falling back to anthropic`);
    return "anthropic";
  }
  return provider;
}

// ============================================================================
// ANTHROPIC (Claude)
// ============================================================================
async function generateWithAnthropic(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<AIResponse> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = AI_MODELS.ANTHROPIC;

  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response format from Anthropic");
  }

  return {
    text: content.text,
    provider: "anthropic",
    model,
    tokensUsed: message.usage?.output_tokens || 0,
  };
}

// ============================================================================
// GOOGLE (Gemini)
// ============================================================================
async function generateWithGoogle(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<AIResponse> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = AI_MODELS.GOOGLE;

  const generativeModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: maxTokens },
  });

  const result = await generativeModel.generateContent(userPrompt);
  const text = result.response.text();

  if (!text) {
    throw new Error("Empty response from Google Gemini");
  }

  return {
    text,
    provider: "google",
    model,
    tokensUsed: result.response.usageMetadata?.candidatesTokenCount || 0,
  };
}

// ============================================================================
// GROQ (Llama)
// ============================================================================
async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<AIResponse> {
  const Groq = (await import("groq-sdk")).default;

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const model = AI_MODELS.GROQ;

  const completion = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response from Groq");
  }

  return {
    text,
    provider: "groq",
    model,
    tokensUsed: completion.usage?.completion_tokens || 0,
  };
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Generate text using the configured AI provider.
 * Routes to Anthropic, Google, or Groq based on AI_PROVIDER env var.
 */
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096,
  providerOverride?: AIProvider
): Promise<AIResponse> {
  const provider = providerOverride || getProvider();

  // Log the resolved provider only — do not log user-supplied prompts or content
  if (process.env.NODE_ENV !== "production") {
    console.log(`[AI Provider] Using: ${provider}`);
  }

  const startTime = Date.now();

  let response: AIResponse;

  switch (provider) {
    case "anthropic":
      response = await generateWithAnthropic(systemPrompt, userPrompt, maxTokens);
      break;
    case "google":
      response = await generateWithGoogle(systemPrompt, userPrompt, maxTokens);
      break;
    case "groq":
      response = await generateWithGroq(systemPrompt, userPrompt, maxTokens);
      break;
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }

  const elapsed = Date.now() - startTime;
  // Only log timing in non-production to avoid unnecessary log volume
  if (process.env.NODE_ENV !== "production") {
    console.log(`[AI Provider] ${provider}/${response.model} responded in ${elapsed}ms (${response.tokensUsed || "?"} tokens)`);
  }

  return response;
}

/**
 * Simple text generation that returns just the string.
 * Drop-in replacement for the old generateWithClaude function.
 */
export async function generateTextSimple(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096,
  providerOverride?: AIProvider
): Promise<string> {
  const response = await generateText(systemPrompt, userPrompt, maxTokens, providerOverride);
  return response.text;
}
