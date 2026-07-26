export type FaceShape =
  | "oval"
  | "round"
  | "square"
  | "heart"
  | "diamond"
  | "oblong";

export type SkinTone = "fair-cool" | "fair-warm" | "medium-cool" | "medium-warm" | "deep-cool" | "deep-warm";

export type BodyBuild = "rectangle" | "hourglass" | "pear" | "apple" | "inverted-triangle";

export interface FaceRatios {
  jawToCheek: number; // jaw width / cheekbone width
  lengthToWidth: number; // face length / face width
  foreheadToJaw: number; // forehead width / jaw width
  jawAngleDeg: number; // curvature at jaw point, lower = more angular
}

export interface FaceAnalysisResult {
  shape: FaceShape;
  ratios: FaceRatios;
  skinTone: SkinTone;
  confidence: number; // 0-1, based on how cleanly ratios matched a bucket
}

export interface BodyRatios {
  shoulderToHip: number; // shoulder width / hip width
}

export interface BodyAnalysisResult {
  build: BodyBuild;
  ratios: BodyRatios;
  confidence: number; // 0-1 — low when shoulder/hip are close (ambiguous without a waist measurement)
  autoDetected: boolean; // false once the user manually overrides the chip
}

export type Occasion =
  | "office"
  | "wedding-guest"
  | "date-night"
  | "festival"
  | "casual-day"
  | "formal-evening";

export type Season = "spring-summer" | "autumn-winter" | "year-round";

export interface QuizAnswers {
  occasion: Occasion;
  season: Season;
  scentFamily: "fresh" | "floral" | "woody" | "oriental" | "no-preference";
  timeOfDay: "day" | "evening";
  bodyBuild: BodyBuild;
}

export interface DressRecommendation {
  silhouette: string;
  neckline: string;
  avoid: string;
  reasoning: string[];
}

export interface FragranceRecommendation {
  family: string;
  intensity: string;
  exampleNotes: string;
  reasoning: string[];
}