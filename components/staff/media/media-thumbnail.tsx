"use client";

import Image from "next/image";
import { File, FileText, Headphones, ImageIcon, Video } from "lucide-react";
import { useMediaObjectUrl } from "@/features/media/hooks/use-media-object-url";
import type { MediaListItemDto } from "@/features/media/types";
import { cn } from "@/lib/utils";
import { getMediaDisplayTitle, getMediaViewForItem } from "./utils";

function renderFallbackIcon(media: MediaListItemDto) {
  const view = getMediaViewForItem(media);

  switch (view) {
    case "images":
      return <ImageIcon className="h-8 w-8" />;
    case "videos":
      return <Video className="h-8 w-8" />;
    case "pdf":
      return <FileText className="h-8 w-8" />;
    case "audio":
      return <Headphones className="h-8 w-8" />;
    default:
      return <File className="h-8 w-8" />;
  }
}

export default function MediaThumbnail({
  media,
  className,
}: {
  media: MediaListItemDto;
  className?: string;
}) {
  const { objectUrl, isLoading } = useMediaObjectUrl(
    media.kind === "IMAGE" ? media.id : null,
    "thumbnail",
  );

  if (media.kind === "IMAGE" && objectUrl) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl bg-slate-100", className)}>
        <Image
          src={objectUrl}
          alt={media.altText || getMediaDisplayTitle(media)}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50",
        className,
      )}
    >
      {isLoading ? (
        <div className="h-full w-full animate-pulse rounded-2xl bg-slate-200/70" />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-400">
          {renderFallbackIcon(media)}
        </div>
      )}
    </div>
  );
}
