// Browser helpers for the Gemini API key.

export const API_KEY_STORAGE = "gemini_api_key";

export function getStoredKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(API_KEY_STORAGE)?.trim() || null;
}

export function clearStoredKey() {
  localStorage.removeItem(API_KEY_STORAGE);
}

/** True when the server has GEMINI_API_KEY set in its .env file. */
export async function fetchServerKeyConfigured(): Promise<boolean> {
  try {
    const res = await fetch("/api/gemini", { cache: "no-store" });
    const data = await res.json();
    return !!data?.serverKeyConfigured;
  } catch {
    return false;
  }
}

/** Checks the key with Gemini and saves it only if it works. Returns an error message, or null on success. */
export async function validateAndSaveKey(rawKey: string): Promise<string | null> {
  const apiKey = rawKey.trim();
  if (!apiKey) return "Please enter an API key.";
  try {
    const res = await fetch("/api/gemini/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.valid) return data.error || "This API key did not work.";
    localStorage.setItem(API_KEY_STORAGE, apiKey);
    return null;
  } catch {
    return "Network error while checking the key. Is the server running?";
  }
}
