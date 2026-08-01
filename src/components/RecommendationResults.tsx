"use client";

import type { FaceAnalysisResult, QuizAnswers } from "@/lib/types";
import { recommendDress } from "@/lib/rules/dressRules";
import { recommendMenswear } from "@/lib/rules/menswearRules";
import { buildWomenHairstyleFromPreference } from "@/lib/rules/womenHairstyleRules";
import { buildMenHairstyleFromPreference } from "@/lib/rules/menHairstyleRules";
import { checkHairstyleFit } from "@/lib/rules/hairstyleFit";
import { recommendFragrance } from "@/lib/rules/fragranceRules";
import { checkAppropriateness, wearLabel, type WearPreference } from "@/lib/rules/appropriatenessCheck";
import { checkAccessoryFit } from "@/lib/rules/accessoryRules";
import GeneratedLook from "./GeneratedLook";

interface Props {
  image: HTMLImageElement;
  landmarks: { x: number; y: number }[];
  faceResult: FaceAnalysisResult;
  answers: QuizAnswers;
}

export default function RecommendationResults({ image, faceResult, answers }: Props) {
  const wearPreference = answers.wearPreference as WearPreference;
  const appropriateness = checkAppropriateness(wearPreference, answers.occasion, answers.gender);
  const categoryOverride = appropriateness.appropriate ? wearLabel(wearPreference) : undefined;

  const outfit =
    answers.gender === "male"
      ? recommendMenswear(faceResult.shape, answers.bodyBuild, answers.occasion, answers.ageGroup, categoryOverride)
      : recommendDress(faceResult.shape, answers.bodyBuild, answers.occasion, answers.ageGroup, categoryOverride);

  const fragrance = recommendFragrance(answers);
  const dressPrompt = `${outfit.silhouette}, with a ${outfit.neckline}`;

  const hairstyle =
    answers.gender === "male"
      ? buildMenHairstyleFromPreference(answers.hairPreference, answers.occasion)
      : buildWomenHairstyleFromPreference(answers.hairPreference, answers.occasion);

  const hairstyleFit = checkHairstyleFit(answers.gender, faceResult.shape, answers.hairPreference);
  const hairPrompt = hairstyle.style;

  const accessoryFit = checkAccessoryFit(answers.accessoryPreferences, answers.gender, answers.occasion);
  const accessorySummary = accessoryFit.chosenLabel;

  return (
    <div className="results">
      <span className="upload-mark">03</span>
      <h2 className="quiz-title">Your look, explained</h2>

      <div className="results-grid">
        <div className="results-photo-col">
          <img src={image.src} alt="Your uploaded photo" className="result-photo" />
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
            <ul className="rec-reasoning">
              {hairstyle.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <p className={`rec-sub ${hairstyleFit.verdict === "caution" ? "rec-avoid" : ""}`} style={{ marginTop: "0.4rem" }}>
              {hairstyleFit.reasoning.join(" ")}
            </p>
          </section>

          <section className="rec-card">
            <h3>Accessories</h3>
            <p className="rec-headline">{accessoryFit.chosenLabel}</p>
            <ul className="rec-reasoning">
              {accessoryFit.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
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