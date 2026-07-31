"use client";

import { useState } from "react";
import type { FaceAnalysisResult, QuizAnswers } from "@/lib/types";
import { recommendDress } from "@/lib/rules/dressRules";
import { recommendMenswear } from "@/lib/rules/menswearRules";
import { recommendWomenHairstyle } from "@/lib/rules/womenHairstyleRules";
import { recommendMenHairstyle } from "@/lib/rules/menHairstyleRules";
import { recommendFragrance } from "@/lib/rules/fragranceRules";
import { checkAppropriateness, wearLabel, type WearPreference } from "@/lib/rules/appropriatenessCheck";
import { recommendAccessories } from "@/lib/rules/accessoryRules";
import AccessoryOverlay from "./AccessoryOverlay";
import GeneratedLook from "./GeneratedLook";
import ShopThisLook from "./ShopThisLook";

interface Props {
  image: HTMLImageElement;
  landmarks: { x: number; y: number }[];
  faceResult: FaceAnalysisResult;
  answers: QuizAnswers;
}

const ACCESSORIES = [
  { value: "none", label: "No accessory" },
  { value: "glasses-round", label: "Round glasses" },
  { value: "glasses-square", label: "Square glasses" },
  { value: "earrings", label: "Studs" },
] as const;

export default function RecommendationResults({ image, landmarks, faceResult, answers }: Props) {
  const [accessory, setAccessory] = useState<(typeof ACCESSORIES)[number]["value"]>("none");

  const wearPreference = answers.wearPreference as WearPreference;
  const appropriateness = checkAppropriateness(wearPreference, answers.occasion);
  const categoryOverride = appropriateness.appropriate ? wearLabel(wearPreference) : undefined;

  const outfit =
    answers.gender === "male"
      ? recommendMenswear(faceResult.shape, answers.bodyBuild, answers.occasion, answers.ageGroup, categoryOverride)
      : recommendDress(faceResult.shape, answers.bodyBuild, answers.occasion, answers.ageGroup, categoryOverride);

  const fragrance = recommendFragrance(answers);
  const dressPrompt = `${outfit.silhouette}, with a ${outfit.neckline}`;

  const hairstyle =
    answers.gender === "male"
      ? recommendMenHairstyle(faceResult.shape, answers.occasion)
      : recommendWomenHairstyle(faceResult.shape, answers.occasion);
  const hairPrompt = hairstyle.style;

  const accessories = recommendAccessories(answers.gender, answers.occasion);
  const accessorySummary = accessories.items.join(", ");

  return (
    <div className="results">
      <span className="upload-mark">03</span>
      <h2 className="quiz-title">Your look, explained</h2>

      <div className="results-grid">
        <div className="results-photo-col">
          <AccessoryOverlay image={image} landmarks={landmarks} accessory={accessory} />
          <div className="accessory-picker">
            {ACCESSORIES.map((a) => (
              <button
                key={a.value}
                className={`chip ${accessory === a.value ? "chip-active" : ""}`}
                onClick={() => setAccessory(a.value)}
                type="button"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="results-cards">
          <section className="rec-card">
            <h3>Face &amp; skin reading</h3>
            <p className="rec-headline">
              {faceResult.shape[0].toUpperCase() + faceResult.shape.slice(1)} face ·{" "}
              {faceResult.skinTone.replace("-", ", ")} undertone
            </p>
            <p className="rec-confidence">
              Confidence: {(faceResult.confidence * 100).toFixed(0)}% (from jaw-to-cheek, length-to-width, and
              forehead-to-jaw ratios)
            </p>
          </section>

          {!appropriateness.appropriate && (
            <section className="rec-card">
              <h3>About your preference</h3>
              {appropriateness.reasoning.map((r, i) => (
                <p key={i} className="rec-sub">
                  {r}
                </p>
              ))}
            </section>
          )}

          <section className="rec-card">
            <h3>What to wear</h3>
            <p className="rec-headline">{outfit.silhouette}</p>
            <p className="rec-sub">Neckline: {outfit.neckline}</p>
            <p className="rec-sub rec-avoid">Steer away from: {outfit.avoid}</p>
            <ul className="rec-reasoning">
              {outfit.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>

          <section className="rec-card">
            <h3>Hairstyle</h3>
            <p className="rec-headline">{hairstyle.style}</p>
            <p className="rec-sub rec-avoid">Steer away from: {hairstyle.avoid}</p>
            <ul className="rec-reasoning">
              {hairstyle.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>
<section className="rec-card">
            <h3>Accessories</h3>
            <ul className="rec-reasoning">
              {accessories.items.map((item, i) => (
                <li key={i}>{item}</li>
             ))}
            </ul>
            <p className="rec-sub">{accessories.reasoning[0]}</p>
          </section>
          
          <GeneratedLook
            image={image}
            dressPrompt={dressPrompt}
            hairPrompt={hairPrompt}
            gender={answers.gender}
            occasion={answers.occasion}
            outfitSummary={outfit.silhouette}
            hairstyleSummary={hairstyle.style}
            fragranceSummary={`${fragrance.family} — ${fragrance.exampleNotes}`}
            accessorySummary={accessorySummary}
          />
<ShopThisLook
           searchTerms={[
              { label: "Outfit", term: `${answers.gender === "male" ? "men's" : "women's"} ${outfit.silhouette.split(",")[0]}` },
              { label: "Accessories", term: accessories.items[0] },
              { label: "Fragrance", term: `${fragrance.family} perfume` },
            ]}
          />


          <section className="rec-card">
            <h3>What to wear (scent)</h3>
            <p className="rec-headline">{fragrance.family[0].toUpperCase() + fragrance.family.slice(1)} family</p>
            <p className="rec-sub">{fragrance.exampleNotes}</p>
            <p className="rec-sub">{fragrance.intensity}</p>
            <ul className="rec-reasoning">
              {fragrance.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}