import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="page">
      <header className="page-header">
        <span className="brand-mark">Fit&nbsp;&amp;&nbsp;Scent</span>
        <p className="brand-tag">How it works</p>
        <Link href="/" className="chip" style={{ display: "inline-block", marginTop: "0.5rem" }}>
          ← Back to stylist
        </Link>
      </header>

      <main className="page-main">
        <div className="results-cards" style={{ maxWidth: "720px" }}>
          <section className="rec-card">
            <h3>Getting started</h3>
            <ol className="rec-reasoning" style={{ paddingLeft: "1.2rem", listStyle: "decimal" }}>
              <li>Upload a clear photo of your face</li>
              <li>Upload a full-body photo, standing and facing the camera</li>
              <li>Answer a few quick questions about the occasion, season, and your style preferences</li>
              <li>Get personalized outfit, hairstyle, fragrance, and footwear recommendations — with the reasoning behind each one</li>
              <li>Sign in and tap "Generate my look" to see an AI-created preview of yourself in the recommended look</li>
            </ol>
          </section>

          <section className="rec-card">
            <h3>Getting the best results</h3>
            <p className="rec-headline">Face photo</p>
            <ul className="rec-reasoning">
              <li>Front-facing, looking directly at the camera</li>
              <li>Even, natural lighting — avoid strong shadows or backlighting</li>
              <li>No sunglasses, hats, or anything covering your face</li>
              <li>Line your face up with the dashed guide before continuing</li>
            </ul>
            <p className="rec-headline" style={{ marginTop: "0.9rem" }}>Full-body photo</p>
            <ul className="rec-reasoning">
              <li>Stand facing the camera with your whole body visible, head to feet</li>
              <li>Arms slightly away from your body, not crossed</li>
              <li>Plain background works best</li>
              <li>Well-lit — a photo that's too dark won't process correctly</li>
            </ul>
          </section>

          <section className="rec-card">
            <h3>Plans &amp; pricing</h3>
            <p className="rec-sub">Every account gets <strong>1 free AI-generated look</strong> to try the tool.</p>
            <p className="rec-sub">
              After that, unlock <strong>5 more looks for ₹199</strong> — no subscription, use them whenever you like.
            </p>
            <p className="rec-sub" style={{ marginTop: "0.6rem" }}>
              Recommendations (outfit, hairstyle, fragrance, footwear) and shopping links are always free — the
              credit system applies only to AI-generated photo previews.
            </p>
          </section>

          <section className="rec-card">
            <h3>Your privacy</h3>
            <p className="rec-sub">
              Face-shape, skin-tone, and body-build reading happens entirely on your device — nothing is uploaded
              to a server for that part.
            </p>
            <p className="rec-sub">
              Your uploaded photos are only sent to our AI provider (Google Gemini) when you choose to generate a
              look, solely to create that preview image.
            </p>
          </section>
        </div>
      </main>

      <footer className="page-footer">
        <p>Face-shape, skin-tone, and body-build reading happens on your device. Nothing is uploaded to a server.</p>
      </footer>
    </div>
  );
}