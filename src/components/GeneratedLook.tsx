"use client";

import { useEffect, useState } from "react";
import type { Gender } from "@/lib/types";
import { imageToBase64 } from "@/lib/imageToBase64";
import { saveLook } from "@/lib/wardrobeStorage";
import { supabase } from "@/lib/supabaseClient";
import { getCreditStatus, consumeCredit, UNLIMITED_EMAILS, type CreditStatus } from "@/lib/credits";
import LoginForm from "./LoginForm";
import type { Occasion, QuizAnswers } from "@/lib/types";
import { buildImageEditSpec } from "@/lib/imageEdit/buildImageEditSpec";
import {
  buildClothingEditPrompt,
  buildHairEditPrompt,
} from "@/lib/imageEdit/buildGeminiPrompt";

interface Props {
  image: HTMLImageElement;
  bodyImage: HTMLImageElement;
  dressPrompt: string;
  hairPrompt: string;
  wearPreference?: string;
  gender: Gender;
  occasion: Occasion;
  facialHairPreference?: QuizAnswers["facialHairPreference"];
  outfitSummary: string;
  hairstyleSummary: string;
  fragranceSummary: string;
  accessorySummary: string;
  footwearSummary: string;
  onResult?: (result: { imageBase64: string; mimeType: string; url: string } | null) => void;
}

type Status = "idle" | "generating" | "done" | "error";



const LOADING_MESSAGES = [
  "Reading your photo…",
  "Draping the outfit…",
  "Styling the hair…",
  "Blending it all together…",
  "Almost there…",
];

type ImageData = { imageBase64: string; mimeType: string };

