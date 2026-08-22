import type { Gender, Occasion, Season } from "../types";
import type { WearPreference } from "./appropriatenessCheck";

export interface FootwearRecommendation {
  type: string;
  shopTerm: string;
  reasoning: string[];
}

const ETHNIC_WEAR: WearPreference[] = ["saree", "salwar-kameez", "kurta", "ethnic-set"];

export function recommendFootwear(
  gender: Gender,
  occasion: Occasion,
  season: Season,
  timeOfDay: "day" | "evening",
  wearPreference: WearPreference
): FootwearRecommendation {
  const isEthnic = ETHNIC_WEAR.includes(wearPreference);
  const isWarmDaytime = season === "spring-summer" && timeOfDay === "day";
  const isColdOrEvening = season === "autumn-winter" || timeOfDay === "evening";

  if (gender === "male") {
    switch (occasion) {
      case "office":
        return {
          type: "Formal leather shoes (oxfords or derbies)",
          shopTerm: "men's formal leather shoes",
          reasoning: [
            "Office settings call for closed, polished leather shoes — they read as put-together without drawing attention.",
          ],
        };
      case "wedding-guest":
      case "festival":
        if (isEthnic) {
          return {
            type: "Juttis or mojaris",
            shopTerm: "men's juttis mojari",
            reasoning: [
              "Ethnic outfits pair naturally with juttis or mojaris — they complete the look instead of looking mismatched with formal Western shoes.",
            ],
          };
        }
        return {
          type: "Formal leather shoes or loafers",
          shopTerm: "men's formal shoes loafers",
          reasoning: ["A Western outfit at a wedding or festival still calls for a polished, closed shoe."],
        };
      case "date-night":
        return {
          type: isColdOrEvening ? "Loafers" : "Clean sneakers or loafers",
          shopTerm: "men's loafers",
          reasoning: [
            "Loafers hit the sweet spot for date night — smart enough to look intentional, relaxed enough not to feel stiff.",
          ],
        };
      case "formal-evening":
        return {
          type: "Formal leather shoes",
          shopTerm: "men's formal leather shoes",
          reasoning: ["Formal evening settings call for a polished, closed leather shoe."],
        };
      case "indian-wedding":
        return {
          type: "Embellished mojaris or juttis",
          shopTerm: "men's wedding mojari juttis",
          reasoning: ["A groom's traditional outfit is completed with embellished mojaris or juttis, not Western dress shoes."],
        };
      case "indian-traditional":
        return {
          type: "Traditional mojaris or juttis",
          shopTerm: "men's traditional mojaris",
          reasoning: ["Regional traditional wear pairs naturally with mojaris or juttis rather than Western shoes."],
        };
      case "hawaiian":
        return {
          type: "Sandals or flip-flops",
          shopTerm: "men's beach sandals",
          reasoning: ["A relaxed tropical theme calls for open, casual beach footwear."],
        };
      case "formal-suit-tie":
        return {
          type: "Oxford dress shoes",
          shopTerm: "men's oxford dress shoes",
          reasoning: ["A full suit-and-tie look calls for classic, polished oxford dress shoes."],
        };
      case "casual-day":
      default:
        if (isWarmDaytime) {
          return {
            type: "Sandals or floaters",
            shopTerm: "men's sandals floaters",
            reasoning: ["Warm daytime casual wear is a good match for open, breathable footwear."],
          };
        }
        return {
          type: "Sneakers",
          shopTerm: "men's sneakers",
          reasoning: ["Sneakers suit relaxed daytime plans and stay comfortable through a full day out."],
        };
    }
  }

  // gender === "female"
  switch (occasion) {
    case "office":
      return {
        type: "Block-heel pumps or ballet flats",
        shopTerm: "women's block heel pumps",
        reasoning: [
          "A low block heel or flat keeps you polished for the office without sacrificing comfort through the day.",
        ],
      };
    case "wedding-guest":
    case "festival":
      if (isEthnic) {
        return {
          type: "Embellished juttis or heels",
          shopTerm: "women's juttis heels ethnic",
          reasoning: [
            "Ethnic outfits pair well with juttis or heels in matching or metallic tones — they finish the look rather than fighting it.",
          ],
        };
      }
      return {
        type: "Heels",
        shopTerm: "women's heels",
        reasoning: ["A Western outfit at a wedding or festival calls for a dressed-up heel."],
      };
    case "date-night":
      return {
        type: timeOfDay === "evening" ? "Heels" : "Wedges or flats",
        shopTerm: timeOfDay === "evening" ? "women's heels" : "women's wedges flats",
        reasoning: [
          timeOfDay === "evening"
            ? "An evening date calls for a heel — it elevates the whole look."
            : "A daytime date works better in a wedge or flat — dressy without being impractical.",
        ],
      };
    case "formal-evening":
      return {
        type: "Heels",
        shopTerm: "women's heels",
        reasoning: ["Formal evening occasions call for a heel to match the elevated dress code."],
      };
    case "indian-wedding":
      return {
        type: "Embellished bridal juttis or heels",
        shopTerm: "women's bridal juttis heels",
        reasoning: ["Traditional bridal wear pairs best with embellished juttis or heels in gold or matching tones."],
      };
    case "indian-traditional":
      return {
        type: "Traditional embellished juttis",
        shopTerm: "women's traditional juttis",
        reasoning: ["Regional traditional wear pairs naturally with embellished juttis rather than Western footwear."],
      };
    case "hawaiian":
      return {
        type: "Flat sandals",
        shopTerm: "women's flat sandals",
        reasoning: ["A relaxed tropical theme calls for open, casual flat sandals."],
      };
    case "formal-suit-tie":
      return {
        type: "Pointed-toe heels or pumps",
        shopTerm: "women's pointed heels",
        reasoning: ["A tailored power-suit look pairs best with sleek, pointed-toe heels or pumps."],
      };
    case "casual-day":
    default:
      if (isWarmDaytime) {
        return {
          type: "Sandals or flats",
          shopTerm: "women's sandals flats",
          reasoning: ["Warm daytime casual wear pairs best with open, breathable sandals or flats."],
        };
      }
      return {
        type: "Sneakers or flats",
        shopTerm: "women's sneakers flats",
        reasoning: ["Sneakers or flats keep you comfortable for relaxed daytime plans."],
      };
  }
}
