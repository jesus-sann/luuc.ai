import { AI_MODELS } from "@/lib/constants";

export interface AIResponse {
  text: string;
  provider: "anthropic";
  model: string;
  tokensUsed?: number;
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096,
  signal?: AbortSignal
): Promise<AIResponse> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = AI_MODELS.ANTHROPIC;

  const startTime = Date.now();

  const message = await client.messages.create(
    {
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    },
    { signal }
  );

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response format from Anthropic");
  }

  const elapsed = Date.now() - startTime;
  if (process.env.NODE_ENV !== "production") {
    console.log(`[AI] claude/${model} responded in ${elapsed}ms (${message.usage?.output_tokens ?? "?"} tokens)`);
  }

  return {
    text: content.text,
    provider: "anthropic",
    model,
    tokensUsed: message.usage?.output_tokens || 0,
  };
}

export async function generateTextSimple(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096,
  signal?: AbortSignal
): Promise<string> {
  const response = await generateText(systemPrompt, userPrompt, maxTokens, signal);
  return response.text;
}
