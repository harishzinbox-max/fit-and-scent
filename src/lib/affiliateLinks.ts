// Search-based affiliate deep links. These work immediately with just an
// approved affiliate tag — no product-catalog API access required.
// Replace the placeholder tags below once your affiliate accounts are approved.

const AMAZON_TAG = "YOUR-AMAZON-TAG-21"; // e.g. "fitandscent-21"
const FLIPKART_AFFILIATE_ID = "YOUR-FLIPKART-AFFID";
import type { ShoppingLink } from "./types";

function amazonSearchUrl(query: string): string {
  const q = encodeURIComponent(query);
  return `https://www.amazon.in/s?k=${q}&tag=${AMAZON_TAG}`;
}

function flipkartSearchUrl(query: string): string {
  const q = encodeURIComponent(query);
  return `https://www.flipkart.com/search?q=${q}&affid=${FLIPKART_AFFILIATE_ID}`;
}

export function buildShoppingLinks(searchTerm: string): ShoppingLink[] {
  return [
    { label: `Shop on Amazon`, url: amazonSearchUrl(searchTerm), source: "Amazon" },
    { label: `Shop on Flipkart`, url: flipkartSearchUrl(searchTerm), source: "Flipkart" },
  ];
}

// Myntra doesn't run a direct affiliate program — it requires signing up
// with an aggregator (e.g. EarnKaro) and using YOUR real tracking link
// format once approved. Until then, this points to a plain (non-affiliate)
// Myntra search so the link at least works correctly for the user.
export function buildMyntraLink(searchTerm: string): ShoppingLink {
  const q = encodeURIComponent(searchTerm);
  return { label: "Shop on Myntra", url: `https://www.myntra.com/${q}`, source: "Myntra" };
}