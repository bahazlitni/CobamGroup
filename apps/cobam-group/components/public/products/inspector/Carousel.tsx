"use client";

import Image from "next/image";
import { useState } from "react";
import { FileText, Maximize2, X } from "lucide-react";
import type { PublicProductInspectorMedia } from "@/features/products/types";
import { cn } from "@/lib/utils";

type CarouselProps = {
  media: PublicProductInspectorMedia[];
  title: string;
  datasheetUrl?: string | null;
};

function MediaPreview({
  media,
  title,
  priority = false,
}: {
  media: PublicProductInspectorMedia | null;
  title: string;
  priority?: boolean;
}) {
  if (!media) {
    return (
      <div className="grid h-full place-items-center px-8 text-center text-sm font-semibold text-slate-400">
        Aucun media disponible.
      </div>
    );
  }

  if (media.kind === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt={media.altText ?? media.title ?? title}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 44vw, 100vw"
        className="object-contain p-5 sm:p-8"
      />
    );
  }

  if (media.kind === "VIDEO") {
    return (
      <video className="h-full w-full object-contain" controls playsInline preload="metadata">
        <source src={media.url} type={media.mimeType ?? undefined} />
      </video>
    );
  }

  return (
    <div className="grid h-full place-items-center px-8 text-center text-sm font-semibold text-slate-500">
      Document disponible dans les actions techniques.
    </div>
  );
}

export default function Carousel({ media, title, datasheetUrl }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const activeMedia = media[activeIndex] ?? media[0] ?? null;
  const canZoom = activeMedia?.kind === "IMAGE";

  return (
    <>
      <aside className="space-y-4 lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-[2rem] border border-cobam-quill-grey/35 bg-white shadow-[0_28px_90px_rgba(20,32,46,0.08)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Visuel produit
              </p>
              <p className="mt-1 text-sm font-semibold text-cobam-dark-blue">
                Inspection catalogue
              </p>
            </div>
            {datasheetUrl ? (
              <a
                href={datasheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-cobam-quill-grey/40 bg-white px-3 py-2 text-xs font-semibold text-cobam-dark-blue transition hover:border-cobam-water-blue hover:text-cobam-water-blue"
              >
                <FileText className="size-3.5" aria-hidden="true" />
                Fiche
              </a>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => canZoom && setIsLightboxOpen(true)}
            disabled={!canZoom}
            className={cn(
              "group relative block aspect-[4/3] w-full overflow-hidden bg-[radial-gradient(circle_at_50%_18%,#ffffff_0%,#f8fafc_48%,#eef2f6_100%)] sm:aspect-square",
              canZoom && "cursor-zoom-in",
            )}
            aria-label={canZoom ? `Agrandir ${title}` : undefined}
          >
            <div className="pointer-events-none absolute inset-7 rounded-[1.5rem] border border-white/80" />
            <div className="pointer-events-none absolute inset-x-10 top-10 h-px bg-cobam-quill-grey/35" />
            <div className="pointer-events-none absolute inset-y-10 left-10 w-px bg-cobam-quill-grey/35" />
            <MediaPreview media={activeMedia} title={title} priority />
            {canZoom ? (
              <span className="absolute right-5 top-5 inline-flex size-10 items-center justify-center rounded-full bg-white/85 text-cobam-dark-blue shadow-sm opacity-0 transition group-hover:opacity-100">
                <Maximize2 className="size-4" aria-hidden="true" />
              </span>
            ) : null}
          </button>
        </div>

        {media.length > 1 ? (
          <div className="grid grid-cols-5 gap-2">
            {media.map((entry, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-2xl border bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobam-water-blue/45",
                    isActive
                      ? "border-cobam-dark-blue ring-2 ring-cobam-dark-blue/10"
                      : "border-cobam-quill-grey/35 hover:border-cobam-water-blue/40",
                  )}
                  aria-label={`Afficher le media ${index + 1}`}
                  aria-pressed={isActive}
                >
                  {entry.kind === "IMAGE" ? (
                    <Image
                      src={entry.thumbnailUrl ?? entry.url}
                      alt={entry.altText ?? entry.title ?? title}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {entry.kind === "VIDEO" ? "Video" : "Doc"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : null}
      </aside>

      {isLightboxOpen && activeMedia?.kind === "IMAGE" ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-cobam-dark-blue/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Apercu agrandi ${title}`}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-5 top-5 inline-flex size-11 items-center justify-center rounded-full bg-white text-cobam-dark-blue shadow-lg transition hover:bg-cobam-water-blue hover:text-white"
            aria-label="Fermer l'apercu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          <div
            className="relative h-[86vh] w-[min(92vw,72rem)] rounded-[2rem] bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activeMedia.url}
              alt={activeMedia.altText ?? activeMedia.title ?? title}
              fill
              sizes="92vw"
              className="object-contain p-6 sm:p-10"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
