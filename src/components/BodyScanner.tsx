"use client";

import { useEffect, useRef, useState } from "react";
import type { BodyAnalysisResult } from "@/lib/types";
import { analyzeBody } from "@/lib/bodyAnalysis";
import { checkForMissingLowerImage, checkFullBodyPose } from "@/lib/fullBodyPhotoValidation";

interface Props {
  image: HTMLImageElement;
  onResult: (result: BodyAnalysisResult) => void;
}
type Status = "loading-model" | "detecting" | "done" | "error";
const LOADING_MODEL_MESSAGES = [
  "Waking up the styling engine…",
  "Warming up your virtual mirror…",
  "Getting our eye for fashion ready…",
];
const DETECTING_MESSAGES = [
  "Scanning your silhouette…",
  "Reading your proportions…",
  "Mapping your best angles…",
];
const DARK_PHOTO_MESSAGES = [
  "It's giving 'eclipse,' not 'photo shoot.' A bit more light, please! 🔦",
  "We looked... and saw mostly vibes. Brighten it up and try again! ✨",
  "Even our AI needs SOME light to work its magic. Let's try that again. 💡",
];
const FRAME_MESSAGES = [
  "We're only catching a glimpse of you! Step back so your entire body fits in frame. 📸",
  "Make sure your head, both legs and feet are visible and try again. 🕵️",
];

function sampleBrightness(image: HTMLImageElement, canvas: HTMLCanvasElement): number {
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not analyze the photograph.");
  ctx.drawImage(image, 0, 0);
  const cols = 12, rows = 12;
  let total = 0, count = 0;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = Math.min(image.naturalWidth - 1, Math.floor((image.naturalWidth / cols) * (i + 0.5)));
      const y = Math.min(image.naturalHeight - 1, Math.floor((image.naturalHeight / rows) * (j + 0.5)));
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
      total += 0.299 * r + 0.587 * g + 0.114 * b;
      count++;
    }
  }
  return total / count;
}

export default function BodyScanner({ image, onResult }: Props) {
  const [status, setStatus] = useState<Status>("loading-model");
  const [error, setError] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (status === "done" || status === "error") return;
    setMessageIndex(0);
    const interval = setInterval(() => {
      const pool = status === "loading-model" ? LOADING_MODEL_MESSAGES : DETECTING_MESSAGES;
      setMessageIndex((i) => (i + 1) % pool.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const check = checkForMissingLowerImage(image, image.naturalWidth, image.naturalHeight);
        if (!check.ok) throw new Error(check.reason);

        const canvas = canvasRef.current ?? document.createElement("canvas");
        const brightness = sampleBrightness(image, canvas);
        if (brightness < 55) {
          throw new Error(DARK_PHOTO_MESSAGES[Math.floor(Math.random() * DARK_PHOTO_MESSAGES.length)]);
        }

        setStatus("loading-model");
        const { PoseLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        const poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "IMAGE",
          numPoses: 1,
        });
        if (cancelled) {
          poseLandmarker.close();
          return;
        }
        setStatus("detecting");
        let result;
        try {
          result = poseLandmarker.detect(image);
        } finally {
          poseLandmarker.close();
        }
        if (!result.landmarks?.length) {
          throw new Error("We couldn't identify your full body. Please use a well-lit, head-to-toe photograph facing the camera.");
        }

        const pose = result.landmarks[0];
        const fullBodyCheck = checkFullBodyPose(pose);
        if (!fullBodyCheck.ok) {
          throw new Error(fullBodyCheck.reason ?? FRAME_MESSAGES[Math.floor(Math.random() * FRAME_MESSAGES.length)]);
        }

        const landmarks = pose.map((p) => ({
          x: p.x * image.naturalWidth,
          y: p.y * image.naturalHeight,
        }));
        const analysis = analyzeBody(landmarks);
        if (cancelled) return;
        setStatus("done");
        onResult(analysis);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Body analysis failed.");
        setStatus("error");
      }
    }
    void run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  return (
    <div className="scanner">
      <canvas ref={canvasRef} className="sr-only" />
      {status !== "done" && status !== "error" && (
        <div className="scanner-loading">
          <div className="generating-spinner" />
          <p className="scanner-status">
            {status === "loading-model" ? LOADING_MODEL_MESSAGES[messageIndex] : DETECTING_MESSAGES[messageIndex]}
          </p>
        </div>
      )}
      {status === "error" && <p className="scanner-error" role="alert">{error}</p>}
    </div>
  );
}
