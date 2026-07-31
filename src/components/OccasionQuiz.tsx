"use client";

import { useState } from "react";
import type { QuizAnswers, BodyBuild, Gender, AgeGroup } from "@/lib/types";
import { WOMEN_WEAR_OPTIONS, MEN_WEAR_OPTIONS, type WearPreference } from "@/lib/rules/appropriatenessCheck";
import { WOMEN_HAIRSTYLE_OPTIONS, MEN_HAIRSTYLE_OPTIONS } from "@/lib/rules/hairstyleOptions";

interface Props {
  detectedBodyBuild: BodyBuild;
  detectedConfidence: number;
  detectedAgeGroup: AgeGroup;
  detectedAgeConfidence: number;
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

const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: "18-25", label: "18–25" },
  { value: "26-40", label: "26–40" },
  { value: "41-60", label: "41–60" },
  { value: "60+", label: "60+" },
];

export default function OccasionQuiz({
  detectedBodyBuild,
  detectedConfidence,
  detectedAgeGroup,
  detectedAgeConfidence,
  onSubmit,
}: Props) {
  const [gender, setGender] = useState<Gender>("female");
  const [occasion, setOccasion] = useState<QuizAnswers["occasion"]>("office");
  const [season, setSeason] = useState<QuizAnswers["season"]>("year-round");
  const [scentFamily, setScentFamily] = useState<QuizAnswers["scentFamily"]>("no-preference");
  const [timeOfDay, setTimeOfDay] = useState<QuizAnswers["timeOfDay"]>("day");
  const [bodyBuild, setBodyBuild] = useState<BodyBuild>(detectedBodyBuild);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(detectedAgeGroup);

  const wearOptions = gender === "male" ? MEN_WEAR_OPTIONS : WOMEN_WEAR_OPTIONS;
  const [wearPreference, setWearPreference] = useState<WearPreference>(wearOptions[0].value);
  const hairOptions = gender === "male" ? MEN_HAIRSTYLE_OPTIONS : WOMEN_HAIRSTYLE_OPTIONS;
  const [hairPreference, setHairPreference] = useState<string>(hairOptions[0].value);
  const isLowConfidence = detectedConfidence < 0.45;
  const isAgeLowConfidence = detectedAgeConfidence < 0.4;

  function handleGenderChange(next: Gender) {
    setGender(next);
    const nextOptions = next === "male" ? MEN_WEAR_OPTIONS : WOMEN_WEAR_OPTIONS;
    setWearPreference(nextOptions[0].value);
    const nextHairOptions = next === "male" ? MEN_HAIRSTYLE_OPTIONS : WOMEN_HAIRSTYLE_OPTIONS;
    setHairPreference(nextHairOptions[0].value);
  }

  return (
    <form
      className="quiz"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ occasion, season, scentFamily, timeOfDay, bodyBuild, gender, ageGroup, wearPreference, hairPreference });
      }}
    >
      <span className="upload-mark">03</span>
      <h2 className="quiz-title">A few details</h2>

      <div className="quiz-field">
        <span>Gender</span>
        <div className="accessory-picker">
          {GENDERS.map((g) => (
            <button
              type="button"
              key={g.value}
              className={`chip ${gender === g.value ? "chip-active" : ""}`}
              onClick={() => handleGenderChange(g.value)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-field">
        <span>
          Age group{" "}
          <span className="rec-confidence" style={{ display: "inline" }}>
            (our guess from your photo — tap to correct it)
          </span>
        </span>
        {isAgeLowConfidence && (
          <p className="rec-sub" style={{ marginTop: "-0.25rem" }}>
            We couldn&apos;t read your age range confidently from this photo — please confirm the right one below.
          </p>
        )}
        <div className="accessory-picker">
          {AGE_GROUPS.map((a) => (
            <button
              type="button"
              key={a.value}
              className={`chip ${ageGroup === a.value ? "chip-active" : ""}`}
              onClick={() => setAgeGroup(a.value)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

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

      <div className="quiz-field">
        <span>What would you like to wear?</span>
        <div className="accessory-picker">
          {wearOptions.map((w) => (
            <button
              type="button"
              key={w.value}
              className={`chip ${wearPreference === w.value ? "chip-active" : ""}`}
              onClick={() => setWearPreference(w.value)}
            >
              {w.label}
            </button>
          ))}
        </div>
        <div className="quiz-field">
        <span>How would you like your hair?</span>
        <div className="accessory-picker">
          {hairOptions.map((h) => (
            <button
              type="button"
              key={h.value}
              className={`chip ${hairPreference === h.value ? "chip-active" : ""}`}
              onClick={() => setHairPreference(h.value)}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>
      </div>

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