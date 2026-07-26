"use client";

import { useEffect, useState } from "react";
import type { BodyAnalysisResult } from "@/lib/types";
import { analyzeBody } from "@/lib/bodyAnalysis";

interface Props {
  image: HTMLImageElement;
  onResult: (result: BodyAnalysisResult) => void;
}

type Status = "loading-model" | "detecting" | "done" | "error";

export default function BodyScanner({ image, onResult }: Props) {
  const [status, setStatus] = useState<Status>("loading-model");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
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
            "No body detected. Try a photo with your full upper body visible, standing facing the camera."
          );
        }

        const landmarks = result.landmarks[0].map((p) => ({ x: p.x * image.width, y: p.y * image.height }));
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
      {status !== "done" && status !== "error" && (
        <p className="scanner-status">
          {status === "loading-model" ? "Loading the body-pose model…" : "Reading your shoulder and hip proportions…"}
        </p>
      )}
      {status === "error" && <p className="scanner-error">{error}</p>}
    </div>
  );
}