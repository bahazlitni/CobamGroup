"use client";

import { CheckCircle2 } from "lucide-react";
import ImagePreview from "@/components/staff/media/importers/ImagePreview";
import type { ProductCertificateOptionDto } from "@/features/products/types";
import { cn } from "@/lib/utils";

type ProductCertificateSelectorProps = {
  options: ProductCertificateOptionDto[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  title?: string;
  description?: string;
};

export default function ProductCertificateSelector({
  options,
  selectedIds,
  onChange,
  title = "Certificats image",
  description = "Optionnel : selectionnez les certificats a afficher sous forme d'images sur la fiche publique.",
}: ProductCertificateSelectorProps) {
  const selectedSet = new Set(selectedIds);

  const toggleCertificate = (id: number) => {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }

    onChange([...selectedIds, id]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-cobam-dark-blue text-sm font-semibold">{title}</p>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>

      {options.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          Aucun certificat image disponible.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {options.map((certificate) => {
            const isSelected = selectedSet.has(certificate.id);

            return (
              <button
                key={certificate.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleCertificate(certificate.id)}
                className={cn(
                  "group focus-visible:ring-cobam-water-blue/25 relative flex min-h-44 flex-col overflow-hidden rounded-lg border bg-white text-left transition focus:outline-none focus-visible:ring-2",
                  isSelected
                    ? "border-cobam-water-blue ring-cobam-water-blue/15 shadow-sm ring-2"
                    : "hover:border-cobam-water-blue/45 hover:bg-cobam-water-blue/5 border-slate-200",
                )}
              >
                <span className="relative block aspect-[4/3] w-full bg-slate-50">
                  <ImagePreview
                    alt={certificate.imageAltText ?? certificate.name}
                    mediaId={certificate.imageMediaId}
                    className="h-full w-full rounded-none border-0"
                    imageClassName="object-contain p-4"
                  />
                </span>
                <span className="flex min-h-16 items-center gap-3 px-3 py-2">
                  <span className="min-w-0 flex-1">
                    <span className="text-cobam-dark-blue block truncate text-sm font-semibold">
                      {certificate.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {certificate.slug}
                    </span>
                  </span>
                  <CheckCircle2
                    aria-hidden="true"
                    className={cn(
                      "h-5 w-5 shrink-0 transition",
                      isSelected ? "text-cobam-water-blue" : "text-slate-300",
                    )}
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
