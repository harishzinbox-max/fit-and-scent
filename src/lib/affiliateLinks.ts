// Search-based affiliate deep links. These work immediately with just an
// approved affiliate tag — no product-catalog API access required.
// Replace the placeholder tags below once your affiliate accounts are approved.

const AMAZON_TAG = "YOUR-AMAZON-TAG-21"; // e.g. "fitandscent-21"
const FLIPKART_AFFILIATE_ID = "YOUR-FLIPKART-AFFID";
const MYNTRA_AGGREGATOR_BASE = "https://ekaro.in/enkr2/"; // via EarnKaro or similar

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

// Myntra links typically route through an aggregator that requires a
// destination URL to be wrapped, since Myntra doesn't run a direct program.
export function buildMyntraLink(searchTerm: string): ShoppingLink {
  const destination = encodeURIComponent(`https://www.myntra.com/${encodeURIComponent(searchTerm)}`);
  return { label: "Shop on Myntra", url: `${MYNTRA_AGGREGATOR_BASE}${destination}`, source: "Myntra" };
}