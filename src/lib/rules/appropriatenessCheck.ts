import type { Occasion, Gender } from "../types";

export type WomenswearPreference = "dress" | "saree" | "salwar-kameez" | "western-separates" | "gown";
export type MenswearPreference = "shirt-trouser" | "kurta" | "suit" | "ethnic-set" | "casual-tee-jeans";
export type WearPreference = WomenswearPreference | MenswearPreference;

export const WOMEN_WEAR_OPTIONS: { value: WomenswearPreference; label: string }[] = [
  { value: "dress", label: "Dress" },
  { value: "saree", label: "Saree" },
  { value: "salwar-kameez", label: "Salwar kameez" },
  { value: "western-separates", label: "Western separates" },
  { value: "gown", label: "Gown" },
];

export const MEN_WEAR_OPTIONS: { value: MenswearPreference; label: string }[] = [
  { value: "shirt-trouser", label: "Shirt & trouser" },
  { value: "kurta", label: "Kurta" },
  { value: "suit", label: "Suit" },
  { value: "ethnic-set", label: "Ethnic set (sherwani/bandhgala)" },
  { value: "casual-tee-jeans", label: "Casual tee & jeans" },
];

const WEAR_LABEL: Record<WearPreference, string> = {
  dress: "A dress",
  saree: "A saree",
  "salwar-kameez": "A salwar kameez",
  "western-separates": "Western separates",
  gown: "A gown",
  "shirt-trouser": "A shirt and trouser set",
  kurta: "A kurta",
  suit: "A suit",
  "ethnic-set": "An ethnic set",
  "casual-tee-jeans": "Casual wear",
};

// Split by gender so a mismatch on one wardrobe never surfaces the other
// wardrobe's items as the suggested alternative.
const WOMEN_OCCASION_COMPATIBLE_WEAR: Record<Occasion, WomenswearPreference[]> = {
  office: ["dress", "western-separates", "salwar-kameez"],
  "wedding-guest": ["saree", "gown", "salwar-kameez"],
  "date-night": ["dress", "western-separates"],
  festival: ["saree", "salwar-kameez", "dress"],
  "casual-day": ["western-separates", "dress"],
  "formal-evening": ["gown", "saree"],
};

const MEN_OCCASION_COMPATIBLE_WEAR: Record<Occasion, MenswearPreference[]> = {
  office: ["shirt-trouser", "kurta"],
  "wedding-guest": ["kurta", "ethnic-set", "suit"],
  "date-night": ["shirt-trouser", "suit"],
  festival: ["kurta", "ethnic-set"],
  "casual-day": ["casual-tee-jeans", "kurta"],
  "formal-evening": ["suit", "ethnic-set"],
};

export interface AppropriatenessResult {
  appropriate: boolean;
  reasoning: string[];
}

function occasionLabel(occasion: Occasion): string {
  return occasion.replace("-", " ");
}

export function checkAppropriateness(
  wearPreference: WearPreference,
  occasion: Occasion,
  gender: Gender
): AppropriatenessResult {
  const compatible: WearPreference[] =
    gender === "male" ? MEN_OCCASION_COMPATIBLE_WEAR[occasion] : WOMEN_OCCASION_COMPATIBLE_WEAR[occasion];

  if (compatible.includes(wearPreference)) {
    return {
      appropriate: true,
      reasoning: [`${WEAR_LABEL[wearPreference]} is a solid fit for a ${occasionLabel(occasion)} setting.`],
    };
  }

  const alternatives = compatible.slice(0, 2).map((w) => WEAR_LABEL[w]).join(" or ");
  return {
    appropriate: false,
    reasoning: [
      `${WEAR_LABEL[wearPreference]} isn't a typical match for a ${occasionLabel(occasion)} setting — it can read as under- or over-dressed depending on the venue.`,
      `${alternatives} tend to fit this occasion more reliably, so that's what we've styled below instead.`,
    ],
  };
}

export function wearLabel(pref: WearPreference): string {
  return WEAR_LABEL[pref];
}