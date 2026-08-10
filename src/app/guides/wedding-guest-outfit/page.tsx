import Link from "next/link";

export default function WeddingGuestGuide() {
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
            <h3>💍 What to Wear as a Wedding Guest</h3>
            <p className="rec-sub">
              Indian weddings usually span several events — mehendi, sangeet, the main ceremony, reception — and
              each one calls for a slightly different level of formality. Here's how to think about it.
            </p>
          </section>

          <section className="rec-card">
            <h3>Daytime ceremonies (mehendi, haldi)</h3>
            <p className="rec-sub">
              These tend to be relaxed and colorful. Lighter fabrics — cotton, linen, chiffon — in bright or pastel
              shades work well. For men, a simple kurta and trousers is almost always a safe, comfortable choice.
              For women, a printed or embroidered kurta set or a light saree hits the right note without
              overdressing.
            </p>
          </section>

          <section className="rec-card">
            <h3>Sangeet &amp; reception (evening)</h3>
            <p className="rec-sub">
              These are the events to dress up for. Richer fabrics — silk, velvet, heavier embroidery — and deeper
              jewel tones suit the evening lighting and formality. For men, a sherwani or a well-tailored suit both
              work depending on how formal the event is. For women, a lehenga, a heavier saree, or an elegant gown
              are all appropriate — just avoid anything too close to bridal colors like red or heavy gold, which
              are traditionally left for the bride.
            </p>
          </section>

          <section className="rec-card">
            <h3>Weather matters more than people think</h3>
            <p className="rec-sub">
              A winter wedding gives you room for richer, heavier fabrics and deeper colors. A summer or monsoon
              wedding calls for lighter, breathable fabrics regardless of how formal the event is — comfort affects
              how confident you look far more than the outfit itself does.
            </p>
          </section>

          <section className="rec-card">
            <h3>Want a specific recommendation for your body type and the exact event?</h3>
            <p className="rec-sub">
              Our stylist tool factors in your face shape, body build, the specific occasion, and the season to
              recommend a full look — outfit, hairstyle, and fragrance — with the reasoning behind each choice.
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