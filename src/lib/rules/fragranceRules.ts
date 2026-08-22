import type { FragranceRecommendation, Occasion, Season, QuizAnswers } from "../types";

const OCCASION_INTENSITY: Record<Occasion, string> = {
  office: "light, close-to-skin sillage — avoid overwhelming shared spaces",
  "wedding-guest": "moderate sillage that lasts through a long event",
  "date-night": "moderate-to-strong, designed to be noticed up close",
  festival: "light and fresh — layered with heat and crowds in mind",
  "casual-day": "light, easy sillage for everyday wear",
  "formal-evening": "strong, rich sillage that holds up after dark",
  "indian-wedding": "strong, rich, and long-lasting — traditional celebrations run long and call for real staying power",
  "indian-traditional": "moderate, warm sillage suited to long traditional ceremonies and gatherings",
  hawaiian: "light, fresh, and breezy — matches a relaxed tropical setting",
  "formal-suit-tie": "refined, moderate sillage appropriate for formal business or black-tie settings",
};

const SEASON_FAMILY_BIAS: Record<Season, string[]> = {
  "spring-summer": ["fresh", "floral"],
  "autumn-winter": ["woody", "oriental"],
  "year-round": ["fresh", "woody", "floral", "oriental"],
};

const FAMILY_NOTES: Record<string, string> = {
  fresh: "citrus, aquatic, or green top notes (e.g. bergamot, sea salt, mint)",
  floral: "rose, jasmine, or white florals with a soft musk base",
  woody: "sandalwood, cedar, or vetiver with a warm amber base",
  oriental: "vanilla, amber, spice, and resin for depth and warmth",
};

export function recommendFragrance(answers: QuizAnswers): FragranceRecommendation {
  const { occasion, season, scentFamily, timeOfDay } = answers;

  const seasonalFamilies = SEASON_FAMILY_BIAS[season];
  const family =
    scentFamily !== "no-preference" && seasonalFamilies.includes(scentFamily)
      ? scentFamily
      : seasonalFamilies[timeOfDay === "evening" ? seasonalFamilies.length - 1 : 0];

  const intensity = OCCASION_INTENSITY[occasion];

  const reasoning = [
    `Family: ${family} — ${
      scentFamily !== "no-preference" && seasonalFamilies.includes(scentFamily)
        ? "matches your stated preference and suits the season"
        : `defaulted for ${season.replace("-", "/")} since your preference wasn't a seasonal fit`
    }.`,
    `Intensity: ${intensity}.`,
    `Time of day: ${timeOfDay === "evening" ? "evening wear favors richer, longer-lasting compositions" : "daytime favors lighter, closer-wearing compositions"}.`,
  ];

  return {
    family,
    intensity,
    exampleNotes: FAMILY_NOTES[family],
    reasoning,
  };
}
