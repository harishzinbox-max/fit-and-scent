"use client";

import { useEffect, useRef, useState } from "react";
import type { FaceAnalysisResult } from "@/lib/types";
import { analyzeFace, LANDMARKS } from "@/lib/faceAnalysis";

interface Props {
  image: HTMLImageElement;
  onResult: (result: FaceAnalysisResult, landmarks: { x: number; y: number }[]) => void;
}

type Status = "loading-model" | "detecting" | "done" | "error";

const LOADING_MODEL_MESSAGES = [
  "Waking up the styling engine…",
  "Warming up your virtual mirror…",
  "Getting our eye for fashion ready…",
];

const DETECTING_MESSAGES = [
  "Studying your features…",
  "Reading your face shape…",
  "Finding your best angles…",
];

const DARK_PHOTO_MESSAGES = [
  "It's giving 'eclipse,' not 'headshot.' Try a spot with a bit more light! 🔦",
  "We looked... and saw mostly vibes. Brighten it up and try again! ✨",
  "Even our AI needs SOME light to work its magic. Let's try that again. 💡",
];

const FRAME_MESSAGES = [
  "Looks like you're playing hide and seek with the camera. Center yourself and try again! 📸",
  "We can see... some of you? Step back or move closer so we get the whole picture. 🕵️",
  "This photo's giving 'mystery guest.' Make sure your whole face is in frame!",
];

function sampleBrightness(image: HTMLImageElement, canvas: HTMLCanvasElement): number {
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, 0, 0);

  const cols = 12;
  const rows = 12;
  let total = 0;
  let count = 0;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = Math.round((image.width / cols) * i);
      const y = Math.round((image.height / rows) * j);
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
      total += 0.299 * r + 0.587 * g + 0.114 * b;
      count++;
    }
  }

  return total / count;
}

function checkFraming(landmarks: { x: number; y: number }[], image: HTMLImageElement): boolean {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of landmarks) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const boxWidth = maxX - minX;
  const boxHeight = maxY - minY;

  // Face too small relative to the photo — subject too far away.
  if (boxWidth < image.width * 0.12 || boxHeight < image.height * 0.12) {
    return false;
  }

  // Face touching or past the photo edges — subject cropped/out of frame.
  const margin = 0.015;
  if (
    minX < image.width * margin ||
    maxX > image.width * (1 - margin) ||
    minY < image.height * margin ||
    maxY > image.height * (1 - margin)
  ) {
    return false;
  }

  return true;
}

export default function FaceScanner({ image, onResult }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("loading-model");
  const [error, setError] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

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
        const canvas = canvasRef.current!;
        const brightness = sampleBrightness(image, canvas);

        if (brightness < 55) {
          const msg = DARK_PHOTO_MESSAGES[Math.floor(Math.random() * DARK_PHOTO_MESSAGES.length)];
          throw new Error(msg);
        }

        setStatus("loading-model");
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "IMAGE",
          numFaces: 1,
        });

        if (cancelled) return;
        setStatus("detecting");

        const result = faceLandmarker.detect(image);
        faceLandmarker.close();

        if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
          throw new Error("We couldn't quite spot a face in there — try a clearer, front-facing photo. 🙂");
        }

        const landmarks = result.faceLandmarks[0].map((p) => ({ x: p.x * image.width, y: p.y * image.height }));

        if (!checkFraming(landmarks, image)) {
          const msg = FRAME_MESSAGES[Math.floor(Math.random() * FRAME_MESSAGES.length)];
          throw new Error(msg);
        }

        const ctx = canvas.getContext("2d")!;
        const sampleIdx = [LANDMARKS.cheekSampleLeft, LANDMARKS.cheekSampleRight, LANDMARKS.foreheadSample];
        const rgbSamples: [number, number, number][] = sampleIdx.map((idx) => {
          const { x, y } = landmarks[idx];
          const [r, g, b] = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
          return [r, g, b];
        });

        const analysis = analyzeFace(landmarks, rgbSamples);
        if (cancelled) return;
        setStatus("done");
        onResult(analysis, landmarks);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Face analysis failed.");
        setStatus("error");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
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
      {status === "error" && <p className="scanner-error">{error}</p>}
    </div>
  );
}