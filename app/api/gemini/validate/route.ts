import { NextResponse } from "next/server";
import { GeminiError, validateApiKey } from "../../../lib/gemini";

// Checks that a key works before the app saves it.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";
  if (!apiKey) return NextResponse.json({ valid: false, error: "API key is required" }, { status: 400 });

  try {
    await validateApiKey(apiKey);
    return NextResponse.json({ valid: true });
  } catch (error) {
    const status = error instanceof GeminiError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Could not validate key";
    return NextResponse.json({ valid: false, error: message }, { status });
  }
}
