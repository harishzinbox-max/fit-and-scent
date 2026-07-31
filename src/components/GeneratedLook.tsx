"use client";

import { useState } from "react";
import type { Gender } from "@/lib/types";
import { imageToBase64 } from "@/lib/imageToBase64";
import { saveLook } from "@/lib/wardrobeStorage";
import type { Occasion } from "@/lib/types";

interface Props {
  image: HTMLImageElement;
  dressPrompt: string;
  hairPrompt: string;
  gender: Gender;
  occasion: Occasion;
   outfitSummary: string;
 hairstyleSummary: string;
  fragranceSummary: string;
}

type Status = "idle" | "generating" | "done" | "error";

export default function GeneratedLook({
image,
  dressPrompt,
  hairPrompt,
  gender,
  occasion,
  outfitSummary,
  hairstyleSummary,
  fragranceSummary,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
 const [resultData, setResultData] = useState<{ imageBase64: string; mimeType: string } | null>(null);
  const [saved, setSaved] = useState(false);
  async function handleGenerate() {
    setStatus("generating");
    setError(null);
    try {
      const { base64, mimeType } = imageToBase64(image);

      const prompt =
        `Edit this photo so the ${gender === "male" ? "man" : "woman"} is wearing: ${dressPrompt}. ` +
        `Also restyle their hair to: ${hairPrompt}. ` +
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
      setResultData({ imageBase64: data.imageBase64, mimeType: data.mimeType });
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }
 function handleSaveToWardrobe() {
    if (!resultData) return;
    saveLook({
      imageBase64: resultData.imageBase64,
      mimeType: resultData.mimeType,
      occasion,
      gender,
      outfitSummary,
      hairstyleSummary,
      fragranceSummary,
    });
    setSaved(true);
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
            className="quiz-submit"
            style={{ marginTop: "0.6rem" }}
            onClick={handleSaveToWardrobe}
            disabled={saved}
          >
            {saved ? "Saved to your wardrobe ✓" : "Save to my wardrobe"}
          </button>
          <button
            type="button"
            className="chip"
            style={{ marginTop: "0.6rem" }}
            onClick={() => {
              setStatus("idle");
              setResultUrl(null);
              setResultData(null);
              setSaved(false);
            }}
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );
}