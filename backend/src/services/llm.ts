import OpenAI from "openai";
import { SYSTEM_PROMPT } from "../knowledge/faq.js";
import type { Message } from "../types.js";

// Using OpenRouter (OpenAI-compatible API) so we can use a free model without a paid OpenAI key.
const MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-oss-20b:free";
const MAX_HISTORY_MESSAGES = 10;
const MAX_OUTPUT_TOKENS = 300;

const client = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    })
  : null;

export class LlmServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmServiceError";
  }
}

/**
 * Generates a support agent reply given recent conversation history and the new user message.
 * Wraps the OpenAI call so failures (missing key, timeout, rate limit, etc.) surface as a
 * single friendly error instead of crashing the request.
 */
export async function generateReply(history: Message[], userMessage: string): Promise<string> {
  if (!client) {
    throw new LlmServiceError(
      "The AI agent isn't configured yet (missing OPENROUTER_API_KEY). Please contact the site admin."
    );
  }

  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...recentHistory.map((m): OpenAI.Chat.ChatCompletionMessageParam => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    })),
    { role: "user", content: userMessage },
  ];

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: 0.4,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      throw new LlmServiceError("The AI agent didn't return a response. Please try again.");
    }
    return reply;
  } catch (err) {
    if (err instanceof LlmServiceError) throw err;
    console.error("LLM call failed:", err);

    if (err instanceof OpenAI.APIError) {
      if (err.status === 401) {
        throw new LlmServiceError("The AI agent is misconfigured (invalid API key). Please contact support.");
      }
      if (err.status === 429) {
        throw new LlmServiceError("The AI agent is a bit busy right now. Please try again in a moment.");
      }
    }

    throw new LlmServiceError("Sorry, the AI agent is having trouble responding right now. Please try again shortly.");
  }
}
