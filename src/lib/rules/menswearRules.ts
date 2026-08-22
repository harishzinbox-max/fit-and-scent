import type { DressRecommendation, FaceShape, BodyBuild, Occasion, AgeGroup } from "../types";

const FACE_SHAPE_GUIDANCE: Record<FaceShape, { neckline: string; avoidNeckline: string; why: string }> = {
  round: {
    neckline: "spread collar or mandarin collar",
    avoidNeckline: "tight round crew necks",
    why: "a wider, more structured collar adds line to balance your face's width-to-length ratio",
  },
  square: {
    neckline: "softer spread collar with a gentle roll",
    avoidNeckline: "sharp point button-down collars",
    why: "a softer collar eases a jawline that is close in width to your cheekbones",
  },
  oval: {
    neckline: "most collar styles work — spread, point, or mandarin",
    avoidNeckline: "nothing to avoid structurally",
    why: "your length-to-width ratio is already balanced, so collar choice is led by occasion, not correction",
  },
  heart: {
    neckline: "point collar",
    avoidNeckline: "dramatically wide spread collars",
    why: "this adds width at the jaw to balance a wider forehead relative to your jaw",
  },
  diamond: {
    neckline: "club or rounded collar",
    avoidNeckline: "narrow point collars",
    why: "a rounder collar softens narrower forehead and jaw relative to your cheekbones",
  },
  oblong: {
    neckline: "wide spread collar or mandarin with horizontal detailing",
    avoidNeckline: "long, narrow point collars",
    why: "horizontal lines counter a face that reads longer than it is wide",
  },
};

const BODY_BUILD_GUIDANCE: Record<BodyBuild, { silhouette: string; avoid: string; why: string }> = {
  rectangle: {
    silhouette: "a structured jacket or kurta with a slight taper at the waist",
    avoid: "fully boxy, unstructured fits",
    why: "a slight taper creates shape where your shoulder and hip widths are close to even",
  },
  hourglass: {
    silhouette: "a fitted cut through the chest and waist",
    avoid: "oversized, boxy fits that hide your build",
    why: "your shoulder and waist are already well-defined — the fit should follow that, not hide it",
  },
  pear: {
    silhouette: "structured shoulder detailing with straight-leg trousers",
    avoid: "skinny-fit trousers paired with a plain, unstructured top",
    why: "this balances hips that are proportionally wider than your shoulders",
  },
  apple: {
    silhouette: "a straight-cut shirt or kurta that skims rather than clings, open layering",
    avoid: "tightly tucked-in fitted shirts",
    why: "this creates a cleaner line where your midsection is proportionally fuller",
  },
  "inverted-triangle": {
    silhouette: "simpler shoulder lines with straight-cut trousers",
    avoid: "heavily padded or structured shoulders",
    why: "this balances shoulders that are proportionally wider than your hips",
  },
};

const OCCASION_CATEGORY: Record<Occasion, string> = {
  office: "a tailored shirt and trouser set, or a blazer over it",
  "wedding-guest": "a kurta set or bandhgala in a festive, non-black palette",
  "date-night": "a fitted shirt with tailored trousers, or a smart casual blazer",
  festival: "a kurta or ethnic set in breathable fabric",
  "casual-day": "a relaxed shirt or tee with well-fitted trousers",
  "formal-evening": "a suit or bandhgala for formal settings",
    "indian-wedding": "a sherwani or bandhgala with traditional groom detailing",
};

const AGE_STYLE_NOTE: Record<AgeGroup, string> = {
  "18-25": "with room to lean trend-forward and use bolder colors",
  "26-40": "balancing polish with everyday comfort",
  "41-60": "leaning classic and tailored rather than trend-driven",
  "60+": "prioritizing comfortable fit and timeless tailoring over closely fitted trend pieces",
};

export function recommendMenswear(
  faceShape: FaceShape,
  bodyBuild: BodyBuild,
  occasion: Occasion,
  ageGroup: AgeGroup,
  categoryOverride?: string
): DressRecommendation {
  const face = FACE_SHAPE_GUIDANCE[faceShape];
  const body = BODY_BUILD_GUIDANCE[bodyBuild];
  const category = categoryOverride ?? OCCASION_CATEGORY[occasion];
  const ageNote = AGE_STYLE_NOTE[ageGroup];

  return {
    silhouette: `${category}, in ${body.silhouette}`,
    neckline: face.neckline,
    avoid: `${face.avoidNeckline}; ${body.avoid}`,
    reasoning: [
      `Collar: ${face.neckline} — ${face.why}.`,
      `Fit: ${body.silhouette} — ${body.why}.`,
      `Category: ${category} fits a ${occasion.replace("-", " ")} setting, ${ageNote}.`,
    ],
  };
}