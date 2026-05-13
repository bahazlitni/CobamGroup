"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { RefreshCcw, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { getMediaByIdClient, MediaClientError } from "@/features/media/client";
import type { MediaListItemDto } from "@/features/media/types";
import { formatBytes, getMediaDisplayTitle } from "../utils";
import ImagePreview from "./ImagePreview";
import ImagePickerDialog from "./image-picker-dialog";
import {
  getAspectRatioCssValue,
  getAspectRatioValue,
  isWideAspectRatio,
  matchesAspectRatio,
  parseAspectRatio,
} from "./aspect-ratio";

type MediaImageFieldProps = {
  requireAspectRatio?: boolean;
  aspectRatio?: string;
  folderPath?: string;
  disabled?: boolean;
  label: string;
  description?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  mediaId: number | null;
  onChange: (mediaId: number | null) => void;
  emptyLabel?: string;
  previewClassName?: string;
  previewImageClassName?: string;
  fallback?: ReactNode;
  noImagePreview?: boolean;
};

export default function MediaImageField({
  requireAspectRatio = false,
  aspectRatio,
  folderPath,
  disabled = false,
  label,
  description,
  dialogTitle,
  dialogDescription,
  mediaId,
  onChange,
  emptyLabel = "Aucune image selectionnee.",
  previewClassName,
  previewImageClassName,
  fallback,
  noImagePreview = false,
}: MediaImageFieldProps) {
  const [open, setOpen] = useState(false);
  const [loadedState, setLoadedState] = useState<{
    mediaId: number;
    media: MediaListItemDto | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (mediaId == null) {
      return;
    }

    void getMediaByIdClient(mediaId)
      .then((result) => {
        if (isMounted) {
          setLoadedState({
            mediaId,
            media: result,
            error: null,
          });
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) {
          return;
        }

        setLoadedState({
          mediaId,
          media: null,
          error:
            err instanceof MediaClientError || err instanceof Error
              ? err.message
              : "Erreur lors du chargement de l'image",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [mediaId]);

  const media = mediaId != null && loadedState?.mediaId === mediaId ? loadedState.media : null;
  const error = mediaId != null && loadedState?.mediaId === mediaId ? loadedState.error : null;
  const isLoading = mediaId != null && loadedState?.mediaId !== mediaId;
  const requiredAspectRatio = parseAspectRatio(aspectRatio);
  const mediaAspectRatio = getAspectRatioValue(media);
  const useWideLayout = isWideAspectRatio(mediaAspectRatio ?? requiredAspectRatio?.value ?? null);
  const previewAspectRatio = getAspectRatioCssValue(requiredAspectRatio, media);
  const selectedImageAspectMismatch =
    Boolean(requireAspectRatio && requiredAspectRatio && media) &&
    !matchesAspectRatio(media, requiredAspectRatio);

  return (
    <>
      <Card className="rounded-3xl py-0 shadow-none ring-1 ring-slate-200">
        <CardContent className="grid gap-5 p-5">
          <div
            className={
              useWideLayout
                ? "flex flex-col gap-5"
                : "grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-start"
            }
          >
            {!noImagePreview && (
              <ImagePreview
                mediaId={mediaId}
                alt={label}
                className={
                  previewClassName ??
                  (useWideLayout ? "w-full rounded-3xl" : "h-32 w-32 rounded-3xl")
                }
                imageClassName={previewImageClassName}
                fallback={fallback}
                style={previewAspectRatio ? { aspectRatio: previewAspectRatio } : undefined}
              />
            )}

            <div className="min-w-0 flex-1 space-y-2">
              <div className="space-y-1">
                <p className="text-cobam-dark-blue text-sm font-semibold">{label}</p>
                {description ? (
                  <p className="text-sm leading-6 text-slate-500">{description}</p>
                ) : null}
              </div>

              {media ? (
                <div className="space-y-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3">
                  <p className="text-cobam-dark-blue truncate text-sm font-medium">
                    {getMediaDisplayTitle(media)}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>ID #{media.id}</span>
                    <span>{formatBytes(media.sizeBytes)}</span>
                    {media.originalFilename ? (
                      <span className="truncate">{media.originalFilename}</span>
                    ) : null}
                  </div>
                  {selectedImageAspectMismatch && requiredAspectRatio ? (
                    <p className="text-xs font-medium text-amber-700">
                      Cette image ne respecte pas le format requis {requiredAspectRatio.label}.
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  {isLoading ? "Chargement de l'image..." : error ? error : emptyLabel}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-1">
            <AnimatedUIButton
              type="button"
              onClick={() => setOpen(true)}
              variant="primary"
              icon={mediaId != null ? "modify" : "plus"}
              iconPosition="left"
              disabled={disabled}
            >
              {mediaId != null ? "Changer l'image" : "Choisir une image"}
            </AnimatedUIButton>

            {mediaId != null ? (
              <AnimatedUIButton
                type="button"
                onClick={() => onChange(null)}
                variant="light"
                className="border-slate-300"
                disabled={disabled}
              >
                <span className="inline-flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Retirer
                </span>
              </AnimatedUIButton>
            ) : null}

            {error && mediaId != null ? (
              <AnimatedUIButton
                type="button"
                onClick={() => setOpen(true)}
                variant="light"
                disabled={disabled}
              >
                <span className="inline-flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Rechoisir
                </span>
              </AnimatedUIButton>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <ImagePickerDialog
        open={open}
        onOpenChange={setOpen}
        title={dialogTitle ?? label}
        description={
          dialogDescription ?? description ?? "Choisissez une image depuis la mediatheque."
        }
        selectedMediaId={mediaId}
        aspectRatio={aspectRatio}
        requireAspectRatio={requireAspectRatio}
        folderPath={folderPath}
        onSelect={(selectedMedia) => {
          setLoadedState({
            mediaId: selectedMedia.id,
            media: selectedMedia,
            error: null,
          });
          onChange(selectedMedia.id);
        }}
      />
    </>
  );
}
