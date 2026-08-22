"use client";

import { useState } from "react";
import type { QuizAnswers, BodyBuild, Gender, AgeGroup, FaceShape } from "@/lib/types";
import {
  WOMEN_WEAR_OPTIONS,
  MEN_WEAR_OPTIONS,
  recommendWearPreference,
  type WearPreference,
} from "@/lib/rules/appropriatenessCheck";
import { WOMEN_HAIRSTYLE_OPTIONS, MEN_HAIRSTYLE_OPTIONS } from "@/lib/rules/hairstyleOptions";
import { recommendHairstyleValue } from "@/lib/rules/hairstyleFit";
import { WOMEN_ACCESSORY_OPTIONS, MEN_ACCESSORY_OPTIONS, recommendAccessoryValues } from "@/lib/rules/accessoryRules";
import HairstyleIcon from "./HairstyleIcon";

interface Props {
  faceShape: FaceShape;
  detectedBodyBuild: BodyBuild;
  detectedConfidence: number;
   onSubmit: (answers: QuizAnswers) => void;
}

function getOccasions(gender: Gender): { value: QuizAnswers["occasion"]; label: string }[] {
  return [
    { value: "office", label: "Office" },
    { value: "wedding-guest", label: "Wedding guest" },
    { value: "date-night", label: "Date night" },
    { value: "festival", label: "Festival" },
    { value: "casual-day", label: "Casual day out" },
    { value: "formal-evening", label: "Formal evening" },
    { value: "indian-wedding", label: gender === "male" ? "Indian Bridegroom" : "Indian Bride" },
  ];
}

const BODY_BUILD_LABEL: Record<BodyBuild, string> = {
  rectangle: "Rectangle",
  hourglass: "Hourglass",
  pear: "Pear",
  apple: "Apple",
  "inverted-triangle": "Inverted triangle",
};

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
  faceShape,
  detectedBodyBuild,
  detectedConfidence,
  onSubmit,
}: Props) {
  const [gender, setGender] = useState<Gender>("female");
  const [occasion, setOccasion] = useState<QuizAnswers["occasion"]>("office");
  const [season, setSeason] = useState<QuizAnswers["season"]>("year-round");
  const [scentFamily, setScentFamily] = useState<QuizAnswers["scentFamily"]>("no-preference");
  const [timeOfDay, setTimeOfDay] = useState<QuizAnswers["timeOfDay"]>("day");
  const bodyBuild = detectedBodyBuild; // auto-detected only, no manual override
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("26-40");

  const OCCASIONS = getOccasions(gender);

  const wearOptions = gender === "male" ? MEN_WEAR_OPTIONS : WOMEN_WEAR_OPTIONS;
  const [wearPreference, setWearPreference] = useState<WearPreference>(wearOptions[0].value);
  const hairOptions = gender === "male" ? MEN_HAIRSTYLE_OPTIONS : WOMEN_HAIRSTYLE_OPTIONS;
  const [hairPreference, setHairPreference] = useState<string>(() =>
    recommendHairstyleValue(gender, faceShape)
  );
  const accessoryOptions = gender === "male" ? MEN_ACCESSORY_OPTIONS : WOMEN_ACCESSORY_OPTIONS;
  const [accessoryPreferences, setAccessoryPreferences] = useState<string[]>([]);

  function toggleAccessory(value: string) {
    setAccessoryPreferences((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  const isLowConfidence = detectedConfidence < 0.45;
  
  function handleGenderChange(next: Gender) {
    setGender(next);
    const nextOptions = next === "male" ? MEN_WEAR_OPTIONS : WOMEN_WEAR_OPTIONS;
    setWearPreference(nextOptions[0].value);
    setHairPreference(recommendHairstyleValue(next, faceShape));
    setAccessoryPreferences([]);
  }

  function handleToolRecommendWear() {
    setWearPreference(recommendWearPreference(gender, occasion, timeOfDay, season));
  }

  function handleToolRecommendHair() {
    setHairPreference(recommendHairstyleValue(gender, faceShape));
  }

  function handleToolRecommendAccessories() {
    setAccessoryPreferences(recommendAccessoryValues(gender, occasion));
  }

  return (
    <form
      className="quiz"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ occasion, season, scentFamily, timeOfDay, bodyBuild, gender, ageGroup, wearPreference, hairPreference, accessoryPreferences });
      }}
    >
      <span className="upload-mark">03</span>
      <h2 className="quiz-title">A few details</h2>

      <div className="quiz-field">
        <span>Gender</span>
        <div className="accessory-picker" style={{ flexWrap: "wrap", gap: "0.6rem" }}>
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
<span>Age group</span>
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
        <p className="rec-headline" style={{ marginTop: "0.25rem" }}>{BODY_BUILD_LABEL[bodyBuild]}</p>
        {isLowConfidence && (
          <p className="rec-sub" style={{ marginTop: "-0.25rem" }}>
            Your shoulders and hips look proportionate, so we couldn&apos;t tell if you have a defined waist from
            this photo — we&apos;ve used Rectangle as the closest general fit.
          </p>
        )}
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
          <button type="button" className="chip" onClick={handleToolRecommendWear}>
            ✨ Tool Recommendation
          </button>
        </div>
      </div>

      <div className="quiz-field">
        <span>Which accessories would you like?</span>
        <div className="accessory-picker">
          {accessoryOptions.map((a) => (
            <button
              type="button"
              key={a.value}
              className={`chip ${accessoryPreferences.includes(a.value) ? "chip-active" : ""}`}
              onClick={() => toggleAccessory(a.value)}
            >
              {a.label}
            </button>
          ))}
        </div>
        <button type="button" className="chip" style={{ marginTop: "0.5rem" }} onClick={handleToolRecommendAccessories}>
          ✨ Tool Recommendation
        </button>
      </div>

      <div className="quiz-field">
        <span>How would you like your hair?</span>
        <div className="accessory-picker" style={{ flexWrap: "wrap", gap: "0.6rem" }}>
          {hairOptions.map((h) => (
            <button
              type="button"
              key={h.value}
              className={`chip ${hairPreference === h.value ? "chip-active" : ""}`}
              onClick={() => setHairPreference(h.value)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", padding: "0.6rem" }}
            >
              <HairstyleIcon styleKey={h.icon} size={40} />
              {h.label}
            </button>
          ))}
        </div>
        <button type="button" className="chip" style={{ marginTop: "0.5rem" }} onClick={handleToolRecommendHair}>
          ✨ Tool Recommendation
        </button>
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
