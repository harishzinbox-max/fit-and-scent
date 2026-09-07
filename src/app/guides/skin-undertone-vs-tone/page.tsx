import Link from "next/link";

export default function SkinUndertoneGuide() {
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
            <h3>🎨 Skin Undertone vs. Skin Tone</h3>
            <p className="rec-sub">
              Most people shop by skin tone — fair, medium, deep — and wonder why a color that looked great on a
              friend with the &ldquo;same&rdquo; complexion looks flat on them. The real variable is undertone,
              and it&rsquo;s the one thing most styling advice skips entirely.
            </p>
          </section>

          <section className="rec-card">
            <h3>Tone vs. undertone — they&rsquo;re not the same thing</h3>
            <p className="rec-sub">
              <strong>Skin tone</strong> is how light or dark your skin is — it changes with sun exposure and
              season. <strong>Undertone</strong> is the subtle color beneath the surface — warm, cool, or neutral
              — and it stays constant for life. Two people can share the exact same tone and have completely
              different undertones, which is why &ldquo;wear this shade, it suited her&rdquo; advice so often
              backfires.
            </p>
          </section>

          <section className="rec-card">
            <h3>Finding your undertone in under a minute</h3>
            <p className="rec-sub">
              Skip the vague &ldquo;look at your veins&rdquo; advice — it&rsquo;s unreliable across deeper skin
              tones. Three better checks, used together: hold a pure white item and an ivory item near your face
              — if white brightens you, you likely lean cool; if ivory looks more alive, you likely lean warm.
              Try silver versus gold jewelry the same way. And notice how you tan — golden or olive tanning
              tends to run warm, tanning with a rosier cast (or burning first) tends to run cool. If two of the
              three checks agree, that&rsquo;s your undertone.
            </p>
          </section>

          <section className="rec-card">
            <h3>Warm undertone</h3>
            <p className="rec-sub">
              Best colors: olive, mustard, terracotta, warm reds, camel, coral, warm browns. Go easy on icy
              pastels, stark black, and cool blue-based grays — they can read sallow on warm skin. Metals: gold,
              brass, rose gold.
            </p>
          </section>

          <section className="rec-card">
            <h3>Cool undertone</h3>
            <p className="rec-sub">
              Best colors: jewel tones (emerald, sapphire, true red), cool grays, navy, plum, icy pink. Go easy
              on mustard and warm, yellow-based neutrals — they can flatten cool skin. Metals: silver, platinum,
              white gold.
            </p>
          </section>

          <section className="rec-card">
            <h3>Neutral undertone</h3>
            <p className="rec-sub">
              The widest range of both palettes works — but the trap is going too neutral yourself. An
              all-beige, all-gray outfit reads flat precisely because nothing is pushing warm or cool to create
              contrast. Neutral skin actually benefits from picking a lane per outfit — lean the whole look warm,
              or lean it cool — rather than blending both at once. Metals: both work equally well.
            </p>
          </section>

          <section className="rec-card">
            <h3>Why this matters for fragrance too</h3>
            <p className="rec-sub">
              Undertone logic maps onto scent families almost exactly the way it maps onto color. Warm
              undertones tend to carry amber, vanilla, spice, and woody-oriental fragrances exceptionally well —
              these notes and warm skin chemistry amplify each other. Cool undertones often carry citrus,
              aquatic, and green fragrances more cleanly, since the sharper notes don&rsquo;t compete with warmer
              skin oils the way they can on warm-toned skin.
            </p>
          </section>

          <section className="rec-card">
            <h3>Not sure which one you are?</h3>
            <p className="rec-sub">
              Our stylist tool reads your undertone alongside your face shape and body build — right from a
              photo, on your device — and recommends both outfit colors and fragrance families suited to it.
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