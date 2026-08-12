import Link from "next/link";

export default function AccessoriesFootwearGuide() {
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
            <h3>👞 Accessories &amp; Footwear: The Details That Finish a Look</h3>
            <p className="rec-sub">
              An outfit is only half the picture — accessories and footwear are what actually make a look feel
              complete or fall flat. Here's how to think about both.
            </p>
          </section>

          <section className="rec-card">
            <h3>Accessories — less is more</h3>
            <p className="rec-sub">
              The easiest mistake to make is over-accessorizing. A good rule: pick one "statement" piece —
              a watch, a necklace, a pair of earrings — and keep everything else minimal. For men, a watch and
              maybe a bracelet is usually enough for most occasions. For women, matching metal tones (all gold or
              all silver, not mixed) makes a look feel put-together rather than random.
            </p>
          </section>

          <section className="rec-card">
            <h3>Accessories by occasion</h3>
            <p className="rec-sub">
              <strong>Office:</strong> keep it subtle — a simple watch, small studs, nothing that jingles or
              catches too much light.
            </p>
            <p className="rec-sub">
              <strong>Wedding &amp; festive:</strong> this is where you can go bigger — statement earrings,
              layered necklaces, a pocket square for men.
            </p>
            <p className="rec-sub">
              <strong>Casual day out:</strong> practical pieces — sunglasses, a simple bracelet, a cap — that suit
              an easygoing setting.
            </p>
          </section>

          <section className="rec-card">
            <h3>Footwear — comfort and formality both matter</h3>
            <p className="rec-sub">
              Footwear needs to match two things at once: how formal the event is, and how long you'll actually be
              standing or walking in it. A gorgeous heel that's painful by hour two will undercut the whole look —
              factor in the occasion's length, not just its dress code.
            </p>
          </section>

          <section className="rec-card">
            <h3>Footwear by occasion</h3>
            <p className="rec-sub">
              <strong>Office:</strong> closed, polished shoes for men (oxfords, derbies, loafers); a low block heel
              or flat for women.
            </p>
            <p className="rec-sub">
              <strong>Wedding &amp; festive (ethnic wear):</strong> juttis or mojaris pair much better with ethnic
              outfits than formal Western shoes — they complete the look instead of clashing with it.
            </p>
            <p className="rec-sub">
              <strong>Date night:</strong> loafers for men strike a good balance between smart and relaxed; heels
              for an evening date, wedges or flats for a daytime one.
            </p>
            <p className="rec-sub">
              <strong>Casual, warm-weather daytime:</strong> sandals or breathable sneakers over closed formal
              shoes — comfort matters more here than polish.
            </p>
          </section>

          <section className="rec-card">
            <h3>Want the exact accessories and footwear for your look?</h3>
            <p className="rec-sub">
              Our stylist tool recommends specific accessories and footwear based on your occasion, season, and
              time of day — plus shopping links so you can go straight from recommendation to purchase.
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