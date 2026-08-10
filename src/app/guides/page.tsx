import Link from "next/link";

const GUIDES = [
  {
    slug: "wedding-guest-outfit",
    title: "What to Wear as a Wedding Guest",
    summary: "How to dress appropriately and look great at Indian wedding events, by season and time of day.",
    icon: "💍",
  },
  {
    slug: "face-shapes-explained",
    title: "Face Shapes Explained",
    summary: "How to identify your face shape and choose hairstyles and necklines that actually suit it.",
    icon: "🪞",
  },
  {
    slug: "fragrance-families",
    title: "Fragrance Families, Explained Simply",
    summary: "Fresh, floral, woody, oriental — what they actually smell like and when to wear each.",
    icon: "🌸",
  },
];

export default function GuidesIndexPage() {
  return (
    <div className="page">
      <header className="page-header">
        <span className="brand-mark">Fit&nbsp;&amp;&nbsp;Scent</span>
        <p className="brand-tag">Style guides</p>
        <Link href="/" className="chip" style={{ display: "inline-block", marginTop: "0.5rem" }}>
          ← Back to stylist
        </Link>
      </header>

      <main className="page-main">
        <div className="results-cards" style={{ maxWidth: "720px" }}>
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="rec-card"
              style={{ display: "block", textDecoration: "none", color: "inherit" }}
            >
              <h3>
                {guide.icon} {guide.title}
              </h3>
              <p className="rec-sub">{guide.summary}</p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="page-footer">
        <p>Face-shape, skin-tone, and body-build reading happens on your device. Nothing is uploaded to a server.</p>
      </footer>
    </div>
  );
}