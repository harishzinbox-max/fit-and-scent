import type { FaceShape, Gender } from "../types";

// Maps which hairstyle option *values* (from hairstyleOptions.ts) are a
// strong fit vs. a caution for each face shape. Kept separate from the
// occasion-styling logic so this only judges shape/style compatibility.
const WOMEN_FIT: Record<FaceShape, { good: string[]; caution: string[]; why: string; whyCaution: string }> = {
  round: {
    good: ["long layers with movement", "an updo or bun"],
    caution: ["a sleek, straight finish"],
    why: "layers and height add length to balance a rounder face.",
    whyCaution: "a blunt, straight finish with no layers can emphasize width rather than balance it.",
  },
  square: {
    good: ["loose waves or curls", "a braided style"],
    caution: ["a sleek, straight finish"],
    why: "soft movement eases a strong, angular jawline.",
    whyCaution: "sharp, straight lines can echo and emphasize the jaw's angles.",
  },
  oval: {
    good: ["long layers with movement", "loose waves or curls", "a sleek, straight finish", "a braided style", "an updo or bun", "natural texture, unstyled"],
    caution: [],
    why: "an oval face shape balances almost any style.",
    whyCaution: "",
  },
  heart: {
    good: ["a braided style", "natural texture, unstyled"],
    caution: ["an updo or bun"],
    why: "styles that don't add volume at the crown keep the forehead from looking wider.",
    whyCaution: "an updo pulls attention and volume upward, which can widen a forehead that's already proportionally wider than the jaw.",
  },
  diamond: {
    good: ["loose waves or curls", "long layers with movement"],
    caution: ["a sleek, straight finish"],
    why: "volume at the temples widens a narrower forehead and jaw relative to the cheekbones.",
    whyCaution: "styles pulled tightly back reduce width exactly where this face shape benefits from it.",
  },
  oblong: {
    good: ["loose waves or curls", "a braided style"],
    caution: ["long layers with movement", "a sleek, straight finish"],
    why: "width-adding styles counter a face that reads longer than it is wide.",
    whyCaution: "long, straight styles add length, which isn't ideal on an already-long face shape.",
  },
};

const MEN_FIT: Record<FaceShape, { good: string[]; caution: string[]; why: string; whyCaution: string }> = {
  round: {
    good: ["a textured crop", "a fade with length on top"],
    caution: ["a close buzz cut"],
    why: "height on top elongates a face that's close to equal in width and length.",
    whyCaution: "a uniform buzz with no height can emphasize a rounder face shape.",
  },
  square: {
    good: ["a textured crop", "natural texture, unstyled"],
    caution: ["a close buzz cut"],
    why: "added texture and length soften a strong, angular jawline.",
    whyCaution: "very short, uniform cuts can emphasize a strong jawline rather than soften it.",
  },
  oval: {
    good: ["a textured crop", "a fade with length on top", "a slicked-back style", "natural texture, unstyled", "a close buzz cut"],
    caution: [],
    why: "an oval face shape balances almost any cut.",
    whyCaution: "",
  },
  heart: {
    good: ["a textured crop", "natural texture, unstyled"],
    caution: ["a slicked-back style"],
    why: "texture on top, kept off a swept-back forehead, softens a wider forehead relative to the jaw.",
    whyCaution: "slicking hair straight back can expose and emphasize a wider forehead.",
  },
  diamond: {
    good: ["a fade with length on top", "a textured crop"],
    caution: ["a slicked-back style"],
    why: "texture at the temples widens a narrower forehead and jaw relative to the cheekbones.",
    whyCaution: "slicked-back styles remove width exactly where this face shape benefits from it.",
  },
  oblong: {
    good: ["a fade with length on top", "a close buzz cut"],
    caution: ["a slicked-back style"],
    why: "keeping height low and width even counters a face that reads longer than it is wide.",
    whyCaution: "height on top adds length, which isn't ideal on an already-long face shape.",
  },
};

export interface HairstyleFitResult {
  verdict: "good" | "caution" | "neutral";
  reasoning: string[];
}

export function checkHairstyleFit(gender: Gender, faceShape: FaceShape, chosenValue: string): HairstyleFitResult {
  const table = gender === "male" ? MEN_FIT : WOMEN_FIT;
  const entry = table[faceShape];

  if (entry.good.includes(chosenValue)) {
    return { verdict: "good", reasoning: [`This is a strong match for your face shape — ${entry.why}`] };
  }
  if (entry.caution.includes(chosenValue)) {
    return {
      verdict: "caution",
      reasoning: [
        `This style may not be the most flattering pairing for your face shape — ${entry.whyCaution}`,
        `If you'd like a shape-optimized option instead, ${entry.good[0] ?? "a different style"} tends to work well here.`,
      ],
    };
  }
  return { verdict: "neutral", reasoning: ["This is a solid, versatile choice for your face shape."] };
}