"use client";

import { useEffect, useRef, useState } from "react";
import type { BodyAnalysisResult } from "@/lib/types";
import { analyzeBody } from "@/lib/bodyAnalysis";

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
  "We're only catching a glimpse of you! Step back so your upper body fits in frame. 📸",
  "This photo's giving 'mystery guest.' Make sure more of you is visible and try again. 🕵️",
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

  // Only reject if the detected body is genuinely tiny relative to the photo
  // (subject far away / zoomed way out). Heads/feet naturally sit near the
  // top/bottom edges in normal full-body shots, so we don't check edges here.
  if (boxWidth < image.width * 0.08 || boxHeight < image.height * 0.2) {
    return false;
  }

  return true;
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
        const canvas = canvasRef.current ?? document.createElement("canvas");
        const brightness = sampleBrightness(image, canvas);

        if (brightness < 55) {
          const msg = DARK_PHOTO_MESSAGES[Math.floor(Math.random() * DARK_PHOTO_MESSAGES.length)];
          throw new Error(msg);
        }

        setStatus("loading-model");
        const { PoseLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );

        const poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "IMAGE",
          numPoses: 1,
        });

        if (cancelled) return;
        setStatus("detecting");

        const result = poseLandmarker.detect(image);
        poseLandmarker.close();

        if (!result.landmarks || result.landmarks.length === 0) {
          throw new Error(
            "We couldn't quite make you out — try a photo with your full upper body visible, standing facing the camera. 🙂"
          );
        }

        const landmarks = result.landmarks[0].map((p) => ({ x: p.x * image.width, y: p.y * image.height }));

        if (!checkFraming(landmarks, image)) {
          const msg = FRAME_MESSAGES[Math.floor(Math.random() * FRAME_MESSAGES.length)];
          throw new Error(msg);
        }

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