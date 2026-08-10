import { NextRequest, NextResponse } from "next/server";

// Uses Gemini 2.5 Flash Image ("Nano Banana") — a model that edits an input
// photo based on a text instruction, rather than generating from scratch.
// This lets us preserve the user's actual face/identity while changing the
// outfit/hairstyle described in `prompt`. Runs server-side only: GEMINI_API_KEY
// must never be exposed to the browser.
const GEMINI_MODEL = "gemini-2.5-flash-image";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface RequestBody {
  imageBase64: string; // no data: prefix, raw base64 only
  mimeType: string;
  prompt: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY. Add it in Vercel project settings." },
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { imageBase64, mimeType, prompt } = body;
  if (!imageBase64 || !mimeType || !prompt) {
    return NextResponse.json({ error: "Missing imageBase64, mimeType, or prompt." }, { status: 400 });
  }

  try {
    const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.15,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return NextResponse.json(
        { error: `Gemini API error (${geminiResponse.status}): ${errText}` },
        { status: 502 }
      );
    }

    const data = await geminiResponse.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: { inlineData?: { data?: string; mimeType?: string } }) => p.inlineData?.data);

    if (!imagePart) {
      const textPart = parts.find((p: { text?: string }) => p.text)?.text;
      const finishReason = data?.candidates?.[0]?.finishReason;
      return NextResponse.json(
        {
          error: "Gemini didn't return an image. Try a different, clearer photo.",
          debugFinishReason: finishReason ?? null,
          debugText: textPart ?? null,
        },
        { status: 502 }
      );
    }
    console.log("DEBUG parts:", JSON.stringify(parts));
    return NextResponse.json({
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType ?? "image/png",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected server error." },
      { status: 500 }
    );
  }
}