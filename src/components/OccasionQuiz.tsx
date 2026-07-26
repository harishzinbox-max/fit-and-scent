"use client";

import { useState } from "react";
import type { QuizAnswers, BodyBuild } from "@/lib/types";

interface Props {
  detectedBodyBuild: BodyBuild;
  detectedConfidence: number;
  onSubmit: (answers: QuizAnswers) => void;
}

const OCCASIONS: { value: QuizAnswers["occasion"]; label: string }[] = [
  { value: "office", label: "Office" },
  { value: "wedding-guest", label: "Wedding guest" },
  { value: "date-night", label: "Date night" },
  { value: "festival", label: "Festival" },
  { value: "casual-day", label: "Casual day out" },
  { value: "formal-evening", label: "Formal evening" },
];

const BODY_BUILDS: { value: BodyBuild; label: string }[] = [
  { value: "rectangle", label: "Rectangle" },
  { value: "hourglass", label: "Hourglass" },
  { value: "pear", label: "Pear" },
  { value: "apple", label: "Apple" },
  { value: "inverted-triangle", label: "Inverted triangle" },
];

export default function OccasionQuiz({ detectedBodyBuild, detectedConfidence, onSubmit }: Props) {
  const [occasion, setOccasion] = useState<QuizAnswers["occasion"]>("office");
  const [season, setSeason] = useState<QuizAnswers["season"]>("year-round");
  const [scentFamily, setScentFamily] = useState<QuizAnswers["scentFamily"]>("no-preference");
  const [timeOfDay, setTimeOfDay] = useState<QuizAnswers["timeOfDay"]>("day");
  const [bodyBuild, setBodyBuild] = useState<BodyBuild>(detectedBodyBuild);

  const isLowConfidence = detectedConfidence < 0.45;

  return (
    <form
      className="quiz"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ occasion, season, scentFamily, timeOfDay, bodyBuild });
      }}
    >
      <span className="upload-mark">03</span>
      <h2 className="quiz-title">A few details</h2>

      <div className="quiz-field">
        <span>
          Body build{" "}
          <span className="rec-confidence" style={{ display: "inline" }}>
            (auto-detected, {(detectedConfidence * 100).toFixed(0)}% confidence)
          </span>
        </span>
        {isLowConfidence && (
          <p className="rec-sub" style={{ marginTop: "-0.25rem" }}>
            Your shoulders and hips look proportionate, so we couldn&apos;t tell if you have a defined waist from
            this photo. We defaulted to Rectangle — tap another option below if that&apos;s not right.
          </p>
        )}
        <div className="accessory-picker">
          {BODY_BUILDS.map((b) => (
            <button
              type="button"
              key={b.value}
              className={`chip ${bodyBuild === b.value ? "chip-active" : ""}`}
              onClick={() => setBodyBuild(b.value)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <label className="quiz-field">
        Occasion
        <select value={occasion} onChange={(e) => setOccasion(e.target.value as QuizAnswers["occasion"])}>
          {OCCASIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="quiz-field">
        Season
        <select value={season} onChange={(e) => setSeason(e.target.value as QuizAnswers["season"])}>
          <option value="spring-summer">Spring / Summer</option>
          <option value="autumn-winter">Autumn / Winter</option>
          <option value="year-round">Year-round</option>
        </select>
      </label>

      <label className="quiz-field">
        Time of day
        <select value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value as QuizAnswers["timeOfDay"])}>
          <option value="day">Day</option>
          <option value="evening">Evening</option>
        </select>
      </label>

      <label className="quiz-field">
        Scent preference
        <select value={scentFamily} onChange={(e) => setScentFamily(e.target.value as QuizAnswers["scentFamily"])}>
          <option value="no-preference">No preference — recommend for me</option>
          <option value="fresh">Fresh / citrus</option>
          <option value="floral">Floral</option>
          <option value="woody">Woody</option>
          <option value="oriental">Oriental / warm spice</option>
        </select>
      </label>

      <button type="submit" className="quiz-submit">
        See my recommendations
      </button>
    </form>
  );
}