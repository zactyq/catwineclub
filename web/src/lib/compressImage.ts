"use client";

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

/**
 * Downscales + re-encodes an image client-side before upload. Skips GIFs
 * (canvas would flatten animation to a single frame) and anything that
 * isn't already an image, and falls back to the original file if the
 * "compressed" version isn't actually smaller.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  if (!blob || blob.size >= file.size) {
    return file;
  }

  const newName = file.name.replace(/\.[^./\\]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}
