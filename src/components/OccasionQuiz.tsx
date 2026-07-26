"use client";

import { useState } from "react";
import type { QuizAnswers } from "@/lib/types";

interface Props {
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

const BODY_BUILDS: { value: QuizAnswers["bodyBuild"]; label: string }[] = [
  { value: "rectangle", label: "Rectangle — shoulders, waist, hips similar width" },
  { value: "hourglass", label: "Hourglass — shoulders and hips balanced, defined waist" },
  { value: "pear", label: "Pear — hips wider than shoulders" },
  { value: "apple", label: "Apple — fuller through the midsection" },
  { value: "inverted-triangle", label: "Inverted triangle — shoulders wider than hips" },
];

export default function OccasionQuiz({ onSubmit }: Props) {
  const [occasion, setOccasion] = useState<QuizAnswers["occasion"]>("office");
  const [season, setSeason] = useState<QuizAnswers["season"]>("year-round");
  const [scentFamily, setScentFamily] = useState<QuizAnswers["scentFamily"]>("no-preference");
  const [timeOfDay, setTimeOfDay] = useState<QuizAnswers["timeOfDay"]>("day");
  const [bodyBuild, setBodyBuild] = useState<QuizAnswers["bodyBuild"]>("rectangle");

  return (
    <form
      className="quiz"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ occasion, season, scentFamily, timeOfDay, bodyBuild });
      }}
    >
      <span className="upload-mark">02</span>
      <h2 className="quiz-title">A few details</h2>

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
        Body build
        <select value={bodyBuild} onChange={(e) => setBodyBuild(e.target.value as QuizAnswers["bodyBuild"])}>
          {BODY_BUILDS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
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
