"use client";

import { useState } from "react";
import type { FaceAnalysisResult, QuizAnswers } from "@/lib/types";
import { recommendDress } from "@/lib/rules/dressRules";
import { recommendMenswear } from "@/lib/rules/menswearRules";
import { buildWomenHairstyleFromPreference } from "@/lib/rules/womenHairstyleRules";
import { buildMenHairstyleFromPreference } from "@/lib/rules/menHairstyleRules";
import { checkHairstyleFit } from "@/lib/rules/hairstyleFit";
import { recommendFragrance } from "@/lib/rules/fragranceRules";
import { checkAppropriateness, wearLabel, type WearPreference } from "@/lib/rules/appropriatenessCheck";
import { checkAccessoryFit } from "@/lib/rules/accessoryRules";
import { recommendFootwear } from "@/lib/rules/footwearRules";
import { buildShoppingLinks, buildMyntraLink, buildSalonLink } from "@/lib/affiliateLinks";
import GeneratedLook from "./GeneratedLook";

interface Props {
  image: HTMLImageElement;
  bodyImage: HTMLImageElement;
  landmarks: { x: number; y: number }[];
  faceResult: FaceAnalysisResult;
  answers: QuizAnswers;
}

const WEAR_SHOP_TERM: Record<WearPreference, string> = {
  dress: "dress",
  saree: "saree",
  "salwar-kameez": "salwar kameez",
    lehenga: "bridal lehenga",
  "sherwani-groom": "groom sherwani",
  "western-separates": "top and trousers",
  gown: "gown",
  "shirt-trouser": "shirt and trousers",
  kurta: "kurta",
  suit: "suit",
  "ethnic-set": "ethnic set sherwani",
  "casual-tee-jeans": "t-shirt and jeans",
};

type Tab = "outfit" | "hair" | "fragrance";

function ShopChips({ term, gendered = true, gender }: { term: string; gendered?: boolean; gender?: "male" | "female" }) {
  const q = gendered && gender ? `${gender === "male" ? "men's" : "women's"} ${term}` : term;
  return (
    <div className="accessory-picker">
      {buildShoppingLinks(q).map((link) => (
        <a key={link.source} href={link.url} target="_blank" rel="noopener noreferrer sponsored" className="chip">
          {link.label}
        </a>
      ))}
      <a href={buildMyntraLink(q).url} target="_blank" rel="noopener noreferrer sponsored" className="chip">
        Shop on Myntra
      </a>
    </div>
  );
}

export default function RecommendationResults({ image, bodyImage, faceResult, answers }: Props) {
  const wearPreference = answers.wearPreference as WearPreference;
  const appropriateness = checkAppropriateness(wearPreference, answers.occasion, answers.gender);
  const [keepOriginalChoice, setKeepOriginalChoice] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("outfit");
  const [hasGenerated, setHasGenerated] = useState(false);
  const categoryOverride =
    appropriateness.appropriate || keepOriginalChoice ? wearLabel(wearPreference) : undefined;

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
  const footwear = recommendFootwear(answers.gender, answers.occasion, answers.season, answers.timeOfDay, wearPreference);

  return (
    <div className="results">
      <span className="upload-mark">03</span>
      <h2 className="quiz-title">Your look, explained</h2>

      <div className="results-grid bleed">
        <div className="results-photo-col sticky-panel">
<GeneratedLook
  image={image}
  bodyImage={bodyImage}
  dressPrompt={dressPrompt}
  hairPrompt={hairPrompt}
  gender={answers.gender}
  occasion={answers.occasion}
  outfitSummary={outfit.silhouette}
  hairstyleSummary={hairstyle.style}
  fragranceSummary={`${fragrance.family} — ${fragrance.exampleNotes}`}
  accessorySummary={accessorySummary}
  footwearSummary={footwear.type}
  onResult={(result) => setHasGenerated(!!result)}
/>
        </div>

        <div className="results-cards">
          {!appropriateness.appropriate && (
            <div className="preference-banner">
              {appropriateness.reasoning.map((r, i) => (
                <p key={i} className="rec-sub">
                  {r}
                </p>
              ))}
              <div className="accessory-picker" style={{ marginTop: "0.6rem" }}>
                <button
                  type="button"
                  className={`chip ${!keepOriginalChoice ? "chip-active" : ""}`}
                  onClick={() => setKeepOriginalChoice(false)}
                >
                  Use the suggested outfit
                </button>
                <button
                  type="button"
                  className={`chip ${keepOriginalChoice ? "chip-active" : ""}`}
                  onClick={() => setKeepOriginalChoice(true)}
                >
                  Keep my original pick
                </button>
              </div>
            </div>
          )}

          <p className="tab-intro">Your full look, in 3 parts — tap through</p>
          <div className="tab-row">
            <button
              type="button"
              className={`tab-button ${activeTab === "outfit" ? "tab-button-active" : ""}`}
              onClick={() => setActiveTab("outfit")}
            >
              👗 Outfit
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === "hair" ? "tab-button-active" : ""}`}
              onClick={() => setActiveTab("hair")}
            >
              💇 Hair &amp; Face
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === "fragrance" ? "tab-button-active" : ""}`}
              onClick={() => setActiveTab("fragrance")}
            >
              🌸 Fragrance
            </button>
          </div>

          {activeTab === "outfit" && (
            <div className="tab-panel">
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
                <h3>Accessories</h3>
                <p className="rec-headline">{accessoryFit.chosenLabel}</p>
                <ul className="rec-reasoning">
                  {accessoryFit.reasoning.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </section>

              <section className="rec-card">
                <h3>Footwear</h3>
                <p className="rec-headline">{footwear.type}</p>
                <ul className="rec-reasoning">
                  {footwear.reasoning.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {activeTab === "hair" && (
            <div className="tab-panel">
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
            </div>
          )}

          {activeTab === "fragrance" && (
            <div className="tab-panel">
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
          )}

          <div className="tab-dots">
            <span className={`tab-dot ${activeTab === "outfit" ? "tab-dot-active" : ""}`} />
            <span className={`tab-dot ${activeTab === "hair" ? "tab-dot-active" : ""}`} />
            <span className={`tab-dot ${activeTab === "fragrance" ? "tab-dot-active" : ""}`} />
          </div>
        </div>

        {hasGenerated && (
          <div className="shop-rail">
            <div className="shop-rail-card">
              <h4>👗 Outfit</h4>
              <ShopChips term={WEAR_SHOP_TERM[wearPreference]} gender={answers.gender} />
            </div>
            <div className="shop-rail-card">
              <h4>💍 Accessories</h4>
              <ShopChips term={accessorySummary} gender={answers.gender} />
            </div>
            <div className="shop-rail-card">
              <h4>👞 Footwear</h4>
              <ShopChips term={footwear.shopTerm} gendered={false} />
            </div>
            <div className="shop-rail-card">
              <h4>🌸 Fragrance</h4>
              <ShopChips term={`${fragrance.family} perfume`} gendered={false} />
            </div>
            <div className="shop-rail-card">
              <h4>💇 Grooming</h4>
              <div className="accessory-picker">
                
                <a  href={buildSalonLink(`${hairstyle.style} haircut styling`).url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="chip"
                >
                  Book a salon visit
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}