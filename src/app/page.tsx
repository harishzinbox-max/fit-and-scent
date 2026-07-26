"use client";

import { useState } from "react";
import PhotoUpload from "@/components/PhotoUpload";
import FaceScanner from "@/components/FaceScanner";
import OccasionQuiz from "@/components/OccasionQuiz";
import RecommendationResults from "@/components/RecommendationResults";
import type { FaceAnalysisResult, QuizAnswers } from "@/lib/types";

type Stage = "upload" | "scanning" | "quiz" | "results";

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [landmarks, setLandmarks] = useState<{ x: number; y: number }[]>([]);
  const [faceResult, setFaceResult] = useState<FaceAnalysisResult | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);

  return (
    <div className="page">
      <header className="page-header">
        <span className="brand-mark">Fit&nbsp;&amp;&nbsp;Scent</span>
        <p className="brand-tag">A stylist that shows its work — not just a filter.</p>
      </header>

      <main className="page-main">
        {stage === "upload" && (
          <PhotoUpload
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
              setStage("quiz");
            }}
          />
        )}

        {stage === "quiz" && (
          <OccasionQuiz
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
        <p>Face-shape and skin-tone reading happens on your device. Nothing is uploaded to a server.</p>
      </footer>
    </div>
  );
}
