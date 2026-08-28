"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PartnerLoginPage() {
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const [storeName, setStoreName] = useState<string | null | undefined>(undefined);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userEmail === undefined) return;
    if (!userEmail) {
      setStoreName(null);
      return;
    }

    console.log("[partner-debug] Starting store check for:", userEmail);

    supabase.auth
      .getUser()
      .then(async ({ data: { user }, error: userErr }) => {
        console.log("[partner-debug] getUser result:", user, userErr);
        if (!user) {
          setStoreName(null);
          return;
        }
        const { data: ownerRow, error: ownerErr } = await supabase
          .from("store_owners")
          .select("store_id")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("[partner-debug] ownerRow result:", ownerRow, ownerErr);

        if (!ownerRow) {
          setStoreName(null);
          return;
        }

        const { data: store, error: storeErr } = await supabase
          .from("stores")
          .select("name, slug")
          .eq("id", ownerRow.store_id)
          .maybeSingle();

        console.log("[partner-debug] store result:", store, storeErr);

        if (store) {
          setStoreName(store.name);
          setStoreSlug(store.slug);
        } else {
          setStoreName(null);
        }
      })
      .catch((err) => {
        console.error("[partner-debug] CAUGHT ERROR in store check:", err);
        setStoreName(null);
      });
  }, [userEmail]);

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/partner` },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setSending(false);
  }

  if (userEmail === undefined) {
    return (
      <div className="page-main">
        <p className="credits-badge">Checking your account…</p>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="page-main">
        <h2 className="quiz-title">Store Partner Login</h2>
        {sent ? (
          <p className="credits-badge">Check your email for a sign-in link.</p>
        ) : (
          <form className="quiz" onSubmit={handleSendLink}>
            <label className="quiz-field">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your-store@example.com"
              />
            </label>
            <button type="submit" className="quiz-submit" disabled={sending}>
              {sending ? "Sending…" : "Send sign-in link"}
            </button>
            {error && <p className="scanner-error">{error}</p>}
          </form>
        )}
      </div>
    );
  }

  if (storeName === undefined) {
    return (
      <div className="page-main">
        <p className="credits-badge">Checking your store access…</p>
      </div>
    );
  }

  if (storeName === null) {
    return (
      <div className="page-main">
        <p className="scanner-error">
          This account isn&apos;t linked to a store yet. Contact Fit &amp; Scent to get set up.
        </p>
      </div>
    );
  }

  return (
    <div className="page-main">
      <h2 className="quiz-title">Welcome, {storeName}</h2>
      <p className="rec-sub">Manage your catalog and see your store&apos;s customer-facing page.</p>
      <div className="accessory-picker" style={{ marginTop: "1rem" }}>
        <a href="/partner/dashboard" className="chip chip-active">
          Manage products
        </a>
        <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer" className="chip">
          View my customer page ↗
        </a>
      </div>
    </div>
  );
}