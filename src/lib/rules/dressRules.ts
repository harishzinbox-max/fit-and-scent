import type { DressRecommendation, FaceShape, BodyBuild, Occasion } from "../types";

/**
 * Face-shape -> neckline/silhouette guidance.
 * Sourced from standard styling heuristics (balance what the face already
 * has: angular shapes get softened, soft shapes get definition).
 */
const FACE_SHAPE_GUIDANCE: Record<FaceShape, { neckline: string; avoidNeckline: string; why: string }> = {
  round: {
    neckline: "V-neck or sweetheart neckline",
    avoidNeckline: "high round crew necks",
    why: "a V-shape adds vertical line to balance your face's width-to-length ratio",
  },
  square: {
    neckline: "scoop neck or soft draped collar",
    avoidNeckline: "structured square or boat necklines",
    why: "curved necklines soften a jawline that is close in width to your cheekbones",
  },
  oval: {
    neckline: "most necklines work — boat, V, or collared",
    avoidNeckline: "nothing to avoid structurally",
    why: "your length-to-width ratio is already balanced, so necklines are led by occasion, not correction",
  },
  heart: {
    neckline: "V-neck or off-shoulder",
    avoidNeckline: "high halter necks that widen the shoulder line",
    why: "this draws the eye down and away from a wider forehead relative to your jaw",
  },
  diamond: {
    neckline: "scoop or boat neckline",
    avoidNeckline: "narrow high necklines",
    why: "widening the neckline balances narrower forehead and jaw relative to your cheekbones",
  },
  oblong: {
    neckline: "boat neck or horizontal necklines",
    avoidNeckline: "plunging deep V necklines",
    why: "horizontal lines counter a face that reads longer than it is wide",
  },
};

const BODY_BUILD_GUIDANCE: Record<BodyBuild, { silhouette: string; avoid: string; why: string }> = {
  rectangle: {
    silhouette: "belted or fit-and-flare silhouettes",
    avoid: "fully straight shift cuts with no waist definition",
    why: "a defined waist creates curve where your shoulder, waist, and hip widths are close to even",
  },
  hourglass: {
    silhouette: "fitted, waist-following silhouettes",
    avoid: "boxy or oversized cuts that hide your waist",
    why: "your shoulder and hip widths are already balanced — the silhouette should follow, not fight, your waist",
  },
  pear: {
    silhouette: "structured shoulders (e.g. cap sleeves, boat neck tops) with A-line skirts",
    avoid: "skinny-fit bottoms with plain, unstructured tops",
    why: "this balances hips that are proportionally wider than your shoulders",
  },
  apple: {
    silhouette: "empire waist or A-line dresses that skim the midsection",
    avoid: "fitted waistbands or tucked-in tops",
    why: "this creates length through the torso where your midsection is proportionally fuller",
  },
  "inverted-triangle": {
    silhouette: "fuller skirts (A-line, gathered) with simpler necklines",
    avoid: "structured or padded shoulders",
    why: "this balances shoulders that are proportionally wider than your hips",
  },
};

const OCCASION_CATEGORY: Record<Occasion, string> = {
  office: "tailored separates or a structured sheath dress",
  "wedding-guest": "a midi or maxi dress in a non-white, non-black palette",
  "date-night": "a fitted dress or elevated separates in a richer color",
  festival: "a flowy dress or embellished separates that move well",
  "casual-day": "relaxed separates — trousers or a casual dress",
  "formal-evening": "a floor-length gown or formal jumpsuit",
};

export function recommendDress(
  faceShape: FaceShape,
  bodyBuild: BodyBuild,
  occasion: Occasion
): DressRecommendation {
  const face = FACE_SHAPE_GUIDANCE[faceShape];
  const body = BODY_BUILD_GUIDANCE[bodyBuild];
  const category = OCCASION_CATEGORY[occasion];

  return {
    silhouette: `${category}, in ${body.silhouette}`,
    neckline: face.neckline,
    avoid: `${face.avoidNeckline}; ${body.avoid}`,
    reasoning: [
      `Neckline: ${face.neckline} — ${face.why}.`,
      `Silhouette: ${body.silhouette} — ${body.why}.`,
      `Category: ${category} fits a ${occasion.replace("-", " ")} setting.`,
    ],
  };
}
