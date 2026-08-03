"use client";

import { useState } from "react";
import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";
import FaceScanner from "@/components/FaceScanner";
import BodyScanner from "@/components/BodyScanner";
import OccasionQuiz from "@/components/OccasionQuiz";
import RecommendationResults from "@/components/RecommendationResults";
import type { FaceAnalysisResult, BodyAnalysisResult, QuizAnswers } from "@/lib/types";

type Stage = "upload" | "scanning" | "body-upload" | "body-scanning" | "quiz" | "results";

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [landmarks, setLandmarks] = useState<{ x: number; y: number }[]>([]);
  const [faceResult, setFaceResult] = useState<FaceAnalysisResult | null>(null);
  const [bodyImage, setBodyImage] = useState<HTMLImageElement | null>(null);
  const [bodyResult, setBodyResult] = useState<BodyAnalysisResult | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);

  return (
    <div className="page">
      <header className="page-header">
        <span className="brand-mark">Fit&nbsp;&amp;&nbsp;Scent</span>
        <p className="brand-tag">A stylist that shows its work — not just a filter.</p>
        <Link href="/wardrobe" className="chip" style={{ display: "inline-block", marginTop: "0.5rem" }}>
         My wardrobe
         </Link>
      </header>

      <main className="page-main">
        {stage === "upload" && (
          <PhotoUpload
            stepNumber="01"
            title="Add a front-facing photo"
            hint="Even lighting, face centered, no sunglasses."
            previewAlt="Uploaded portrait"
            onImageReady={(img) => {
              setImage(img);
              setStage("scanning");
            }}
          />
        )}

        {stage === "scanning" && image && (
          <FaceScanner
            image={image}
            onResult={(result, lm) => {
              setFaceResult(result);
              setLandmarks(lm);
              setStage("body-upload");
            }}
          />
        )}

        {stage === "body-upload" && (
          <PhotoUpload
            stepNumber="02"
            title="Add a full-body photo"
            hint="Standing straight, facing the camera, arms slightly away from your body."
            previewAlt="Uploaded full-body photo"
            onImageReady={(img) => {
              setBodyImage(img);
              setStage("body-scanning");
            }}
          />
        )}

        {stage === "body-scanning" && bodyImage && (
          <BodyScanner
            image={bodyImage}
            onResult={(result) => {
              setBodyResult(result);
              setStage("quiz");
            }}
          />
        )}

        {stage === "quiz" && bodyResult && (
          <OccasionQuiz
            faceShape={faceResult?.shape ?? "oval"}
            detectedBodyBuild={bodyResult.build}
            detectedConfidence={bodyResult.confidence}
            detectedAgeGroup={faceResult?.estimatedAgeGroup ?? "26-40"}
            detectedAgeConfidence={faceResult?.ageConfidence ?? 0}
            onSubmit={(a) => {
              setAnswers(a);
              setStage("results");
            }}
          />
        )}

        {stage === "results" && image && faceResult && answers && (
          <RecommendationResults image={image} landmarks={landmarks} faceResult={faceResult} answers={answers} />
        )}
      </main>

      <footer className="page-footer">
        <p>Face-shape, skin-tone, and body-build reading happens on your device. Nothing is uploaded to a server.</p>
      </footer>
    </div>
  );
}