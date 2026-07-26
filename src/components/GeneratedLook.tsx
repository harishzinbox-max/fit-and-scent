"use client";

import { useState } from "react";
import { imageToBase64 } from "@/lib/imageToBase64";

interface Props {
  image: HTMLImageElement;
  dressPrompt: string;
}

type Status = "idle" | "generating" | "done" | "error";

export default function GeneratedLook({ image, dressPrompt }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setStatus("generating");
    setError(null);
    try {
      const { base64, mimeType } = imageToBase64(image);

      const prompt =
        `Edit this photo so the person is wearing: ${dressPrompt}. ` +
        `Keep their face, identity, body proportions, and pose exactly the same. ` +
        `Photorealistic, natural lighting matching the original photo.`;

      const res = await fetch("/api/generate-look", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType, prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong generating your look.");
      }

      setResultUrl(`data:${data.mimeType};base64,${data.imageBase64}`);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <section className="rec-card">
      <h3>See it on you</h3>
      <p className="rec-sub" style={{ marginBottom: "0.75rem" }}>
        Generates an edited version of your photo wearing this recommendation. Free tier — a couple of tries
        per day.
      </p>

      {status !== "done" && (
        <button type="button" className="quiz-submit" onClick={handleGenerate} disabled={status === "generating"}>
          {status === "generating" ? "Generating…" : "✨ Generate my look"}
        </button>
      )}

      {status === "error" && <p className="scanner-error" style={{ marginTop: "0.75rem" }}>{error}</p>}

      {status === "done" && resultUrl && (
        <div style={{ marginTop: "0.75rem" }}>
          <img src={resultUrl} alt="Generated look" className="result-photo" />
          <button
            type="button"
            className="chip"
            style={{ marginTop: "0.6rem" }}
            onClick={() => {
              setStatus("idle");
              setResultUrl(null);
            }}
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );
}