export function imageToBase64(image: HTMLImageElement): { base64: string; mimeType: string } {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, 0, 0);

  // JPEG keeps the payload small (faster upload); fine for this use case
  // since we're sending a photo, not something needing transparency.
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  const base64 = dataUrl.split(",")[1];
  return { base64, mimeType: "image/jpeg" };
}