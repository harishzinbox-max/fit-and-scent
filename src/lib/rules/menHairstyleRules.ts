import type { HairstyleRecommendation, FaceShape, Occasion } from "../types";

const FACE_SHAPE_GUIDANCE: Record<FaceShape, { style: string; avoid: string; why: string }> = {
  round: {
    style: "a taper or fade with more length and height on top",
    avoid: "short, uniform-length cuts with no height on top",
    why: "height on top elongates a face that's close to equal in width and length",
  },
  square: {
    style: "a textured crop or side part with some length",
    avoid: "very short buzz cuts that emphasize a strong jawline",
    why: "added texture and length soften a strong, angular jawline",
  },
  oval: {
    style: "most cuts work — this face shape balances almost any style",
    avoid: "nothing to avoid structurally",
    why: "your length-to-width ratio is already balanced",
  },
  heart: {
    style: "a side-swept fringe or textured top with shorter sides",
    avoid: "styles with heavy volume swept straight back off the forehead",
    why: "this softens a wider forehead relative to a narrower jaw",
  },
  diamond: {
    style: "a crop with fringe or texture at the temples",
    avoid: "slicked-back styles with no width at the temples",
    why: "this widens the narrower forehead and jaw relative to the cheekbones",
  },
  oblong: {
    style: "a fade with width on the sides, kept shorter on top",
    avoid: "long styles with height on top and short sides",
    why: "keeping height low and width even counters a face that reads longer than it is wide",
  },
};

const OCCASION_STYLING: Record<Occasion, string> = {
  office: "neat and combed, minimal product shine",
  "wedding-guest": "sharp and styled, a defined part",
  "date-night": "textured and slightly tousled",
  festival: "relaxed, natural texture",
  "casual-day": "natural, unstyled texture",
  "formal-evening": "sleek and precisely combed",
  "indian-wedding": "sharp and traditionally styled, often paired with a turban or safa",
};

export function recommendMenHairstyle(faceShape: FaceShape, occasion: Occasion): HairstyleRecommendation {
  const face = FACE_SHAPE_GUIDANCE[faceShape];
  const styling = OCCASION_STYLING[occasion];

  return {
    style: `${face.style}, kept ${styling}`,
    avoid: face.avoid,
    reasoning: [
      `Cut: ${face.style} — ${face.why}.`,
      `Styling: ${styling} fits a ${occasion.replace("-", " ")} setting.`,
    ],
  };
}

export function buildMenHairstyleFromPreference(
  preference: string,
  occasion: Occasion
): HairstyleRecommendation {
  const styling = OCCASION_STYLING[occasion];
  return {
    style: `${preference}, kept ${styling}`,
    avoid: "",
    reasoning: [`Styling: ${styling} fits a ${occasion.replace("-", " ")} setting.`],
  };
}
