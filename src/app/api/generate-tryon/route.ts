import { NextRequest, NextResponse } from "next/server";

const FASHN_API_URL = "https://api.fashn.ai/v1";
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30; // ~60 seconds max wait
const CATEGORY_MAP: Record<string, "tops" | "bottoms" | "one-pieces" | "auto"> = {
  Saree: "one-pieces",
  Lehenga: "one-pieces",
  "Salwar Kameez": "one-pieces",
  Kurta: "tops",
  Suit: "one-pieces",
  Sherwani: "one-pieces",
  Dress: "one-pieces",
  Gown: "one-pieces",
  Other: "auto",
};

interface FashnRunResponse {
  id: string;
  error: string | null;
}

interface FashnStatusResponse {
  id: string;
  status: "starting" | "in_queue" | "processing" | "completed" | "failed";
  output: string[] | null;
  error: string | null;
}

async function pollForResult(predictionId: string, apiKey: string): Promise<string> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const statusRes = await fetch(`${FASHN_API_URL}/status/${predictionId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const statusData: FashnStatusResponse = await statusRes.json();

    if (statusData.status === "completed" && statusData.output && statusData.output.length > 0) {
      return statusData.output[0];
    }
       if (statusData.status === "failed") {
      console.error("FASHN status failed:", JSON.stringify(statusData));
      const errMsg =
        typeof statusData.error === "string" ? statusData.error : JSON.stringify(statusData.error);
      throw new Error(errMsg || "Try-on generation failed.");
    }
    // otherwise still processing — keep polling
  }
  throw new Error("Try-on generation timed out. Please try again.");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server is missing FASHN API key." }, { status: 500 });
  }

    let body: { modelImage: string; garmentImageUrl: string; garmentCategory?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

    const { modelImage, garmentImageUrl, garmentCategory } = body;
  if (!modelImage || !garmentImageUrl) {
    return NextResponse.json({ error: "Missing customer photo or garment image." }, { status: 400 });
  }

  try {
    const runRes = await fetch(`${FASHN_API_URL}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model_name: "tryon-max",
        inputs: {
          product_image: garmentImageUrl,
          model_image: modelImage,
        },
      }),
    });

    const runData: FashnRunResponse = await runRes.json();
    if (!runRes.ok || runData.error) {
      console.error("FASHN run error:", JSON.stringify(runData));
      const errMsg =
        typeof runData.error === "string" ? runData.error : JSON.stringify(runData.error);
      return NextResponse.json(
        { error: errMsg || "Couldn't start try-on generation." },
        { status: 500 }
      );
    }
    const outputUrl = await pollForResult(runData.id, apiKey);
    return NextResponse.json({ imageUrl: outputUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong generating the try-on." },
      { status: 500 }
    );
  }
}