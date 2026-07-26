"use client";

import { useState } from "react";
import type { FaceAnalysisResult, QuizAnswers } from "@/lib/types";
import { recommendDress } from "@/lib/rules/dressRules";
import { recommendFragrance } from "@/lib/rules/fragranceRules";
import AccessoryOverlay from "./AccessoryOverlay";
import GeneratedLook from "./GeneratedLook";

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

  const dress = recommendDress(faceResult.shape, answers.bodyBuild, answers.occasion);
  const fragrance = recommendFragrance(answers);
  const dressPrompt = `${dress.silhouette}, with a ${dress.neckline}`;

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

          <section className="rec-card">
            <h3>What to wear</h3>
            <p className="rec-headline">{dress.silhouette}</p>
            <p className="rec-sub">Neckline: {dress.neckline}</p>
            <p className="rec-sub rec-avoid">Steer away from: {dress.avoid}</p>
            <ul className="rec-reasoning">
              {dress.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>

          <GeneratedLook image={image} dressPrompt={dressPrompt} />

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