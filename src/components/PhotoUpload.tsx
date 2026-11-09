"use client";

import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { checkForMissingLowerImage } from "@/lib/fullBodyPhotoValidation";

interface Props {
  onImageReady: (imageEl: HTMLImageElement) => void;
  stepNumber?: string;
  title?: string;
  hint?: string;
  previewAlt?: string;
  guideType?: "face" | "body";
  confirmLabel?: string;
}

const FRAME_ASPECT: Record<"face" | "body", number> = {
  face: 3 / 4,
  body: 3 / 5,
};

function FaceGuide() {
  return (
    <svg
      className="guide-overlay"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <ellipse cx="50" cy="46" rx="24" ry="32" />
      <line
        x1="20"
        y1="46"
        x2="80"
        y2="46"
        strokeDasharray="3 4"
        opacity="0.5"
      />
    </svg>
  );
}

function BodyGuide() {
  return (
    <svg
      className="guide-overlay"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <ellipse cx="50" cy="14" rx="9" ry="10" />
      <path d="M 30 30 Q 50 24 70 30 L 74 70 Q 50 78 26 70 Z" />
      <line
        x1="10"
        y1="10"
        x2="10"
        y2="92"
        strokeDasharray="3 4"
        opacity="0.4"
      />
      <line
        x1="90"
        y1="10"
        x2="90"
        y2="92"
        strokeDasharray="3 4"
        opacity="0.4"
      />
    </svg>
  );
}

