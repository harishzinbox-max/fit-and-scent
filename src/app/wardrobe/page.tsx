"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SavedLook } from "@/lib/types";
import { getSavedLooks, deleteLook } from "@/lib/wardrobeStorage";
import LoginForm from "@/components/LoginForm";

export default function WardrobePage() {
  const [looks, setLooks] = useState<SavedLook[]>([]);

useEffect(() => {
  getSavedLooks().then(setLooks);
}, []);

async function handleDelete(id: string) {
  await deleteLook(id);
  setLooks(await getSavedLooks());
}

  return (
    <div className="page">
      <header className="page-header">
        <span className="brand-mark">Fit&nbsp;&amp;&nbsp;Scent</span>
        <p className="brand-tag">Your saved looks</p>
        <Link href="/" className="chip" style={{ display: "inline-block", marginTop: "0.5rem" }}>
          ← Back to stylist
        </Link>
      </header>
      <header className="page-header">
  <span className="brand-mark">Fit&nbsp;&amp;&nbsp;Scent</span>
  <p className="brand-tag">Your saved looks</p>
  <Link href="/" className="chip" style={{ display: "inline-block", marginTop: "0.5rem" }}>
    ← Back to stylist
  </Link>
  <Link href="/how-it-works" className="chip" style={{ display: "inline-block", marginTop: "0.5rem", marginLeft: "0.5rem" }}>
    How it works
  </Link>
</header>
    <LoginForm />
      <main className="page-main">
        {looks.length === 0 ? (
          <p className="rec-sub">
            No saved looks yet. Generate a look and tap &quot;Save to my wardrobe&quot; to start building your
            lookbook.
          </p>
        ) : (
          <div className="results-cards">
            {looks.map((look) => (
              <div key={look.id} className="rec-card">
                <img
                  src={`data:${look.mimeType};base64,${look.imageBase64}`}
                  alt="Saved look"
                  className="result-photo"
                />
                <p className="rec-headline">{look.outfitSummary}</p>
                <p className="rec-sub">Hair: {look.hairstyleSummary}</p>
                <p className="rec-sub">Scent: {look.fragranceSummary}</p>
                <p className="rec-sub">Accessories: {look.accessorySummary}</p>
                <p className="rec-confidence">
                  {look.occasion.replace("-", " ")} · saved {new Date(look.createdAt).toLocaleDateString()}
                </p>
                <button
                  type="button"
                  className="chip"
                  style={{ marginTop: "0.5rem" }}
                  onClick={() => handleDelete(look.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}