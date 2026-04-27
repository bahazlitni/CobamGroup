"use client";

import { useState } from "react";
import { FileText, RefreshCcw, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { formatBytes } from "@/components/staff/media/utils";
import ProductMediaPickerDialog from "@/components/staff/products/ProductMediaPickerDialog";
import type { ProductMediaDto } from "@/features/products/types";

type StaffPdfImporterProps = {
  label: string;
  description: string;
  dialogTitle: string;
  dialogDescription: string;
  value: ProductMediaDto | null;
  onChange: (value: ProductMediaDto | null) => void;
  emptyLabel?: string;
};

function isPdfMedia(media: ProductMediaDto | null) {
  if (!media) {
    return false;
  }

  const extension = media.originalFilename?.split(".").pop()?.trim().toLowerCase() ?? "";
  return (
    media.kind === "DOCUMENT" &&
    (extension === "pdf" || media.mimeType?.toLowerCase() === "application/pdf")
  );
}

function getPdfLabel(media: ProductMediaDto) {
  return media.title?.trim() || media.originalFilename || `Media #${media.id}`;
}

export default function StaffPdfImporter({
  label,
  description,
  dialogTitle,
  dialogDescription,
  value,
  onChange,
  emptyLabel = "Aucun PDF selectionne.",
}: StaffPdfImporterProps) {
  const [open, setOpen] = useState(false);
  const media = isPdfMedia(value) ? value : null;
  const error = value != null && !isPdfMedia(value) ? "Le media selectionne n'est pas un PDF." : null;

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
                    {getPdfLabel(media)}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>ID #{media.id}</span>
                    <span>{formatBytes(media.sizeBytes == null ? null : Number(media.sizeBytes))}</span>
                    {media.originalFilename ? (
                      <span className="truncate">{media.originalFilename}</span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  {error ? error : emptyLabel}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-1">
            <AnimatedUIButton
              type="button"
              onClick={() => setOpen(true)}
              variant="primary"
              icon={value != null ? "modify" : "plus"}
              iconPosition="left"
            >
              {value != null ? "Changer le PDF" : "Choisir un PDF"}
            </AnimatedUIButton>

            {value != null ? (
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

            {error && value != null ? (
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

      {open ? (
        <ProductMediaPickerDialog
          open={open}
          onOpenChange={setOpen}
          title={dialogTitle}
          description={dialogDescription}
          mediaKind="DOCUMENT"
          documentExtensions={["pdf"]}
          onSelect={(selectedMedia) => {
            onChange(selectedMedia);
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
