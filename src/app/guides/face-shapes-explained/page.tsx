import Link from "next/link";

export default function FaceShapesGuide() {
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
            <h3>🪞 Face Shapes Explained</h3>
            <p className="rec-sub">
              Face shape is one of the most useful things to know about yourself when choosing a hairstyle or a
              neckline — because certain shapes and lines either balance or exaggerate your natural proportions.
              Here's a quick guide to the main shapes.
            </p>
          </section>

          <section className="rec-card">
            <h3>Oval</h3>
            <p className="rec-sub">
              Considered the most balanced face shape — length is about one and a half times the width, with a
              jaw slightly narrower than the cheekbones. Most hairstyles and necklines suit an oval face well.
            </p>
          </section>

          <section className="rec-card">
            <h3>Round</h3>
            <p className="rec-sub">
              Width and length are similar, with softer, curved jawlines. Styles that add height or angularity —
              layered hair with volume on top, V-necks or collars that create a vertical line — tend to balance a
              round face nicely.
            </p>
          </section>

          <section className="rec-card">
            <h3>Square</h3>
            <p className="rec-sub">
              A strong, angular jawline with a forehead of similar width. Softer hairstyles with waves or layers,
              and rounder necklines, help balance out the strong jaw angles.
            </p>
          </section>

          <section className="rec-card">
            <h3>Heart</h3>
            <p className="rec-sub">
              A wider forehead tapering to a narrower, sometimes pointed chin. Styles that add width near the
              jawline — chin-length bobs, wider collars — help balance the proportions.
            </p>
          </section>

          <section className="rec-card">
            <h3>Diamond</h3>
            <p className="rec-sub">
              Narrow forehead and jawline with wider cheekbones. Hairstyles with volume at the forehead and chin
              area, and necklines that soften the cheekbone width, work well here.
            </p>
          </section>

          <section className="rec-card">
            <h3>Not sure which one you are?</h3>
            <p className="rec-sub">
              Our stylist tool reads your face shape automatically from a photo — right on your device, nothing
              uploaded — and recommends hairstyles and necklines suited to it.
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