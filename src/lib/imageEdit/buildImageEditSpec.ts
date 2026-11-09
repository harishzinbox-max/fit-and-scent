import type { Occasion } from "../types";
import {
  FEMALE_OCCASION_TEMPLATES,
  MALE_OCCASION_TEMPLATES,
} from "./occasionTemplates";
import type { ImageEditSpec } from "./types";

type StylingGender = "male" | "female";

interface BuildImageEditSpecArgs {
  gender: StylingGender;
  occasion: Occasion;
  wearPreference?: string;
  hairstylePreference?: string;
  accessories?: string[];
  footwearPreference?: string;
}

// Concrete descriptions for clothing categories that the existing quiz may
// offer. A user's explicit selection takes priority when it is compatible
// with the selected gender. Occasion templates supply a deterministic default.
const MALE_WEAR: Record<string, string> = {
  "shirt-trouser": "a cream long-sleeved button-down shirt with a spread collar, tucked into charcoal tailored straight-leg trousers",
  kurta: "an ivory knee-length cotton kurta with matching straight-cut pajama trousers",
  suit: "a tailored navy two-piece suit with a white collared dress shirt",
  "sherwani-groom": "an ivory embroidered knee-length sherwani with fitted cream churidar trousers",
  "hawaiian-shirt-shorts": "a short-sleeved floral Hawaiian-print camp-collar shirt, untucked, with beige knee-length linen shorts",
  "casual-tee-jeans": "a plain white short-sleeved crew-neck T-shirt with dark indigo straight-fit jeans",
  "ethnic-set": "a deep teal tailored bandhgala jacket with matching straight-cut trousers",
};

const FEMALE_WEAR: Record<string, string> = {
  dress: "a solid burgundy knee-length wrap dress with short sleeves and a defined waist",
  saree: "a deep teal silk saree with a matching fitted short-sleeved blouse, draped naturally",
  "salwar-kameez": "an embroidered teal straight-cut kameez with cream straight-leg salwar trousers and a coordinating dupatta",
  lehenga: "a maroon embroidered lehenga skirt with matching choli and a coordinated dupatta",
  "hawaiian-sundress": "a knee-length tropical floral-print sundress with a fitted bodice and flowing skirt",
  "western-separates": "a cream fitted blouse tucked into charcoal tailored straight-leg trousers",
  gown: "a floor-length midnight-blue evening gown with a modest V neckline and fitted waist",
  "ethnic-set": "an embroidered teal straight-cut kurta with cream straight-leg pants and a matching dupatta",
};

function selectedGarment(
  gender: StylingGender,
  occasion: Occasion,
  wearPreference?: string
): string | undefined {
  if (!wearPreference) return undefined;
  const options = gender === "male" ? MALE_WEAR : FEMALE_WEAR;
  const match = options[wearPreference];
  if (!match) return undefined;

  // Hawaiian is an occasion with a specific visual requirement. A different
  // category may be present in the form's defaults; don't render formal wear.
  if (occasion === "hawaiian") {
    if (gender === "male" && wearPreference !== "hawaiian-shirt-shorts") return undefined;
    if (gender === "female" && wearPreference !== "hawaiian-sundress") return undefined;
  }
  return match;
}

export function buildImageEditSpec({
  gender,
  occasion,
  wearPreference,
  hairstylePreference,
  accessories,
  footwearPreference,
}: BuildImageEditSpecArgs): ImageEditSpec {
  const template =
    gender === "male"
      ? MALE_OCCASION_TEMPLATES[occasion]
      : FEMALE_OCCASION_TEMPLATES[occasion];

  if (!template) {
    throw new Error(`No image-edit template configured for occasion: ${occasion}`);
  }

  const clothingDescription =
    selectedGarment(gender, occasion, wearPreference) ?? template.clothing;
  const hairstyleDescription =
    hairstylePreference?.trim() || template.defaultHairstyle || "natural, tidy hairstyle";

  // Keep negative constraints from contradicting explicitly selected clothes.
  const forbiddenItems = template.forbidden.filter((item) => {
    const garment = clothingDescription.toLowerCase();
    const banned = item.toLowerCase();
    return !garment.includes(banned);
  });

  return {
    occasion,
    clothingDescription,
    hairstyleDescription,
    footwearDescription: footwearPreference?.trim() || template.footwear,
    accessoryDescription: accessories?.filter(Boolean).join(", ") || "",
    forbiddenItems,
    changeHair: true,
    changeClothing: true,
  };
}
