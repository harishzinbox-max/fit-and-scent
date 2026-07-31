import type { HairstyleRecommendation, FaceShape, Occasion } from "../types";

const FACE_SHAPE_GUIDANCE: Record<FaceShape, { style: string; avoid: string; why: string }> = {
  round: {
    style: "long layers with height at the crown, or a side part",
    avoid: "blunt chin-length bobs with no layers",
    why: "vertical layers elongate a face that's close to equal in width and length",
  },
  square: {
    style: "soft waves or layers that graze the jawline",
    avoid: "sharp, blunt-cut straight styles that echo the jaw's angles",
    why: "soft movement around the jaw eases a strong, angular jawline",
  },
  oval: {
    style: "most styles work — this face shape balances almost any cut",
    avoid: "nothing to avoid structurally",
    why: "your length-to-width ratio is already balanced",
  },
  heart: {
    style: "chin-length lobs or side-swept fringes",
    avoid: "styles with heavy volume at the crown",
    why: "this softens a wider forehead relative to a narrower jaw",
  },
  diamond: {
    style: "side-swept bangs or styles with volume at the temples",
    avoid: "styles pulled tightly back with no width at the temples",
    why: "this widens the narrower forehead and jaw relative to the cheekbones",
  },
  oblong: {
    style: "styles with width — waves, curls, or a blunt bob at chin length",
    avoid: "long, straight, center-parted styles with no width",
    why: "horizontal volume counters a face that reads longer than it is wide",
  },
};

const OCCASION_STYLING: Record<Occasion, string> = {
  office: "sleek and polished — a low bun, neat ponytail, or straightened finish",
  "wedding-guest": "an elegant updo or soft curls with some hold",
  "date-night": "loose waves or a half-up style",
  festival: "braids or textured waves that hold up through movement",
  "casual-day": "natural texture, minimal styling",
  "formal-evening": "a formal updo or a sleek, glossy blowout",
};

export function recommendWomenHairstyle(faceShape: FaceShape, occasion: Occasion): HairstyleRecommendation {
  const face = FACE_SHAPE_GUIDANCE[faceShape];
  const styling = OCCASION_STYLING[occasion];

  return {
    style: `${face.style}, styled as ${styling}`,
    avoid: face.avoid,
    reasoning: [
      `Cut: ${face.style} — ${face.why}.`,
      `Styling: ${styling} fits a ${occasion.replace("-", " ")} setting.`,
    ],
  };
}

export function buildWomenHairstyleFromPreference(
  preference: string,
  occasion: Occasion
): HairstyleRecommendation {
  const styling = OCCASION_STYLING[occasion];
  return {
    style: `${preference}, styled as ${styling}`,
    avoid: "",
    reasoning: [`Styling: ${styling} fits a ${occasion.replace("-", " ")} setting.`],
  };
}