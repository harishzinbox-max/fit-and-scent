"use client";

import { useEffect, useState } from "react";
import type { Gender } from "@/lib/types";
import { imageToBase64 } from "@/lib/imageToBase64";
import { saveLook } from "@/lib/wardrobeStorage";
import { supabase } from "@/lib/supabaseClient";
import { getCreditStatus, consumeCredit, type CreditStatus } from "@/lib/credits";
import LoginForm from "./LoginForm";
import Link from "next/link";
import type { Occasion } from "@/lib/types";

interface Props {
  image: HTMLImageElement;
  bodyImage: HTMLImageElement;
  dressPrompt: string;
  hairPrompt: string;
  gender: Gender;
  occasion: Occasion;
  outfitSummary: string;
  hairstyleSummary: string;
  fragranceSummary: string;
  accessorySummary: string;
  footwearSummary: string;
  onResult?: (result: { imageBase64: string; mimeType: string; url: string } | null) => void;
}

type Status = "idle" | "generating" | "done" | "error";
const UNLIMITED_EMAILS = ["harishzinbox@gmail.com"];

const LOADING_MESSAGES = [
  "Reading your photo…",
  "Draping the outfit…",
  "Styling the hair…",
  "Blending it all together…",
  "Almost there…",
];

function cropCloseup(fullBase64: string, mimeType: string): Promise<{ imageBase64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const cropHeight = img.naturalHeight * 0.38;
      const cropWidth = Math.min(img.naturalWidth, cropHeight * 0.9);
      const cropX = (img.naturalWidth - cropWidth) / 2;
      const cropY = 0;

      const canvas = document.createElement("canvas");
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not create close-up crop."));
        return;
      }
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      resolve({ imageBase64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
    };
    img.onerror = () => reject(new Error("Could not load generated image for cropping."));
    img.src = `data:${mimeType};base64,${fullBase64}`;
  });
}

