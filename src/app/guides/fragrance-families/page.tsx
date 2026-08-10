import Link from "next/link";

export default function FragranceGuide() {
  return (
    <div className="page">
      <header className="page-header">
        <span className="brand-mark">Fit&nbsp;&amp;&nbsp;Scent</span>
        <p className="brand-tag">Style guide</p>
        <Link href="/guides" className="chip" style={{ display: "inline-block", marginTop: "0.5rem" }}>
          ← All guides
        </Link>
      </header>

      <main className="page-main">
        <div className="results-cards" style={{ maxWidth: "720px" }}>
          <section className="rec-card">
            <h3>🌸 Fragrance Families, Explained Simply</h3>
            <p className="rec-sub">
              Perfume descriptions can be confusing — "top notes," "base notes," "oriental" — but the core idea is
              simple. Most fragrances fall into a handful of broad families, and knowing them makes shopping for
              scent much easier.
            </p>
          </section>

          <section className="rec-card">
            <h3>Fresh / Citrus</h3>
            <p className="rec-sub">
              Light, clean, energizing — think lemon, bergamot, or sea-salt notes. Works well for daytime, warm
              weather, and office settings where you want something noticeable but not overwhelming.
            </p>
          </section>

          <section className="rec-card">
            <h3>Floral</h3>
            <p className="rec-sub">
              Built around flower notes — rose, jasmine, white florals. Softer and more romantic, generally suits
              daytime and evening occasions alike, especially for warmer months.
            </p>
          </section>

          <section className="rec-card">
            <h3>Woody</h3>
            <p className="rec-sub">
              Warm, grounded notes like sandalwood, cedar, or vetiver. Works well for cooler weather and evening
              wear — it tends to read as more confident and understated.
            </p>
          </section>

          <section className="rec-card">
            <h3>Oriental / Warm Spice</h3>
            <p className="rec-sub">
              Rich, deep notes — amber, vanilla, spices. The most noticeable and long-lasting family, best suited
              to evening occasions and colder weather, where a bolder presence works in your favor.
            </p>
          </section>

          <section className="rec-card">
            <h3>Matching scent to the occasion</h3>
            <p className="rec-sub">
              A good rule of thumb: lighter families (fresh, floral) for daytime and warmer weather, richer
              families (woody, oriental) for evening and cooler weather. Intensity matters too — a scent that's
              perfect in a small room can feel overwhelming outdoors, and vice versa.
            </p>
          </section>

          <section className="rec-card">
            <h3>Not sure what suits you?</h3>
            <p className="rec-sub">
              Our stylist tool recommends a fragrance family and intensity based on your occasion, the season, and
              time of day — with the reasoning behind the pick.
            </p>
            <Link href="/" className="chip" style={{ display: "inline-block", marginTop: "0.6rem" }}>
              Try the stylist →
            </Link>
          </section>
        </div>
      </main>

      <footer className="page-footer">
        <p>Face-shape, skin-tone, and body-build reading happens on your device. Nothing is uploaded to a server.</p>
      </footer>
    </div>
  );
}