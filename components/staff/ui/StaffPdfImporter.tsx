"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCcw, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { getMediaByIdClient, MediaClientError } from "@/features/media/client";
import type { MediaListItemDto } from "@/features/media/types";
import { formatBytes, getMediaDisplayTitle } from "@/components/staff/media/utils";
import ProductMediaPickerDialog from "@/components/staff/products/ProductMediaPickerDialog";

type StaffPdfImporterProps = {
  label: string;
  description: string;
  dialogTitle: string;
  dialogDescription: string;
  mediaId: number | null;
  onChange: (mediaId: number | null) => void;
  emptyLabel?: string;
};

function isPdfMedia(media: MediaListItemDto | null) {
  if (!media) {
    return false;
  }

  const extension = media.extension?.trim().toLowerCase().replace(/^\./, "") ?? "";
  return media.kind === "DOCUMENT" && extension === "pdf";
}

export default function StaffPdfImporter({
  label,
  description,
  dialogTitle,
  dialogDescription,
  mediaId,
  onChange,
  emptyLabel = "Aucun PDF selectionne.",
}: StaffPdfImporterProps) {
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
        if (!isMounted) {
          return;
        }

        setLoadedState({
          mediaId,
          media: result,
          error: isPdfMedia(result) ? null : "Le media selectionne n'est pas un PDF.",
        });
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
              : "Erreur lors du chargement du PDF",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [mediaId]);

  const media =
    mediaId != null && loadedState?.mediaId === mediaId && isPdfMedia(loadedState.media)
      ? loadedState.media
      : null;
  const error = mediaId != null && loadedState?.mediaId === mediaId ? loadedState.error : null;
  const isLoading = mediaId != null && loadedState?.mediaId !== mediaId;

  return (
    <>
      <Card className="rounded-3xl py-0 shadow-none ring-1 ring-slate-200">
        <CardContent className="grid gap-5 p-5">
          <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
            <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-slate-300 bg-slate-50 text-slate-400">
              <FileText className="h-10 w-10" />
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-cobam-dark-blue">{label}</p>
                <p className="text-sm leading-6 text-slate-500">{description}</p>
              </div>

              {media ? (
                <div className="space-y-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
                  <p className="truncate text-sm font-medium text-cobam-dark-blue">
                    {getMediaDisplayTitle(media)}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>ID #{media.id}</span>
                    <span>{formatBytes(media.sizeBytes)}</span>
                    {media.originalFilename ? (
                      <span className="truncate">{media.originalFilename}</span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  {isLoading ? "Chargement du PDF..." : error ? error : emptyLabel}
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
            >
              {mediaId != null ? "Changer le PDF" : "Choisir un PDF"}
            </AnimatedUIButton>

            {mediaId != null ? (
              <AnimatedUIButton
                type="button"
                onClick={() => onChange(null)}
                variant="light"
                className="border-slate-300"
              >
                <span className="inline-flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Retirer
                </span>
              </AnimatedUIButton>
            ) : null}

            {error && mediaId != null ? (
              <AnimatedUIButton type="button" onClick={() => setOpen(true)} variant="light">
                <span className="inline-flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Rechoisir
                </span>
              </AnimatedUIButton>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <ProductMediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        title={dialogTitle}
        description={dialogDescription}
        mediaKind="DOCUMENT"
        documentExtensions={["pdf"]}
        onSelect={(selectedMedia) => {
          onChange(selectedMedia.id);
          setOpen(false);
        }}
      />
    </>
  );
}
