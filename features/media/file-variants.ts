// @/features/media/file-variants.ts

import path from "path";
import type { MediaFileVariant } from "./types";

const DEFAULT_THUMBNAIL_MAX_WIDTH = 640;
const DEFAULT_THUMBNAIL_QUALITY = 72;

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function getMediaThumbnailMaxWidth() {
  return parsePositiveInteger(
    process.env.MEDIA_THUMBNAIL_MAX_WIDTH,
    DEFAULT_THUMBNAIL_MAX_WIDTH,
  );
}

export function getMediaThumbnailQuality() {
  return parsePositiveInteger(
    process.env.MEDIA_THUMBNAIL_QUALITY,
    DEFAULT_THUMBNAIL_QUALITY,
  );
}

export function getMediaVariantStoragePath(
  storagePath: string,
  variant: MediaFileVariant,
) {
  if (variant === "original") {
    return storagePath;
  }

  const normalizedStoragePath = storagePath.replace(/\\/g, "/");
  const parsedPath = path.posix.parse(normalizedStoragePath);

  return path.posix.join(
    parsedPath.dir,
    `${parsedPath.name}.thumbnail.webp`,
  );
}

export function buildMediaVariantFilename(
  originalFilename: string | null,
  variant: MediaFileVariant,
) {
  if (variant === "original") {
    return originalFilename;
  }

  const baseName = originalFilename
    ? path.basename(originalFilename, path.extname(originalFilename))
    : "media";

  return `${baseName}-thumbnail.webp`;
}
