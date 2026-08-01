"use client";

import { useState } from "react";
import { buildShoppingLinks, buildMyntraLink } from "@/lib/affiliateLinks";

interface Hotspot {
  id: string;
  label: string;
  searchTerm: string;
  top: string;
  left: string;
  width: string;
  height: string;
}

interface Props {
  imageUrl: string;
  hotspots: Hotspot[];
}

export default function ClickableLookImage({ imageUrl, hotspots }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
      <img
        src={imageUrl}
        alt="Generated look"
        className="result-photo"
        style={{ display: "block", width: "100%" }}
        onClick={() => setOpenId(null)}
      />
      {hotspots.map((h) => (
        <div key={h.id} style={{ position: "absolute", top: h.top, left: h.left, width: h.width, height: h.height }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenId(openId === h.id ? null : h.id);
            }}
            aria-label={`Shop ${h.label}`}
            style={{
              width: "100%",
              height: "100%",
              background: openId === h.id ? "rgba(212,163,86,0.3)" : "rgba(255,255,255,0.001)",
              border: openId === h.id ? "2px dashed rgba(212,163,86,0.9)" : "2px dashed rgba(255,255,255,0.25)",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          />
          {openId === h.id && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "0.3rem",
                background: "#2a1830",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                padding: "0.5rem",
                zIndex: 10,
                minWidth: "170px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="rec-sub" style={{ marginBottom: "0.3rem", fontWeight: 600 }}>
                {h.label}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {buildShoppingLinks(h.searchTerm).map((link) => (
                  <a key={link.source} href={link.url} target="_blank" rel="noopener noreferrer sponsored" className="chip">
                    {link.label}
                  </a>
                ))}
                <a href={buildMyntraLink(h.searchTerm).url} target="_blank" rel="noopener noreferrer sponsored" className="chip">
                  Shop on Myntra
                </a>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}