import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ message: "Gemini API endpoint is working. Use POST to send text for correction." });
}

// Handle POST requests (main functionality)
export async function POST(req: Request) {
  try {
    console.log("API route /api/gemini called");
    
    const body = await req.json();
    console.log("Request body received:", { text: body.text ? body.text.substring(0, 50) + "..." : "no text", hasApiKey: !!body.apiKey });
    
    const { text, apiKey } = body;

    if (!text || !text.trim()) {
      console.log("Error: No text provided");
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!apiKey || !apiKey.trim()) {
      console.log("Error: No API key provided");
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    console.log("Initializing Google Generative AI");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Fix grammar and spelling mistakes in this text, without changing its meaning:\n\n${text}`;
    console.log("Sending request to Gemini API");

    const result = await model.generateContent(prompt);
    const corrected = result.response.text();
    
    console.log("Gemini API response received, length:", corrected.length);
    console.log("Corrected text preview:", corrected.substring(0, 100) + "...");

    return NextResponse.json({ corrected });
  } catch (error: any) {
    console.error("API Error:", error);
    
    if (error.message?.includes("API_KEY_INVALID")) {
      return NextResponse.json({ error: "Invalid API key. Please check your Gemini API key." }, { status: 400 });
    }
    
    if (error.message?.includes("QUOTA_EXCEEDED")) {
      return NextResponse.json({ error: "API quota exceeded. Please try again later." }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: error.message || "An error occurred while processing your request" 
    }, { status: 500 });
  }
}

// Handle OPTIONS requests (for CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}