"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";
import FaceScanner from "@/components/FaceScanner";
import BodyScanner from "@/components/BodyScanner";
import OccasionQuiz from "@/components/OccasionQuiz";
import RecommendationResults from "@/components/RecommendationResults";
import LoginForm from "@/components/LoginForm";
import { supabase } from "@/lib/supabaseClient";
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

  // undefined = still checking session, null = signed out, string = signed in (email)
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  function resetToUpload() {
    setImage(null);
    setLandmarks([]);
    setFaceResult(null);
    setBodyImage(null);
    setBodyResult(null);
    setAnswers(null);
    setStage("upload");
  }

  return (
    <div className="page">
      <header className="page-header">
        <span className="brand-mark">Fit&nbsp;&amp;&nbsp;Scent</span>
        <p className="brand-tag">A stylist that shows its work — not just a filter.</p>
        <Link href="/wardrobe" className="chip" style={{ display: "inline-block", marginTop: "0.5rem" }}>
         My wardrobe
         </Link>
         
<Link href="/how-it-works" className="chip" style={{ display: "inline-block", marginTop: "0.5rem", marginLeft: "0.5rem" }}>
 How it works
 </Link>
 <Link href="/guides" className="chip" style={{ display: "inline-block", marginTop: "0.5rem", marginLeft: "0.5rem" }}>
 Guides
 </Link>
      </header>

      <main className="page-main">
        {stage === "upload" && (
          userEmail === undefined ? (
            <p className="credits-badge">Checking your account…</p>
          ) : userEmail === null ? (
            <div>
              <p className="credits-badge" style={{ marginBottom: "0.9rem" }}>
                Sign in to get started with your free AI makeover
              </p>
              <LoginForm />
            </div>
          ) : (
            <PhotoUpload
              stepNumber="01"
              title="Add a front-facing photo"
              hint="Even lighting, face centered, no sunglasses."
              previewAlt="Uploaded portrait"
              guideType="face"
              onImageReady={(img) => {
                setImage(img);
                setStage("scanning");
              }}
            />
          )
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
            guideType="body"
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
            onSubmit={(a) => {
              setAnswers(a);
              setStage("results");
            }}
          />
        )}

{stage === "results" && image && faceResult && answers && bodyImage && (
  <>
    <button
      type="button"
      className="chip"
      style={{ marginBottom: "1rem" }}
      onClick={resetToUpload}
    >
      ← Back to My Stylist
    </button>
    <RecommendationResults
      image={image}
      bodyImage={bodyImage}
      landmarks={landmarks}
      faceResult={faceResult}
      answers={answers}
    />
  </>
)}
      </main>

      <footer className="page-footer">
        <p>Face-shape, skin-tone, and body-build reading happens on your device. Nothing is uploaded to a server.</p>
      </footer>
    </div>
  );
}
