import { NextResponse } from "next/server";
import { GeminiError, GEMINI_MODEL, generateText, hasServerKey, resolveApiKey } from "../../lib/gemini";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

// Tells the UI whether a key is set in .env, so users don't have to enter one.
export async function GET() {
  return json({ ok: true, serverKeyConfigured: hasServerKey(), model: GEMINI_MODEL });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const text = typeof body?.text === "string" ? body.text : "";
  if (!text.trim()) return json({ error: "Text is required" }, 400);

  const apiKey = resolveApiKey(body?.apiKey);
  if (!apiKey) {
    return json(
      { error: "No Gemini API key. Add GEMINI_API_KEY to .env.local or save a key in the app." },
      400
    );
  }

  try {
    const corrected = await generateText(apiKey, text);
    return json({ corrected });
  } catch (error) {
    if (error instanceof GeminiError) return json({ error: error.message }, error.status);
    console.error("Gemini route error:", error);
    return json({ error: "An unexpected error occurred" }, 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
