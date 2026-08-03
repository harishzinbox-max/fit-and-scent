import type { FaceRatios, FaceShape, SkinTone, FaceAnalysisResult } from "./types";

/**
 * MediaPipe FaceLandmarker (468-point face mesh) landmark indices used here.
 * Reference: https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/face_mesh.md
 *
 * These are approximate anatomical anchors, good enough for ratio-based
 * bucketing. They are NOT medical/dermatological measurements.
 */
export const LANDMARKS = {
  chin: 152,
  foreheadTop: 10,
  cheekLeft: 454,
  cheekRight: 234,
  jawLeft: 397,
  jawRight: 172,
  foreheadLeft: 284,
  foreheadRight: 54,
  // used for jaw angle curvature
  jawCurveLeft: 288,
  jawCurveRight: 58,
  // skin sampling points (avoid eyes/brows/lips)
  cheekSampleLeft: 425,
  cheekSampleRight: 205,
  foreheadSample: 151,
} as const;

interface Point {
  x: number;
  y: number;
  z?: number;
}

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleAt(vertex: Point, a: Point, b: Point): number {
  const v1 = { x: a.x - vertex.x, y: a.y - vertex.y };
  const v2 = { x: b.x - vertex.x, y: b.y - vertex.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (mag === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function computeFaceRatios(landmarks: Point[]): FaceRatios {
  const l = LANDMARKS;
  const jawWidth = dist(landmarks[l.jawLeft], landmarks[l.jawRight]);
  const cheekWidth = dist(landmarks[l.cheekLeft], landmarks[l.cheekRight]);
  const foreheadWidth = dist(landmarks[l.foreheadLeft], landmarks[l.foreheadRight]);
  const faceLength = dist(landmarks[l.foreheadTop], landmarks[l.chin]);

  const jawAngleDeg = angleAt(
    landmarks[l.chin],
    landmarks[l.jawCurveLeft],
    landmarks[l.jawCurveRight]
  );

  return {
    jawToCheek: jawWidth / cheekWidth,
    lengthToWidth: faceLength / cheekWidth,
    foreheadToJaw: foreheadWidth / jawWidth,
    jawAngleDeg,
  };
}

/**
 * Rules-based face shape classification.
 * Thresholds are deliberately explainable (no black-box model) so the UI
 * can show the user *why* a shape was assigned.
 */
export function classifyFaceShape(ratios: FaceRatios): { shape: FaceShape; confidence: number } {
  const { lengthToWidth, jawToCheek, foreheadToJaw, jawAngleDeg } = ratios;

  const scores: Record<FaceShape, number> = {
    oval: 0,
    round: 0,
    square: 0,
    heart: 0,
    diamond: 0,
    oblong: 0,
  };

  // Length vs width
  if (lengthToWidth > 1.55) {
    scores.oblong += 2;
  } else if (lengthToWidth < 1.3) {
    scores.round += 2;
    scores.square += 1;
  } else {
    scores.oval += 1;
  }

  // Jaw vs cheekbone width
  if (jawToCheek > 0.95) {
    scores.square += 2;
    scores.round += 1;
  } else if (jawToCheek < 0.75) {
    scores.heart += 2;
    scores.diamond += 1;
  } else {
    scores.oval += 1;
  }

  // Forehead vs jaw width
  if (foreheadToJaw > 1.15) {
    scores.heart += 2;
  } else if (foreheadToJaw < 0.85) {
    scores.diamond += 2;
  } else {
    scores.oval += 1;
    scores.round += 1;
  }

  // Jaw angle: sharper (lower degrees) = more angular jaw
  if (jawAngleDeg < 115) {
    scores.square += 2;
    scores.diamond += 1;
  } else if (jawAngleDeg > 140) {
    scores.round += 2;
    scores.oval += 1;
  }

  const entries = Object.entries(scores) as [FaceShape, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const [topShape, topScore] = entries[0];
  const totalScore = entries.reduce((sum, [, v]) => sum + v, 0) || 1;
  const confidence = Math.min(0.95, topScore / totalScore);

  return { shape: topShape, confidence };
}

/**
 * Very lightweight skin tone bucketing from average pixel color at
 * cheek/forehead sample points. This estimates depth (fair/medium/deep)
 * and warmth (cool/warm) — NOT texture (oily/dry), which is intentionally
 * left to a self-reported quiz question (see OccasionQuiz).
 */
export function classifySkinTone(rgbSamples: [number, number, number][]): SkinTone {
  const avg = rgbSamples.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0]
  ).map((v) => v / rgbSamples.length) as [number, number, number];

  const [r, g, b] = avg;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  // Warm skin tends toward higher R relative to B (yellow/red undertone);
  // cool skin tends toward higher B relative to R (pink/blue undertone).
  const warmth = r - b;

  const depth: "fair" | "medium" | "deep" = luminance > 190 ? "fair" : luminance > 120 ? "medium" : "deep";
  const undertone: "warm" | "cool" = warmth > 8 ? "warm" : "cool";

  return `${depth}-${undertone}` as SkinTone;
}

export function analyzeFace(
  landmarks: Point[],
  rgbSamples: [number, number, number][],
  textureVariance: number
): FaceAnalysisResult {
  const ratios = computeFaceRatios(landmarks);
  const { shape, confidence } = classifyFaceShape(ratios);
  const skinTone = classifySkinTone(rgbSamples);
  const { ageGroup, confidence: ageConfidence } = classifyAgeGroup(textureVariance);
  return { shape, ratios, skinTone, confidence, estimatedAgeGroup: ageGroup, ageConfidence };
}
