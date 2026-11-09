import type { Occasion } from "../types";

export interface OccasionTemplate {
  clothing: string;
  footwear?: string;
  defaultHairstyle?: string;
  forbidden: string[];
}

// Every default is one complete, concrete outfit. Do not mix abstract
// body-shape or neckline advice into these image-edit instructions.
export const MALE_OCCASION_TEMPLATES: Record<Occasion, OccasionTemplate> = {
  office: {
    clothing: "a light-blue long-sleeved button-down shirt with a spread collar, tucked into charcoal tailored straight-leg trousers",
    footwear: "dark brown leather lace-up shoes",
    defaultHairstyle: "a neat side-part hairstyle",
    forbidden: ["hat", "cap", "sunglasses", "shorts", "floral print"],
  },
  "wedding-guest": {
    clothing: "a deep teal tailored bandhgala jacket with matching straight-leg trousers, elegant but without groom accessories",
    footwear: "dark brown traditional loafers",
    defaultHairstyle: "neatly combed formal hair",
    forbidden: ["hat", "cap", "sunglasses", "shorts", "groom turban"],
  },
  "date-night": {
    clothing: "a cream long-sleeved button-down shirt with a spread collar, tucked into charcoal tailored straight-leg trousers, with no blazer or tie",
    footwear: "brown leather loafers",
    defaultHairstyle: "natural, neatly textured short hair",
    forbidden: ["hat", "cap", "sunglasses", "shorts", "tie", "blazer"],
  },
  festival: {
    clothing: "a solid ivory knee-length cotton kurta with straight beige churidar trousers",
    footwear: "tan traditional mojaris",
    defaultHairstyle: "neatly combed natural hair",
    forbidden: ["hat", "cap", "sunglasses", "blazer", "tie", "shorts"],
  },
  "casual-day": {
    clothing: "a plain white crew-neck T-shirt with dark indigo straight-fit jeans",
    footwear: "clean white low-top sneakers",
    defaultHairstyle: "relaxed natural hair with light texture",
    forbidden: ["hat", "cap", "sunglasses", "tie", "sherwani"],
  },
  "formal-evening": {
    clothing: "a tailored midnight-navy two-piece suit with a white long-sleeved dress shirt",
    footwear: "black polished leather dress shoes",
    defaultHairstyle: "neatly combed formal hair",
    forbidden: ["hat", "cap", "sunglasses", "shorts", "Hawaiian print"],
  },
  "indian-wedding": {
    clothing: "an ivory embroidered knee-length sherwani with cream fitted churidar trousers",
    footwear: "ivory traditional mojaris",
    defaultHairstyle: "neatly styled formal hair",
    forbidden: ["hat", "cap", "sunglasses", "shorts", "jeans"],
  },
  "indian-traditional": {
    clothing: "an off-white cotton knee-length kurta with matching straight-cut pajama trousers",
    footwear: "tan leather sandals",
    defaultHairstyle: "neatly combed natural hair",
    forbidden: ["hat", "cap", "sunglasses", "tie", "blazer", "shorts"],
  },
  hawaiian: {
    clothing: "a short-sleeved floral Hawaiian-print camp-collar shirt, worn untucked with light beige knee-length linen shorts",
    footwear: "brown casual espadrilles",
    defaultHairstyle: "a relaxed textured crop hairstyle",
    forbidden: ["hat", "cap", "sunglasses", "blazer", "tie", "formal shirt", "long trousers"],
  },
  "formal-suit-tie": {
    clothing: "a charcoal two-piece tailored suit with a white dress shirt and a solid burgundy necktie",
    footwear: "black polished lace-up leather shoes",
    defaultHairstyle: "a neat formal side-part hairstyle",
    forbidden: ["hat", "cap", "sunglasses", "shorts", "Hawaiian print"],
  },
};

export const FEMALE_OCCASION_TEMPLATES: Record<Occasion, OccasionTemplate> = {
  office: {
    clothing: "a light-blue long-sleeved tailored blouse tucked into charcoal straight-leg formal trousers",
    footwear: "closed-toe tan low-heel shoes",
    defaultHairstyle: "a neat low bun",
    forbidden: ["hat", "cap", "sunglasses", "beach shorts", "bridal veil"],
  },
  "wedding-guest": {
    clothing: "an elegant deep emerald embroidered ankle-length Anarkali dress with a matching dupatta, styled as a wedding guest, not a bride",
    footwear: "gold-toned traditional flats",
    defaultHairstyle: "soft brushed-out waves",
    forbidden: ["hat", "cap", "sunglasses", "bridal veil", "bridal headpiece", "shorts"],
  },
  "date-night": {
    clothing: "a solid burgundy knee-length wrap dress with short sleeves and a defined waist",
    footwear: "neutral low-heel sandals",
    defaultHairstyle: "soft shoulder-length waves",
    forbidden: ["hat", "cap", "sunglasses", "bridal veil", "office blazer"],
  },
  festival: {
    clothing: "a teal embroidered straight-cut kurta with cream straight-leg pants and a lightweight matching dupatta",
    footwear: "tan traditional flats",
    defaultHairstyle: "a loose low braid",
    forbidden: ["hat", "cap", "sunglasses", "blazer", "tie", "shorts"],
  },
  "casual-day": {
    clothing: "a white cotton relaxed-fit blouse tucked into medium-blue straight-leg jeans",
    footwear: "white casual sneakers",
    defaultHairstyle: "a relaxed shoulder-length hairstyle",
    forbidden: ["hat", "cap", "sunglasses", "bridal veil", "heavy wedding jewellery"],
  },
  "formal-evening": {
    clothing: "a solid midnight-blue floor-length evening gown with a modest V neckline and fitted waist",
    footwear: "silver low-heel evening shoes",
    defaultHairstyle: "an elegant low chignon",
    forbidden: ["hat", "cap", "sunglasses", "shorts", "casual sneakers"],
  },
  "indian-wedding": {
    clothing: "a deep maroon embroidered lehenga skirt with a matching short-sleeved choli and a coordinated dupatta",
    footwear: "gold-toned traditional flats",
    defaultHairstyle: "an elegant low bun",
    forbidden: ["hat", "cap", "sunglasses", "jeans", "shorts"],
  },
  "indian-traditional": {
    clothing: "a rich teal silk saree with a matching fitted short-sleeved blouse, draped naturally and accurately",
    footwear: "neutral traditional sandals",
    defaultHairstyle: "a neat low bun",
    forbidden: ["hat", "cap", "sunglasses", "jeans", "shorts"],
  },
  hawaiian: {
    clothing: "a knee-length tropical floral-print sundress with a comfortable fitted bodice and flowing skirt, suitable for a beach holiday",
    footwear: "tan flat sandals",
    defaultHairstyle: "loose relaxed beach waves",
    forbidden: ["hat", "cap", "sunglasses", "blazer", "tie", "formal trousers"],
  },
  "formal-suit-tie": {
    clothing: "a charcoal tailored single-breasted pantsuit with matching straight-leg trousers, white collared shirt and a narrow navy tie",
    footwear: "black polished low-heel formal shoes",
    defaultHairstyle: "a neat low ponytail",
    forbidden: ["hat", "cap", "sunglasses", "shorts", "Hawaiian print"],
  },
};
