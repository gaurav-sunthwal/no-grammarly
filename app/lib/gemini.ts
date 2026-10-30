// Server-only helper for calling the Google Gemini REST API.

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// "gemini-flash-latest" always points at Google's current Flash model,
// so the app doesn't break when a specific version is retired.
export const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest";

export class GeminiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** A key sent by the browser wins; otherwise fall back to GEMINI_API_KEY from .env. */
export function resolveApiKey(clientKey?: unknown): string | null {
  if (typeof clientKey === "string" && clientKey.trim()) return clientKey.trim();
  const envKey = process.env.GEMINI_API_KEY?.trim();
  return envKey || null;
}

export function hasServerKey(): boolean {
  return !!process.env.GEMINI_API_KEY?.trim();
}

async function geminiFetch(path: string, apiKey: string, init?: RequestInit) {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new GeminiError("Could not reach the Gemini API. Check your internet connection.", 502);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw toGeminiError(res.status, data);
  return data;
}

function toGeminiError(status: number, data: any): GeminiError {
  const message: string = data?.error?.message || "";
  const reason: string =
    data?.error?.details?.find((d: any) => d?.reason)?.reason || data?.error?.status || "";

  if (reason === "API_KEY_INVALID" || /api key not valid|invalid api key/i.test(message)) {
    return new GeminiError("Invalid API key. Please check your Gemini API key.", 401);
  }
  if (status === 401 || status === 403 || reason === "PERMISSION_DENIED") {
    return new GeminiError(
      "This API key is not allowed to use Gemini. Make sure the Generative Language API is enabled for it.",
      403
    );
  }
  if (status === 429 || reason === "RESOURCE_EXHAUSTED") {
    return new GeminiError("Gemini quota exceeded. Please wait a moment and try again.", 429);
  }
  if (status === 404) {
    return new GeminiError(
      `Model "${GEMINI_MODEL}" is not available. Set GEMINI_MODEL in .env to a valid model.`,
      500
    );
  }
  return new GeminiError(message || `Gemini API error (${status})`, status >= 500 ? 502 : status);
}

/** Checks a key with a free "list models" call, so validation doesn't use quota. */
export async function validateApiKey(apiKey: string): Promise<void> {
  await geminiFetch("/models?pageSize=1", apiKey);
}

export async function generateText(apiKey: string, prompt: string): Promise<string> {
  const data = await geminiFetch(`/models/${GEMINI_MODEL}:generateContent`, apiKey, {
    method: "POST",
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
  });

  const candidate = data?.candidates?.[0];
  const text: string =
    candidate?.content?.parts?.map((p: any) => p?.text || "").join("") || "";

  if (!text.trim()) {
    const blocked = data?.promptFeedback?.blockReason || candidate?.finishReason;
    throw new GeminiError(
      blocked ? `Gemini returned no text (reason: ${blocked}).` : "Gemini returned an empty response.",
      502
    );
  }
  return text.trim();
}
