"use client";

import { useEffect, useRef, useState } from "react";
import type { FaceAnalysisResult } from "@/lib/types";
import { analyzeFace, LANDMARKS } from "@/lib/faceAnalysis";

interface Props {
  image: HTMLImageElement;
  onResult: (result: FaceAnalysisResult, landmarks: { x: number; y: number }[]) => void;
}

type Status = "loading-model" | "detecting" | "done" | "error";

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export default function FaceScanner({ image, onResult }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("loading-model");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
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
          throw new Error("No face detected. Try a clearer, front-facing photo.");
        }

        const landmarks = result.faceLandmarks[0].map((p) => ({ x: p.x * image.width, y: p.y * image.height }));

        // Sample skin tone from cheek/forehead points, avoiding eyes/lips.
        const canvas = canvasRef.current!;
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(image, 0, 0);

        const sampleIdx = [LANDMARKS.cheekSampleLeft, LANDMARKS.cheekSampleRight, LANDMARKS.foreheadSample];
        const rgbSamples: [number, number, number][] = sampleIdx.map((idx) => {
          const { x, y } = landmarks[idx];
          const [r, g, b] = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
          return [r, g, b];
        });

        // Texture variance for age estimation: sample a small pixel patch
        // around each cheek/forehead point rather than a single pixel.
        const patchSize = 7;
        const half = Math.floor(patchSize / 2);
        const luminances: number[] = [];
        sampleIdx.forEach((idx) => {
          const { x, y } = landmarks[idx];
          const startX = Math.max(0, Math.round(x) - half);
          const startY = Math.max(0, Math.round(y) - half);
          const patch = ctx.getImageData(startX, startY, patchSize, patchSize).data;
          for (let i = 0; i < patch.length; i += 4) {
            luminances.push(luminance(patch[i], patch[i + 1], patch[i + 2]));
          }
        });
        const meanLum = luminances.reduce((a, b) => a + b, 0) / luminances.length;
        const textureVariance =
          luminances.reduce((sum, v) => sum + (v - meanLum) ** 2, 0) / luminances.length;

        console.log("DEBUG textureVariance:", textureVariance);
          const analysis = analyzeFace(landmarks, rgbSamples, textureVariance);
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
        <p className="scanner-status">
          {status === "loading-model" ? "Loading the face-landmark model…" : "Reading your face structure…"}
        </p>
      )}
      {status === "error" && <p className="scanner-error">{error}</p>}
    </div>
  );
}
