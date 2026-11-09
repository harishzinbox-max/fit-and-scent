/** Client-side validation of full-body photo inputs. No photos are uploaded here. */
export type FullBodyPhotoCheck = { ok: boolean; reason?: string };

/**
 * Detect a broad near-black bottom band, typical of an incomplete/composited
 * photograph. This is intentionally conservative; very dark studio backgrounds
 * can sometimes trigger it too.
 */
export function checkForMissingLowerImage(
  source: CanvasImageSource,
  width: number,
  height: number
): FullBodyPhotoCheck {
  if (width < 320 || height < 480) {
    return { ok: false, reason: "Please upload a clearer, higher-resolution head-to-toe photo (at least 320 × 480 pixels)." };
  }
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 80;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { ok: false, reason: "Could not inspect your photo. Please choose another image." };
  try {
    ctx.drawImage(source, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let nearlyBlackRows = 0;
    // Work upward from the bottom. Require a full-width dark band spanning
    // at least 20% of the image, not just dark trousers or shoes.
    for (let y = canvas.height - 1; y >= Math.floor(canvas.height * 0.45); y--) {
      let dark = 0;
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 10 || (r < 18 && g < 18 && b < 18)) dark++;
      }
      if (dark / canvas.width >= 0.96) nearlyBlackRows++;
      else break;
    }
    if (nearlyBlackRows >= canvas.height * 0.2) {
      return {
        ok: false,
        reason: "The bottom part of this photograph appears blank or black. Please upload a genuine head-to-toe photograph showing your legs and feet. A very dark background may also trigger this warning.",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "We could not inspect this photo. Please select a JPG or PNG from your device." };
  }
}

export type PosePoint = { x: number; y: number; visibility?: number; presence?: number };

/** Normalized MediaPipe pose landmarks; require both legs and feet in frame. */
export function checkFullBodyPose(points: PosePoint[]): FullBodyPhotoCheck {
  const visible = (index: number, minY = 0, maxY = 1) => {
    const p = points[index];
    return !!p && Number.isFinite(p.x) && Number.isFinite(p.y) &&
      p.x >= 0.015 && p.x <= 0.985 && p.y >= minY && p.y <= maxY &&
      (p.visibility === undefined || p.visibility >= 0.45) &&
      (p.presence === undefined || p.presence >= 0.45);
  };
  const pairs: [number, number, string][] = [
    [11, 12, "shoulders"],
    [23, 24, "hips"],
    [25, 26, "knees"],
    [27, 28, "ankles"],
    [31, 32, "feet"],
  ];
  const missing = pairs.find(([left, right]) => !visible(left) || !visible(right));
  if (!visible(0, 0, 0.4) || missing) {
    return {
      ok: false,
      reason: `Please upload a genuine head-to-toe photograph with your full face, both ${missing?.[2] ?? "shoulders"}, legs and feet clearly visible. Step farther back and keep your whole body in frame.`,
    };
  }
  // Ensure landmark positions form a plausible head-to-feet vertical span.
  const noseY = points[0].y;
  const footY = Math.max(points[31].y, points[32].y);
  if (footY - noseY < 0.55 || footY < 0.68) {
    return { ok: false, reason: "Your entire body needs to be visible from head to feet. Please step farther back and take another photo." };
  }
  return { ok: true };
}
