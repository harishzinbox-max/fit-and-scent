import type { Occasion, Gender } from "../types";

export interface AccessoryRecommendation {
  items: string[];
  reasoning: string[];
}
export interface AccessoryOption {
  value: string;
  label: string;
}

export const WOMEN_ACCESSORY_OPTIONS: AccessoryOption[] = [
  { value: "necklace", label: "Necklace" },
  { value: "earrings", label: "Earrings/studs" },
  { value: "bangles", label: "Bangles" },
  { value: "clutch", label: "Clutch/handbag" },
  { value: "sunglasses", label: "Sunglasses" },
  { value: "watch", label: "Watch" },
  { value: "none", label: "No accessories" },
];

export const MEN_ACCESSORY_OPTIONS: AccessoryOption[] = [
  { value: "cap", label: "Cap/hat" },
  { value: "sunglasses", label: "Sunglasses" },
  { value: "watch", label: "Watch" },
  { value: "bracelet", label: "Bracelet" },
  { value: "studs", label: "Studs/earring" },
  { value: "none", label: "No accessories" },
];
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
export interface AccessoryFitResult {
  chosenLabel: string;
  reasoning: string[];
}

// Compares the user's picks against the occasion-appropriate list already
// defined above, and explains the fit rather than overriding their choice.
export function checkAccessoryFit(
  selected: string[],
  gender: Gender,
  occasion: Occasion
): AccessoryFitResult {
  const table = gender === "male" ? MEN_ACCESSORIES : WOMEN_ACCESSORIES;
  const recommended = table[occasion].items;
  const chosen = selected.filter((s) => s !== "none");

  if (chosen.length === 0) {
    return { chosenLabel: "No accessories", reasoning: ["Going without accessories keeps the look clean and simple."] };
 }

  const matches = chosen.filter((c) => recommended.some((r) => r.toLowerCase().includes(c.toLowerCase())));
  const nonMatches = chosen.filter((c) => !matches.includes(c));

  const reasoning: string[] = [];
  if (matches.length > 0) {
    reasoning.push(`${matches.join(", ")} fit well with a ${occasion.replace("-", " ")} setting.`);
  }
  if (nonMatches.length > 0) {
    reasoning.push(
      `${nonMatches.join(", ")} isn't the most typical pairing for ${occasion.replace("-", " ")}, but it's a personal styling choice — for reference, ${recommended.slice(0, 2).join(" or ")} tend to be the safer fit here.`
    );
  }

  return { chosenLabel: chosen.join(", "), reasoning };
}