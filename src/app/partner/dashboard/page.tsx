"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string;
  price_display: string | null;
  active: boolean;
}

const CATEGORIES = ["Saree", "Lehenga", "Salwar Kameez", "Kurta", "Suit", "Sherwani", "Dress", "Gown", "Other"];

export default function PartnerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts(sid: string) {
    const { data } = await supabase
      .from("store_products")
      .select("id, name, category, image_url, price_display, active")
      .eq("store_id", sid)
      .order("created_at", { ascending: false });
    setProducts(data ?? []);
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: ownerRow } = await supabase
        .from("store_owners")
        .select("store_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (ownerRow) {
        setStoreId(ownerRow.store_id);
        await loadProducts(ownerRow.store_id);
      }
      setLoading(false);
    });
  }, []);

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId || !file) {
      setError("Please select a photo of the garment.");
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${storeId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("store-products")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("store-products").getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("store_products").insert({
        store_id: storeId,
        name,
        category,
        image_url: publicUrl,
        price_display: price || null,
      });
      if (insertError) throw insertError;

      setName("");
      setPrice("");
      setFile(null);
      await loadProducts(storeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add product.");
    } finally {
      setUploading(false);
    }
  }

  async function handleToggleActive(product: Product) {
    await supabase.from("store_products").update({ active: !product.active }).eq("id", product.id);
    if (storeId) await loadProducts(storeId);
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Remove "${product.name}" from your catalog?`)) return;
    await supabase.from("store_products").delete().eq("id", product.id);
    if (storeId) await loadProducts(storeId);
  }

  if (loading) {
    return (
      <div className="page-main">
        <p className="credits-badge">Loading…</p>
      </div>
    );
  }

  if (!storeId) {
    return (
      <div className="page-main">
        <p className="scanner-error">Please sign in from the Partner login page first.</p>
        <a href="/partner" className="chip">
          Go to login
        </a>
      </div>
    );
  }

  return (
    <div className="page-main">
      <h2 className="quiz-title">Manage your catalog</h2>

      <form className="quiz" onSubmit={handleAddProduct} style={{ marginBottom: "2rem" }}>
        <span className="upload-mark">+</span>
        <h3 style={{ marginTop: 0 }}>Add a new item</h3>

        <label className="quiz-field">
          Item name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Red Banarasi Saree"
          />
        </label>

        <label className="quiz-field">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="quiz-field">
          Price (optional, shown to customers)
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. ₹4,500"
          />
        </label>

        <label className="quiz-field">
          Garment photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </label>

        <button type="submit" className="quiz-submit" disabled={uploading}>
          {uploading ? "Adding…" : "Add item"}
        </button>
        {error && <p className="scanner-error">{error}</p>}
      </form>

      <h3>Your catalog ({products.length} items)</h3>
      {products.length === 0 ? (
        <p className="rec-sub">No items yet — add your first one above.</p>
      ) : (
        <div className="results-grid" style={{ gap: "1rem" }}>
          {products.map((p) => (
            <div key={p.id} className="rec-card" style={{ opacity: p.active ? 1 : 0.5 }}>
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
              <div className="accessory-picker" style={{ marginTop: "0.5rem" }}>
                <button type="button" className="chip" onClick={() => handleToggleActive(p)}>
                  {p.active ? "Hide from customers" : "Show to customers"}
                </button>
                <button type="button" className="chip" onClick={() => handleDelete(p)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
