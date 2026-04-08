"use client";

import type { MediaListItemDto } from "@/features/media/types";
import type { ProductMediaDto } from "@/features/products/types";

export function mapMediaListItemToProductMedia(
  media: MediaListItemDto,
): ProductMediaDto {
  return {
    id: media.id,
    kind: media.kind,
    title: media.title,
    originalFilename: media.originalFilename,
    altText: media.altText,
    mimeType: media.mimeType,
    widthPx: media.widthPx,
    heightPx: media.heightPx,
    durationSeconds:
      media.durationSeconds == null ? null : String(media.durationSeconds),
    sizeBytes: media.sizeBytes == null ? null : String(media.sizeBytes),
    url: media.publicFileEndpoint || media.fileEndpoint,
    thumbnailUrl:
      media.kind === "IMAGE" ? `${media.publicFileEndpoint || media.fileEndpoint}?variant=thumbnail` : null,
  };
}
