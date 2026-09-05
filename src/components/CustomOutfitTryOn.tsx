"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PhotoUpload from "./PhotoUpload";
import { supabase } from "@/lib/supabaseClient";
import { imageToBase64 } from "@/lib/imageToBase64";
import { getCreditStatus, consumeCredit, UNLIMITED_EMAILS, type CreditStatus } from "@/lib/credits";
import { saveLook } from "@/lib/wardrobeStorage";

interface Props {
  bodyImage: HTMLImageElement;
}

type Status = "idle" | "generating" | "done" | "error";

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

export default function CustomOutfitTryOn({ bodyImage }: Props) {
  const [garmentImage, setGarmentImage] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [credits, setCredits] = useState<CreditStatus | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
    getCreditStatus().then((status) => {
      setCredits(status);
      setCreditsLoading(false);
    });
  }, []);

  async function handleGenerate(img?: HTMLImageElement) {
    const garment = img ?? garmentImage;
    if (!garment || !credits) return;
    setStatus("generating");
    setError(null);

    try {
      const { base64: modelBase64, mimeType: modelMime } = imageToBase64(bodyImage);
      const { base64: garmentBase64, mimeType: garmentMime } = imageToBase64(garment);

      const res = await fetch("/api/generate-tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelImage: `data:${modelMime};base64,${modelBase64}`,
          garmentImageUrl: `data:${garmentMime};base64,${garmentBase64}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong generating your try-on.");
      }

      setResultUrl(data.imageUrl);
      setStatus("done");

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
    }
  }

  async function handleSaveToWardrobe() {
    if (!resultUrl || saving || saved) return;
    setSaving(true);
    try {
      await saveLook({
        imageUrl: resultUrl,
        source: "custom-outfit",
        garmentLabel: "Your own outfit",
      });
      setSaved(true);
    } catch {
      setError("Couldn't save this look. Please try again.");
    } finally {
      setSaving(false);
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

  if (creditsLoading || !credits) {
    return <p className="credits-badge">Checking your account…</p>;
  }

  const isUnlimited = userEmail ? UNLIMITED_EMAILS.includes(userEmail) : false;
  const hasCredit = isUnlimited || !credits.freeTryUsed || credits.purchasedCredits > 0;

  if (!hasCredit && status === "idle") {
    return (
      <div className="paywall-card">
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
    );
  }

  return (
    <div>
      {status === "idle" && (
        <>
          <PhotoUpload
            stepNumber="03"
            title="Add a photo of the outfit"
            hint="Full garment visible, laid flat or on a mannequin — not a close-up."
            previewAlt="Outfit photo"
            confirmLabel="✨ Try it on"
            onImageReady={(img) => {
              setGarmentImage(img);
              handleGenerate(img);
            }}
          />
          <p className="credits-badge" style={{ marginTop: "0.6rem" }}>
            {isUnlimited
              ? "Unlimited tries ✨"
              : !credits.freeTryUsed
              ? "1 free try available"
              : `${credits.purchasedCredits} tries remaining`}
          </p>
        </>
      )}

      {status === "generating" && (
        <div className="generating-wrap">
          <img src={garmentImage?.src} alt="Generating your try-on" className="result-photo" />
          <div className="generating-sweep" />
          <div className="generating-overlay">
            <div className="generating-spinner" />
            <p className="generating-text">Generating your try-on… this can take up to a minute.</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <>
          <p className="scanner-error" style={{ marginTop: "0.75rem" }}>{error}</p>
          <button type="button" className="quiz-submit" style={{ marginTop: "0.6rem", width: "100%" }} onClick={() => handleGenerate()}>
            Try again
          </button>
        </>
      )}

      {status === "done" && resultUrl && (
        <div>
          <img src={resultUrl} alt="Try-on result" className="result-photo" />
          <button
            type="button"
            className="quiz-submit"
            style={{ width: "100%", marginTop: "0.6rem" }}
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
              setGarmentImage(null);
              setResultUrl(null);
              setError(null);
              setSaved(false);
            }}
          >
            Try another outfit
          </button>
          <p className="rec-confidence" style={{ marginTop: "0.75rem" }}>
            Own a clothing store? <Link href="/partner">Offer this to your customers →</Link>
          </p>
        </div>
      )}
    </div>
  );
}
