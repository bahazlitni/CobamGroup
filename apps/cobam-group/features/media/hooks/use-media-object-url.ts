// @/features/media/hooks/use-media-object-url.ts

"use client";

import { useEffect, useState } from "react";
import { fetchMediaBlobClient } from "@/features/media/client";
import type { MediaFileVariant } from "@/features/media/types";

const previewUrlCache = new Map<string, string>();

export function useMediaObjectUrl(
  mediaId: number | null,
  variant: MediaFileVariant = "thumbnail",
) {
  const cacheKey =
    mediaId != null ? `${mediaId}:${variant}` : null;
  const cachedObjectUrl =
    cacheKey != null ? previewUrlCache.get(cacheKey) ?? null : null;
  const [loadedPreview, setLoadedPreview] = useState<{
    cacheKey: string;
    objectUrl: string | null;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (mediaId == null || cachedObjectUrl || !cacheKey) {
      return;
    }

    void fetchMediaBlobClient(mediaId, { variant })
      .then((blob) => {
        const nextUrl = URL.createObjectURL(blob);
        previewUrlCache.set(cacheKey, nextUrl);

        if (isMounted) {
          setLoadedPreview({
            cacheKey,
            objectUrl: nextUrl,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadedPreview({
            cacheKey,
            objectUrl: null,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [cacheKey, cachedObjectUrl, mediaId, variant]);

  const objectUrl =
    mediaId == null || !cacheKey
      ? null
      : cachedObjectUrl ??
        (loadedPreview?.cacheKey === cacheKey ? loadedPreview.objectUrl : null);

  const isLoading = mediaId != null && !objectUrl;

  return {
    objectUrl,
    isLoading,
  };
}
