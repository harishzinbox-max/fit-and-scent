"use client";

import { buildShoppingLinks, buildMyntraLink } from "@/lib/affiliateLinks";

interface Props {
  searchTerms: { label: string; term: string }[];
}

export default function ShopThisLook({ searchTerms }: Props) {
  return (
    <section className="rec-card">
      <h3>Shop this look</h3>
      <p className="rec-sub" style={{ marginBottom: "0.5rem" }}>
        Links open a product search on each site — we earn a small commission on purchases at no extra cost to
        you.
      </p>
      {searchTerms.map(({ label, term }) => (
        <div key={label} style={{ marginBottom: "0.6rem" }}>
          <p className="rec-sub" style={{ marginBottom: "0.3rem", fontWeight: 600 }}>
            {label}
          </p>
          <div className="accessory-picker">
            {buildShoppingLinks(term).map((link) => (
              
                key={link.source}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="chip"
              >
                {link.label}
              </a>
            ))}
            
              href={buildMyntraLink(term).url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="chip"
            >
              Shop on Myntra
            </a>
          </div>
        </div>
      ))}
    </section>
  );
}