/** This endpoint edits one photo per call. Never log image data. */
async function runGeminiEdit(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<ImageData> {
  const res = await fetch("/api/generate-look", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, mimeType, prompt }),
  });

  const data: {
    imageBase64?: unknown;
    mimeType?: unknown;
    error?: string;
  } = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Image generation failed (${res.status}).`);
  }
  if (typeof data.imageBase64 !== "string" || !data.imageBase64) {
    throw new Error("Image generation returned no usable image.");
  }
  return {
    imageBase64: data.imageBase64,
    mimeType: typeof data.mimeType === "string" ? data.mimeType : "image/png",
  };
}

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

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function GeneratedLook({
  bodyImage,
  hairPrompt,
  wearPreference,
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
  // Local-only diagnostic previews. These stay in memory and are never logged.
  const [debugClothingData, setDebugClothingData] = useState<ImageData | null>(null);
  const [debugHairData, setDebugHairData] = useState<ImageData | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [generationNote, setGenerationNote] = useState<string | null>(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [credits, setCredits] = useState<CreditStatus | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

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
    if (!credits || status === "generating") return;
    setStatus("generating");
    setError(null);
    setGenerationNote(null);
    setCloseupData(null);
    setFullData(null);
    setDebugClothingData(null);
    setDebugHairData(null);
    setSaved(false);

    try {
      const { base64, mimeType } = imageToBase64(bodyImage);

      // The styling rules shown to the user are intentionally separate from
      // deterministic garment instructions sent to the image model.
      const spec = buildImageEditSpec({
        gender,
        occasion,
        wearPreference,
        hairstylePreference: hairPrompt,
        accessories: [], // Do not introduce unrequested accessories.
        footwearPreference: undefined, // Clothing pass should preserve shoes.
      });

      if (!spec.clothingDescription?.trim()) {
        throw new Error("The selected outfit has no image-edit instructions.");
      }
      if (process.env.NODE_ENV === "development") {
  console.log(
    "FITNSCENT FEMALE CLOTHING PROMPT:",
    buildClothingEditPrompt(spec)
  );
}
if (process.env.NODE_ENV === "development") {
  console.log(
    "FITNSCENT FEMALE CLOTHING PROMPT:",
    buildClothingEditPrompt(spec)
  );
}
      const clothingEdit = await runGeminiEdit(
        base64,
        mimeType,
        buildClothingEditPrompt(spec)
      );
      if (process.env.NODE_ENV === "development") {
        setDebugClothingData(clothingEdit);
      }

      let finalEdit = clothingEdit;
      if (spec.changeHair && spec.hairstyleDescription?.trim()) {
        try {
          finalEdit = await runGeminiEdit(
            clothingEdit.imageBase64,
            clothingEdit.mimeType,
            buildHairEditPrompt(spec)
          );
          if (process.env.NODE_ENV === "development") {
            setDebugHairData(finalEdit);
          }
        } catch {
          // Preserve the usable clothing result rather than hiding it if
          // the optional second image-editing stage fails.
          setGenerationNote(
            "Your outfit was generated, but the hairstyle edit could not be completed. The preview shows the outfit-only result."
          );
        }
      }

      const closeup = await cropCloseup(finalEdit.imageBase64, finalEdit.mimeType);
      setFullData(finalEdit);
      setCloseupData(closeup);
      setStatus("done");
      onResult?.({
        ...finalEdit,
        url: `data:${finalEdit.mimeType};base64,${finalEdit.imageBase64}`,
      });

      // A finished user-visible result consumes only one app credit, although
      // the service may incur two underlying Gemini image-generation calls.
      const isUnlimited = userEmail ? UNLIMITED_EMAILS.includes(userEmail) : false;
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

  async function handleBuyCredits() {
    setBuying(true);
    setBuyError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Couldn't load the payment window. Check your connection and try again.");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please sign in again before purchasing.");
      }

      const orderRes = await fetch("/api/create-order", { method: "POST" });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Couldn't start checkout. Try again.");
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "Fit & Scent",
        description: "5 AI makeover tries",
        prefill: { email: user.email ?? "" },
        theme: { color: "#a88648" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, userId: user.id }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }
            setCredits((prev) =>
              prev ? { ...prev, purchasedCredits: verifyData.newCredits } : prev
            );
          } catch (err) {
            setBuyError(err instanceof Error ? err.message : "Payment verification failed. Contact support.");
          } finally {
            setBuying(false);
          }
        },
        modal: {
          ondismiss: () => setBuying(false),
        },
      });

      razorpay.open();
    } catch (err) {
      setBuyError(err instanceof Error ? err.message : "Something went wrong.");
      setBuying(false);
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

  const isUnlimited = UNLIMITED_EMAILS.includes(userEmail);
  const hasCredit = isUnlimited || !credits.freeTryUsed || credits.purchasedCredits > 0;

  if (!hasCredit && status === "idle") {
    return (
      <div>
        <img src={bodyImage.src} alt="Your uploaded photo" className="result-photo" />
        <div className="paywall-card" style={{ marginTop: "0.9rem" }}>
          <h4>You've used your free try</h4>
          <p>Get 5 more AI makeovers for ₹199 to keep exploring looks.</p>
          <button
            type="button"
            className="quiz-submit"
            style={{ width: "100%" }}
            onClick={handleBuyCredits}
            disabled={buying}
          >
            {buying ? "Opening checkout…" : "Buy 5 more tries — ₹199"}
          </button>
          {buyError && <p className="scanner-error" style={{ marginTop: "0.6rem" }}>{buyError}</p>}
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
          {generationNote && (
            <p className="scanner-error" role="status" style={{ marginBottom: "0.7rem" }}>
              {generationNote}
            </p>
          )}
          {process.env.NODE_ENV === "development" && debugClothingData && (
            <section
              aria-label="Local image edit stage diagnostics"
              style={{ marginBottom: "1rem", padding: "0.75rem", border: "1px solid #b8a582", borderRadius: "0.75rem" }}
            >
              <p style={{ marginBottom: "0.5rem", fontWeight: 700 }}>
                Local diagnostic — original vs clothing vs hairstyle
              </p>
              <p style={{ marginBottom: "0.75rem", fontSize: "0.85rem" }}>
                Compare identity, pose, outfit and hair at each stage. These images are not automatically verified.
                This panel is visible only on the development build.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: "0.65rem" }}>
                <div>
                  <strong style={{ display: "block", marginBottom: "0.3rem" }}>Original</strong>
                  <img src={bodyImage.src} alt="Original full body uploaded image" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
                </div>
                <div>
                  <strong style={{ display: "block", marginBottom: "0.3rem" }}>Clothing pass</strong>
                  <img
                    src={`data:${debugClothingData.mimeType};base64,${debugClothingData.imageBase64}`}
                    alt="Image after clothing-only edit"
                    style={{ width: "100%", height: "auto", objectFit: "contain" }}
                  />
                </div>
                <div>
                  <strong style={{ display: "block", marginBottom: "0.3rem" }}>Hairstyle pass</strong>
                  {debugHairData ? (
                    <img
                      src={`data:${debugHairData.mimeType};base64,${debugHairData.imageBase64}`}
                      alt="Image after hairstyle edit"
                      style={{ width: "100%", height: "auto", objectFit: "contain" }}
                    />
                  ) : (
                    <p style={{ fontSize: "0.85rem" }}>Not completed or not requested.</p>
                  )}
                </div>
              </div>
            </section>
          )}
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
              setDebugClothingData(null);
              setDebugHairData(null);
              setSaved(false);
              setGenerationNote(null);
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
