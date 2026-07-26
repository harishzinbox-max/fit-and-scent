import type { BodyRatios, BodyBuild, BodyAnalysisResult } from "./types";

/**
 * MediaPipe PoseLandmarker (33-point BlazePose) landmark indices used here.
 * Reference: https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/pose.md
 */
export const POSE_LANDMARKS = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftHip: 23,
  rightHip: 24,
} as const;

interface Point {
  x: number;
  y: number;
}

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function computeBodyRatios(landmarks: Point[]): BodyRatios {
  const p = POSE_LANDMARKS;
  const shoulderWidth = dist(landmarks[p.leftShoulder], landmarks[p.rightShoulder]);
  const hipWidth = dist(landmarks[p.leftHip], landmarks[p.rightHip]);
  return { shoulderToHip: shoulderWidth / hipWidth };
}

/**
 * Rules-based body build classification from shoulder:hip proportion.
 *
 * Honest limitation: pose landmarks give us shoulder and hip width reliably,
 * but there is no waist landmark in the 33-point model. That means we can
 * confidently detect "shoulders clearly wider" (inverted-triangle) and "hips
 * clearly wider" (pear) — but when shoulders and hips are close in width, we
 * cannot distinguish rectangle vs. hourglass vs. apple from this photo alone,
 * since that distinction hinges on waist definition. In that ambiguous middle
 * zone we default to "rectangle" and flag low confidence so the UI can invite
 * the user to correct it — the same explain-and-let-them-correct pattern used
 * for face shape.
 */
export function classifyBodyBuild(ratios: BodyRatios): { build: BodyBuild; confidence: number } {
  const { shoulderToHip } = ratios;

  if (shoulderToHip > 1.12) {
    const confidence = Math.min(0.9, 0.5 + (shoulderToHip - 1.12) * 2);
    return { build: "inverted-triangle", confidence };
  }

  if (shoulderToHip < 0.9) {
    const confidence = Math.min(0.9, 0.5 + (0.9 - shoulderToHip) * 2);
    return { build: "pear", confidence };
  }

  // Ambiguous middle zone — shoulders and hips are proportionate.
  // Confidence is deliberately low here since we can't see waist definition.
  const distanceFromBalanced = Math.abs(1.0 - shoulderToHip);
  const confidence = Math.max(0.2, 0.4 - distanceFromBalanced);
  return { build: "rectangle", confidence };
}

export function analyzeBody(landmarks: Point[]): BodyAnalysisResult {
  const ratios = computeBodyRatios(landmarks);
  const { build, confidence } = classifyBodyBuild(ratios);
  return { build, ratios, confidence, autoDetected: true };
}