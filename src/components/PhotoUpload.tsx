"use client";

import { useRef, useState } from "react";

interface Props {
  onImageReady: (imageEl: HTMLImageElement) => void;
}

export default function PhotoUpload({ onImageReady }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => onImageReady(img);
    img.src = url;
  }

  return (
    <div className="upload-card">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {preview ? (
        <button className="preview-wrap" onClick={() => inputRef.current?.click()}>
          <img src={preview} alt="Uploaded portrait" className="preview-img" />
          <span className="preview-swap">Choose a different photo</span>
        </button>
      ) : (
        <button className="upload-dropzone" onClick={() => inputRef.current?.click()}>
          <span className="upload-mark">01</span>
          <span className="upload-title">Add a front-facing photo</span>
          <span className="upload-hint">Even lighting, face centered, no sunglasses.</span>
        </button>
      )}
    </div>
  );
}
