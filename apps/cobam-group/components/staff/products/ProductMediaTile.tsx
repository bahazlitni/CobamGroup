"use client";

import Image from "next/image";
import { File, FileText, GripVertical, Pencil, Trash2, Video } from "lucide-react";
import { StaffBadge } from "@/components/staff/ui";
import { useMediaObjectUrl } from "@/features/media/hooks/use-media-object-url";
import type { ProductMediaDto } from "@/features/products/types";
import { cn } from "@/lib/utils";

function getFallbackIcon(kind: ProductMediaDto["kind"]) {
  switch (kind) {
    case "VIDEO":
      return <Video className="h-8 w-8" />;
    case "DOCUMENT":
      return <FileText className="h-8 w-8" />;
    default:
      return <File className="h-8 w-8" />;
  }
}

function getMediaLabel(media: ProductMediaDto) {
  return media.title || media.originalFilename || `Media #${media.id}`;
}

export default function ProductMediaTile({
  media,
  isDragging = false,
  isDragOver = false,
  onRemove,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  media: ProductMediaDto;
  isDragging?: boolean;
  isDragOver?: boolean;
  onRemove: () => void;
  onEdit: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const { objectUrl } = useMediaObjectUrl(media.kind === "IMAGE" ? media.id : null, "thumbnail");

  return (
    <div
      draggable
      role="button"
      tabIndex={0}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("button")) {
          return;
        }
        onEdit();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit();
        }
      }}
      onDragStart={onDragStart}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm transition",
        isDragOver ? "border-cobam-water-blue ring-cobam-water-blue/20 ring-2" : "",
        isDragging ? "scale-[0.98] opacity-70" : "hover:border-slate-300",
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {media.kind === "IMAGE" && objectUrl ? (
          <Image
            src={objectUrl}
            alt={media.altText || getMediaLabel(media)}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            {getFallbackIcon(media.kind)}
          </div>
        )}

        <button
          type="button"
          onClick={onEdit}
          className="hover:bg-cobam-water-blue/10 hover:text-cobam-water-blue absolute top-2 left-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm transition"
          aria-label={`Modifier ${getMediaLabel(media)}`}
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
          aria-label={`Retirer ${getMediaLabel(media)}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2 py-1 text-[11px] font-medium text-white">
          <GripVertical className="h-3.5 w-3.5" />
          Glisser
        </div>
      </div>

      <div className="space-y-1 px-3 py-3">
        <div className="flex items-center gap-2">
          <p className="text-cobam-dark-blue min-w-0 truncate text-sm font-semibold">
            {getMediaLabel(media)}
          </p>
          <StaffBadge size="xs" color="secondary" title={`ID media ${media.id}`}>
            ID #{media.id}
          </StaffBadge>
        </div>
        <p className="truncate text-xs text-slate-500">
          {media.originalFilename || `${media.kind.toLowerCase()} #${media.id}`}
        </p>
      </div>
    </div>
  );
}
