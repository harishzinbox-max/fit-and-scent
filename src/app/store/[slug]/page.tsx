"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { imageToBase64 } from "@/lib/imageToBase64";
import PhotoUpload from "@/components/PhotoUpload";

interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string;
  price_display: string | null;
}

interface Store {
  id: string;
  name: string;
}

type Stage = "loading" | "not-found" | "browse" | "upload" | "generating" | "result" | "error";

export default function StorePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [stage, setStage] = useState<Stage>("loading");
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerImage, setCustomerImage] = useState<HTMLImageElement | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: storeData } = await supabase
        .from("stores")
        .select("id, name")
        .eq("slug", slug)
        .maybeSingle();

      if (!storeData) {
        setStage("not-found");
        return;
      }
      setStore(storeData);

      const { data: productsData } = await supabase
        .from("store_products")
        .select("id, name, category, image_url, price_display")
        .eq("store_id", storeData.id)
        .eq("active", true)
        .order("created_at", { ascending: false });

      setProducts(productsData ?? []);
      setStage("browse");
    }
    load();
  }, [slug]);

  function handleSelectProduct(product: Product) {
    setSelectedProduct(product);
    setStage("upload");
  }

  async function handleGenerate() {
    if (!customerImage || !selectedProduct) return;
    setStage("generating");
    setError(null);

    try {
      const { base64, mimeType } = imageToBase64(customerImage);
      const modelImage = `data:${mimeType};base64,${base64}`;

      const res = await fetch("/api/generate-tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelImage,
          garmentImageUrl: selectedProduct.image_url,
          garmentCategory: selectedProduct.category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong generating your try-on.");
      }

      setResultUrl(data.imageUrl);
      setStage("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStage("error");
    }
  }

  function handleTryAnother() {
    setSelectedProduct(null);
    setCustomerImage(null);
    setResultUrl(null);
    setError(null);
    setStage("browse");
  }

  if (stage === "loading") {
    return (
      <div className="page-main">
        <p className="credits-badge">Loading store…</p>
      </div>
    );
  }

  if (stage === "not-found") {
    return (
      <div className="page-main">
        <p className="scanner-error">We couldn&apos;t find this store.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <span className="brand-mark">{store?.name}</span>
        <p className="brand-tag">Try on our collection — powered by Fit &amp; Scent</p>
      </header>

      <main className="page-main">
        {stage === "browse" && (
          <>
            <h2 className="quiz-title">Pick an item to try on</h2>
            {products.length === 0 ? (
              <p className="rec-sub">This store hasn&apos;t added any items yet — check back soon.</p>
            ) : (
              <div className="results-grid" style={{ gap: "1rem" }}>
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="rec-card"
                    style={{ cursor: "pointer", textAlign: "left" }}
                    onClick={() => handleSelectProduct(p)}
                  >
                    <img
                      src={p.image_url}
                      alt={p.name}
                      style={{ width: "100%", borderRadius: "8px", marginBottom: "0.5rem" }}
                    />
                    <p className="rec-headline">{p.name}</p>
                    <p className="rec-sub">
                      {p.category}
                      {p.price_display ? ` · ${p.price_display}` : ""}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {stage === "upload" && selectedProduct && (
          <>
            <button type="button" className="chip" style={{ marginBottom: "1rem" }} onClick={handleTryAnother}>
              ← Back to catalog
            </button>
            <p className="tab-intro">Trying on: {selectedProduct.name}</p>
            <PhotoUpload
              stepNumber="01"
              title="Add your photo"
              hint="Standing straight, facing the camera, good lighting, full body visible."
              previewAlt="Your photo"
              guideType="body"
              onImageReady={(img) => setCustomerImage(img)}
            />
            {customerImage && (
              <button type="button" className="quiz-submit" style={{ width: "100%", marginTop: "1rem" }} onClick={handleGenerate}>
                ✨ Try it on
              </button>
            )}
          </>
        )}

        {stage === "generating" && (
          <div className="generating-wrap">
            <div className="generating-overlay">
              <div className="generating-spinner" />
              <p className="generating-text">Generating your try-on… this can take up to a minute.</p>
            </div>
          </div>
        )}

        {stage === "result" && resultUrl && selectedProduct && (
          <div>
            <p className="tab-intro">You in: {selectedProduct.name}</p>
            <img src={resultUrl} alt="Try-on result" className="result-photo" />
            <button type="button" className="quiz-submit" style={{ width: "100%", marginTop: "1rem" }} onClick={handleTryAnother}>
              Try another item
            </button>
          </div>
        )}

        {stage === "error" && (
          <div>
            <p className="scanner-error">{error}</p>
            <button type="button" className="quiz-submit" style={{ width: "100%", marginTop: "0.6rem" }} onClick={() => setStage("upload")}>
              Try again
            </button>
          </div>
        )}
      </main>

      <footer className="page-footer">
        <p>Powered by Fit &amp; Scent — fitnscent.in</p>
      </footer>
    </div>
  );
}
