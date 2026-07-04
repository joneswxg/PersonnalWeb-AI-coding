export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function validateImageUpload(file: File) {
  if (file.size <= 0) {
    throw new Error("Please choose an image to upload");
  }

  if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_MIME_TYPES)[number])) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP");
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new Error("Image must be 10 MB or smaller");
  }
}

export function buildMarkdownImage(asset: { altText: string | null; publicUrl: string }) {
  return `![${asset.altText ?? ""}](${asset.publicUrl})`;
}

export function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
