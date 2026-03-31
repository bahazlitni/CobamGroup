"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import ImagePickerDialog from "@/components/staff/media/importers/image-picker-dialog";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import {
  getMediaByIdClient,
  MediaClientError,
} from "@/features/media/client";
import type { MediaListItemDto } from "@/features/media/types";
import { cn } from "@/lib/utils";

export default function ProductFinishImageInput({
  mediaId,
  onChange,
  disabled = false,
}: {
  mediaId: number | null;
  onChange: (mediaId: number | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaListItemDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolvedMediaId, setResolvedMediaId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (mediaId == null) {
      return;
    }

    void getMediaByIdClient(mediaId)
      .then((item) => {
        if (cancelled) {
          return;
        }

        setResolvedMediaId(mediaId);
        setMedia(item);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }

        setResolvedMediaId(mediaId);
        setMedia(null);
        setError(
          err instanceof MediaClientError || err instanceof Error
            ? err.message
            : "Image introuvable.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [mediaId]);

  const displayedMedia =
    mediaId != null && resolvedMediaId === mediaId ? media : null;
  const displayedError =
    mediaId != null && resolvedMediaId === mediaId ? error : null;

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          className={cn(
            "flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-slate-50 transition-colors",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "hover:border-slate-300 hover:bg-slate-100",
          )}
          title={displayedMedia ? "Changer l'image" : "Choisir une image"}
        >
          {displayedMedia ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/staff/medias/${displayedMedia.id}/file?variant=thumbnail`}
              alt={
                displayedMedia.altText ||
                displayedMedia.title ||
                displayedMedia.originalFilename ||
                "Finition"
              }
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-4 w-4 text-slate-400" />
          )}
        </button>

        <div className="min-w-0 space-y-1">
          <AnimatedUIButton
            type="button"
            variant="outline"
            size="sm"
            icon="image"
            iconPosition="left"
            onClick={() => setOpen(true)}
            disabled={disabled}
          >
            {displayedMedia ? "Changer" : "Choisir"}
          </AnimatedUIButton>
          <p className="truncate text-xs text-slate-400">
            {displayedError ||
              displayedMedia?.originalFilename ||
              "Image carrée requise"}
          </p>
        </div>
      </div>

      <ImagePickerDialog
        open={open}
        onOpenChange={setOpen}
        title="Image de finition"
        description="Choisissez une image carrée d'au moins 256×256."
        selectedMediaId={mediaId}
        aspectRatio="1:1"
        requireAspectRatio
        onSelect={(selectedMedia) => {
          setResolvedMediaId(selectedMedia.id);
          setMedia(selectedMedia);
          setError(null);
          onChange(selectedMedia.id);
        }}
      />
    </>
  );
}
