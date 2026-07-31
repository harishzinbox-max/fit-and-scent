import type { Occasion, Gender } from "../types";

export interface AccessoryRecommendation {
  items: string[];
  reasoning: string[];
}

const WOMEN_ACCESSORIES: Record<Occasion, { items: string[]; why: string }> = {
  office: { items: ["structured watch", "small stud earrings", "leather tote"], why: "minimal, functional pieces keep a professional read" },
  "wedding-guest": { items: ["statement earrings", "embellished clutch", "bangles"], why: "festive settings support more ornate accessories" },
  "date-night": { items: ["delicate necklace", "small clutch", "hoop earrings"], why: "understated pieces that don't compete with the outfit" },
  festival: { items: ["oxidized jewelry", "bindis", "juttis"], why: "traditional accents suit festival settings" },
  "casual-day": { items: ["sunglasses", "crossbody bag", "simple studs"], why: "practical pieces for an everyday look" },
  "formal-evening": { items: ["statement necklace", "evening clutch", "heels"], why: "formal settings support more elevated, dressed-up pieces" },
};

const MEN_ACCESSORIES: Record<Occasion, { items: string[]; why: string }> = {
  office: { items: ["leather watch", "leather belt", "minimal cufflinks"], why: "understated pieces that read as professional" },
  "wedding-guest": { items: ["pocket square", "brooch or lapel pin", "formal watch"], why: "festive settings support a bit more polish" },
  "date-night": { items: ["minimal watch", "leather bracelet"], why: "simple pieces that don't overdress the look" },
  festival: { items: ["sunglasses", "statement watch"], why: "casual accents suit festival settings" },
  "casual-day": { items: ["sunglasses", "canvas bag", "cap"], why: "practical pieces for an everyday look" },
  "formal-evening": { items: ["formal watch", "cufflinks", "tie pin"], why: "formal settings support more polished accessories" },
};

export function recommendAccessories(gender: Gender, occasion: Occasion): AccessoryRecommendation {
  const table = gender === "male" ? MEN_ACCESSORIES : WOMEN_ACCESSORIES;
  const { items, why } = table[occasion];
  return {
    items,
    reasoning: [`${items.join(", ")} — ${why}.`],
  };
}