export default function GeneratedLook({
  image,
  bodyImage,
  dressPrompt,
  hairPrompt,
  gender,
  occasion,
  outfitSummary,
  hairstyleSummary,
  fragranceSummary,
  accessorySummary,
  footwearSummary,
  onResult,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [closeupData, setCloseupData] = useState<{ imageBase64: string; mimeType: string } | null>(null);
  const [fullData, setFullData] = useState<{ imageBase64: string; mimeType: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [credits, setCredits] = useState<CreditStatus | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userEmail) {
      setCredits(null);
      setCreditsLoading(false);
      return;
    }
    setCreditsLoading(true);
    getCreditStatus().then((status) => {
      setCredits(status);
      setCreditsLoading(false);
    });
  }, [userEmail]);

  useEffect(() => {
    if (status !== "generating") return;
    setMessageIndex(0);
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1600);
    return () => clearInterval(interval);
  }, [status]);

  async function handleGenerate() {
    if (!credits) return;
    setStatus("generating");
    setError(null);
    setCloseupData(null);
    setFullData(null);

    try {
      const { base64, mimeType } = imageToBase64(bodyImage);

      const fullPrompt =
        `This is a photo editing task, not a new image generation task. The photo shows a real, specific person — ` +
        `do not replace them with a different person, a model, or a stock photo face. Their exact facial features, ` +
        `bone structure, skin tone, and identity must remain completely unchanged and clearly recognizable as the ` +
        `same individual from the original photo. ` +
        `The only changes to make: ` +
        `(1) clothing — change to: ${dressPrompt}; ` +
        `(2) hair — restyle to: ${hairPrompt}; ` +
        `(3) accessories — add naturally: ${accessorySummary}; ` +
        `(4) footwear — add: ${footwearSummary}. ` +
        `Everything else — face, skin tone, body proportions, pose, background, lighting — must stay exactly as in ` +
        `the original photo. Full body from head to toe clearly visible. Photorealistic.`;

      const res = await fetch("/api/generate-look", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType, prompt: fullPrompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong generating your look.");
      }

      const full = { imageBase64: data.imageBase64, mimeType: data.mimeType };
      const closeup = await cropCloseup(full.imageBase64, full.mimeType);

      setFullData(full);
      setCloseupData(closeup);
      setStatus("done");
      onResult?.({
        imageBase64: full.imageBase64,
        mimeType: full.mimeType,
        url: `data:${full.mimeType};base64,${full.imageBase64}`,
      });

if (!isUnlimited) {
  const consumed = await consumeCredit(credits);
  if (consumed) {
    setCredits((prev) =>
      prev
        ? prev.freeTryUsed
          ? { ...prev, purchasedCredits: prev.purchasedCredits - 1 }
          : { ...prev, freeTryUsed: true }
        : prev
    );
  }
}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
      onResult?.(null);
    }
  }

  async function handleSaveToWardrobe() {
    if (!fullData || saving || saved) return;
    setSaving(true);
    try {
      await saveLook({
        imageBase64: fullData.imageBase64,
        mimeType: fullData.mimeType,
        occasion,
        gender,
        outfitSummary,
        hairstyleSummary,
        fragranceSummary,
        accessorySummary,
      });
      setSaved(true);
    } catch {
      setError("Couldn't save this look. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Not signed in — show the sign-in form instead of any generate controls.
  if (!userEmail) {
    return (
      <div>
        <img src={bodyImage.src} alt="Your uploaded photo" className="result-photo" />
        <div style={{ marginTop: "0.9rem" }}>
          <p className="credits-badge">Sign in to generate your free AI makeover</p>
          <LoginForm />
        </div>
      </div>
    );
  }

  if (creditsLoading || !credits) {
    return (
      <div>
        <img src={bodyImage.src} alt="Your uploaded photo" className="result-photo" />
        <p className="credits-badge" style={{ marginTop: "0.9rem" }}>Checking your account…</p>
      </div>
    );
  }

  const isUnlimited = userEmail ? UNLIMITED_EMAILS.includes(userEmail) : false;
const hasCredit = isUnlimited || !credits.freeTryUsed || credits.purchasedCredits > 0;

  if (!hasCredit && status === "idle") {
    return (
      <div>
        <img src={bodyImage.src} alt="Your uploaded photo" className="result-photo" />
        <div className="paywall-card" style={{ marginTop: "0.9rem" }}>
          <h4>You've used your free try</h4>
          <p>Get 5 more AI makeovers for ₹199 to keep exploring looks.</p>
          <button type="button" className="quiz-submit" style={{ width: "100%" }} disabled>
            Buy 5 more tries — coming soon
          </button>
        </div>
        <div className="paywall-card" style={{ marginTop: "0.9rem" }}>
  <h4>You've used your free try</h4>
  <p>Get 5 more AI makeovers for ₹199 to keep exploring looks.</p>
  <button type="button" className="quiz-submit" style={{ width: "100%" }} disabled>
    Buy 5 more tries — coming soon
  </button>
  <Link href="/how-it-works" className="chip" style={{ display: "inline-block", marginTop: "0.75rem" }}>
    See how it works
  </Link>
</div>
      </div>
    );
  }

  return (
    <div>
      {status === "idle" && (
        <>
          <img src={bodyImage.src} alt="Your uploaded photo" className="result-photo" />
<p className="credits-badge" style={{ marginTop: "0.6rem" }}>
  {isUnlimited
    ? "Unlimited tries ✨"
    : !credits.freeTryUsed
    ? "1 free try available"
    : `${credits.purchasedCredits} tries remaining`}
</p>
          <button
            type="button"
            className="quiz-submit"
            style={{ width: "100%" }}
            onClick={handleGenerate}
          >
            ✨ Generate my look
          </button>
        </>
      )}

      {status === "generating" && (
        <div className="generating-wrap">
          <img src={bodyImage.src} alt="Generating your look" className="result-photo" />
          <div className="generating-sweep" />
          <div className="generating-overlay">
            <div className="generating-spinner" />
            <p className="generating-text">{LOADING_MESSAGES[messageIndex]}</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <>
          <img src={bodyImage.src} alt="Your uploaded photo" className="result-photo" />
          <p className="scanner-error" style={{ marginTop: "0.75rem" }}>{error}</p>
          <button type="button" className="quiz-submit" style={{ marginTop: "0.6rem", width: "100%" }} onClick={handleGenerate}>
            Try again
          </button>
        </>
      )}

      {status === "done" && closeupData && fullData && (
        <div>
          <div className="dual-result">
            <div className="dual-result-item">
              <span className="dual-result-label">Close-up</span>
              <img
                src={`data:${closeupData.mimeType};base64,${closeupData.imageBase64}`}
                alt="Generated close-up"
                className="result-photo"
              />
            </div>
            <div className="dual-result-item">
              <span className="dual-result-label">Full look</span>
              <img
                src={`data:${fullData.mimeType};base64,${fullData.imageBase64}`}
                alt="Generated full-body look"
                className="result-photo"
              />
            </div>
          </div>

          <button
            type="button"
            className="quiz-submit"
            style={{ marginTop: "0.6rem", width: "100%" }}
            onClick={handleSaveToWardrobe}
            disabled={saved || saving}
          >
            {saved ? "Saved to your wardrobe ✓" : saving ? "Saving…" : "Save to my wardrobe"}
          </button>
          <button
            type="button"
            className="chip"
            style={{ marginTop: "0.6rem" }}
            onClick={() => {
              setStatus("idle");
              setCloseupData(null);
              setFullData(null);
              setSaved(false);
              onResult?.(null);
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}