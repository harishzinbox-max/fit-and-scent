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
  "indian-wedding": { items: ["kundan or polki jewelry set", "maang tikka", "bridal clutch"], why: "traditional bridal wear is paired with statement kundan/polki jewelry and a maang tikka" },
  "indian-traditional": { items: ["oxidized silver jewelry", "bindi", "traditional bangles"], why: "regional-style jewelry completes the traditional look authentically" },
  hawaiian: { items: ["flower lei", "shell jewelry", "sunglasses"], why: "tropical accents match the relaxed Hawaiian theme" },
  "formal-suit-tie": { items: ["structured watch", "minimal stud earrings", "leather clutch"], why: "formal tailoring calls for polished, understated accessories" },
};

const MEN_ACCESSORIES: Record<Occasion, { items: string[]; why: string }> = {
  office: { items: ["leather watch", "leather belt", "minimal cufflinks"], why: "understated pieces that read as professional" },
  "wedding-guest": { items: ["pocket square", "brooch or lapel pin", "formal watch"], why: "festive settings support a bit more polish" },
  "date-night": { items: ["minimal watch", "leather bracelet"], why: "simple pieces that don't overdress the look" },
  festival: { items: ["sunglasses", "statement watch"], why: "casual accents suit festival settings" },
  "casual-day": { items: ["sunglasses", "canvas bag", "cap"], why: "practical pieces for an everyday look" },
  "formal-evening": { items: ["formal watch", "cufflinks", "tie pin"], why: "formal settings support more polished accessories" },
  "indian-wedding": { items: ["safa or turban", "kalgi brooch"], why: "a groom's traditional look is completed with a safa (turban) and a kalgi brooch" },
  "indian-traditional": { items: ["traditional turban or headwear", "mojaris"], why: "regional headwear and footwear complete the traditional look" },
  hawaiian: { items: ["flower lei", "straw hat", "sunglasses"], why: "tropical accents match the relaxed Hawaiian theme" },
  "formal-suit-tie": { items: ["silk tie", "cufflinks", "pocket square"], why: "a tie, cufflinks, and pocket square complete a sharp formal look" },
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

const WOMEN_ACCESSORY_RECOMMEND: Record<Occasion, string[]> = {
  office: ["watch", "earrings"],
  "wedding-guest": ["earrings", "bangles", "clutch"],
  "date-night": ["necklace", "earrings"],
  festival: ["bangles", "earrings"],
  "casual-day": ["sunglasses", "watch"],
  "formal-evening": ["necklace", "clutch"],
  "indian-wedding": ["necklace", "earrings", "bangles"],
  "indian-traditional": ["bangles", "earrings"],
  hawaiian: ["sunglasses"],
  "formal-suit-tie": ["watch", "earrings"],
};

const MEN_ACCESSORY_RECOMMEND: Record<Occasion, string[]> = {
  office: ["watch"],
  "wedding-guest": ["watch", "studs"],
  "date-night": ["watch", "bracelet"],
  festival: ["sunglasses", "watch"],
  "casual-day": ["cap", "sunglasses"],
  "formal-evening": ["watch"],
  "indian-wedding": ["watch"],
  "indian-traditional": ["watch"],
  hawaiian: ["sunglasses", "cap"],
  "formal-suit-tie": ["watch"],
};

export function recommendAccessoryValues(gender: Gender, occasion: Occasion): string[] {
  return gender === "male" ? MEN_ACCESSORY_RECOMMEND[occasion] : WOMEN_ACCESSORY_RECOMMEND[occasion];
}