export default function PhotoUpload({
  onImageReady,
  stepNumber = "01",
  title = "Add a front-facing photo",
  hint = "Even lighting, face centered, no sunglasses.",
  previewAlt = "Uploaded photo",
  guideType,
  confirmLabel = "Looks good, continue →",
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const dragState = useRef<{
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);

  const aspect = FRAME_ASPECT[guideType ?? "face"];

  function getDrawnFracs(imgAspect: number, zoomLevel: number) {
    const wFrac = Math.max(1, (1 / aspect) * imgAspect) * zoomLevel;
    const hFrac = Math.max(1, aspect / imgAspect) * zoomLevel;

    return { wFrac, hFrac };
  }

  function clampPan(
    x: number,
    y: number,
    imgAspect: number,
    zoomLevel: number
  ) {
    const { wFrac, hFrac } = getDrawnFracs(imgAspect, zoomLevel);

    const maxX = Math.max(0, wFrac / 2 - 0.5);
    const maxY = Math.max(0, hFrac / 2 - 0.5);

    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }

  function handleFile(file: File) {
    setPhotoError(null);
    trackEvent(
  guideType === "body" ? "body_upload" : "photo_upload"
);
    const url = URL.createObjectURL(file);
    
    setPreview(url);
    setRawImage(null);
    setZoom(1);
    setPanX(0);
    setPanY(0);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (guideType === "body") {
        const checked = checkForMissingLowerImage(img, img.naturalWidth, img.naturalHeight);
        if (!checked.ok) {
          setRawImage(null);
          setPhotoError(checked.reason ?? "Please select a complete full-body photograph.");
          return;
        }
      }
      setRawImage(img);
    };
    img.onerror = () => setPhotoError("Could not read this image. Please try a different JPG or PNG.");
    img.src = url;
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPanX: panX,
      startPanY: panY,
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragState.current || !rawImage || !frameRef.current) return;

    const rect = frameRef.current.getBoundingClientRect();

    const dxFrac =
      (e.clientX - dragState.current.startX) / rect.width;

    const dyFrac =
      (e.clientY - dragState.current.startY) / rect.height;

    const imgAspect =
      rawImage.naturalWidth / rawImage.naturalHeight;

    const clamped = clampPan(
      dragState.current.startPanX + dxFrac,
      dragState.current.startPanY + dyFrac,
      imgAspect,
      zoom
    );

    setPanX(clamped.x);
    setPanY(clamped.y);
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  function handleZoomChange(newZoom: number) {
    if (!rawImage) {
      setZoom(newZoom);
      return;
    }

    const imgAspect =
      rawImage.naturalWidth / rawImage.naturalHeight;

    const clamped = clampPan(
      panX,
      panY,
      imgAspect,
      newZoom
    );

    setZoom(newZoom);
    setPanX(clamped.x);
    setPanY(clamped.y);
  }

  function handleConfirm() {
    if (!rawImage) return;

    const EXPORT_WIDTH = 900;
    const exportHeight = EXPORT_WIDTH / aspect;

    const imgAspect =
      rawImage.naturalWidth / rawImage.naturalHeight;

    const { wFrac, hFrac } =
      getDrawnFracs(imgAspect, zoom);

    const drawnW = EXPORT_WIDTH * wFrac;
    const drawnH = exportHeight * hFrac;

    const drawX =
      EXPORT_WIDTH / 2 -
      drawnW / 2 +
      panX * EXPORT_WIDTH;

    const drawY =
      exportHeight / 2 -
      drawnH / 2 +
      panY * exportHeight;

    const canvas = document.createElement("canvas");

    canvas.width = EXPORT_WIDTH;
    canvas.height = exportHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setPhotoError("Unable to prepare your photograph. Please try another image.");
      return;
    }
    // Avoid transparent regions becoming black when encoded as JPEG.
    ctx.fillStyle = "#f7f4ee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      rawImage,
      drawX,
      drawY,
      drawnW,
      drawnH
    );

    if (guideType === "body") {
      const checked = checkForMissingLowerImage(canvas, canvas.width, canvas.height);
      if (!checked.ok) {
        setPhotoError(checked.reason ?? "Please upload a complete head-to-toe photograph.");
        return;
      }
    }
    setPhotoError(null);
    const finalImg = new Image();

    finalImg.crossOrigin = "anonymous";

    finalImg.onload = () => {
      onImageReady(finalImg);
    };
    finalImg.onerror = () => setPhotoError("Could not create your image. Please choose another photograph.");

    finalImg.src =
      canvas.toDataURL("image/jpeg", 0.92);
  }

  const imgAspect = rawImage
    ? rawImage.naturalWidth / rawImage.naturalHeight
    : 1;

  const { wFrac, hFrac } = rawImage
    ? getDrawnFracs(imgAspect, zoom)
    : { wFrac: 1, hFrac: 1 };

  const uploadHeading =
    guideType === "body"
      ? "Upload Your Full-Body Photo"
      : "Upload Your Photo";

  return (
    <div className="upload-card">
      {photoError && !preview && <p className="scanner-error" role="alert">{photoError}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            handleFile(file);
          }
        }}
      />

      {preview ? (
        <div className="preview-wrap">
          <div
            ref={frameRef}
            className={`crop-frame ${
              guideType === "body"
                ? "crop-frame-body"
                : "crop-frame-face"
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img
              src={preview}
              alt={previewAlt}
              className="crop-img"
              draggable={false}
              style={{
                left: `${
                  (0.5 - wFrac / 2 + panX) * 100
                }%`,
                top: `${
                  (0.5 - hFrac / 2 + panY) * 100
                }%`,
                width: `${wFrac * 100}%`,
                height: `${hFrac * 100}%`,
              }}
            />

            {guideType === "face" && <FaceGuide />}

            {guideType === "body" && <BodyGuide />}
          </div>

          {photoError && <p className="scanner-error" role="alert">{photoError}</p>}

          <div className="crop-controls">
            <span>Zoom</span>

            <input
              type="range"
              min="1"
              max="2.5"
              step="0.01"
              value={zoom}
              onChange={(e) =>
                handleZoomChange(
                  parseFloat(e.target.value)
                )
              }
            />
          </div>

          <button
            type="button"
            className="preview-swap"
            onClick={() =>
              inputRef.current?.click()
            }
          >
            Choose a different photo
          </button>

          <p className="guide-hint">
            Drag to reposition, use the slider to zoom,
            then continue.
          </p>

          <button
            type="button"
            className="quiz-submit"
            style={{
              marginTop: "0.75rem",
              width: "100%",
            }}
            disabled={!rawImage}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="upload-dropzone"
          onClick={() =>
            inputRef.current?.click()
          }
          aria-label={uploadHeading}
        >
          {guideType === "face" && (
            <div className="guide-overlay-ghost">
              <FaceGuide />
            </div>
          )}

          {guideType === "body" && (
            <div className="guide-overlay-ghost">
              <BodyGuide />
            </div>
          )}

          <span className="upload-mark">
            {stepNumber}
          </span>

          <span
            style={{
              display: "block",
              fontSize: "1.25rem",
              fontWeight: 700,
              lineHeight: 1.2,
              marginTop: "0.3rem",
              position: "relative",
              zIndex: 2,
            }}
          >
            {uploadHeading}
          </span>

          <span
            className="upload-title"
            style={{
              marginTop: "0.35rem",
              fontSize: "0.92rem",
              fontWeight: 500,
              opacity: 0.8,
              position: "relative",
              zIndex: 2,
            }}
          >
            {title}
          </span>

          <span
            className="upload-hint"
            style={{
              marginTop: "0.3rem",
              position: "relative",
              zIndex: 2,
            }}
          >
            {hint}
          </span>

          <span
            style={{
              display: "inline-block",
              marginTop: "1rem",
              padding: "0.65rem 1.2rem",
              borderRadius: "999px",
              background: "#10233f",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.9rem",
              position: "relative",
              zIndex: 2,
            }}
          >
            Choose Photo
          </span>

          <span
            style={{
              display: "block",
              marginTop: "0.7rem",
              fontSize: "0.75rem",
              opacity: 0.6,
              position: "relative",
              zIndex: 2,
            }}
          >
            JPG, PNG or photo from your device
          </span>
        </button>
      )}
    </div>
  );
}