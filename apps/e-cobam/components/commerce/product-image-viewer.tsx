"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ProductImageViewerSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export type ProductImageViewerItem = {
  id: number | string;
  url: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  title?: string | null;
  mimeType?: string | null;
  kind?: string | null;
};

const frameSizes: Record<ProductImageViewerSize, string> = {
  xs: "max-w-[16rem]",
  sm: "max-w-[20rem]",
  md: "max-w-[26rem]",
  lg: "max-w-[32rem]",
  xl: "max-w-[38rem]",
  "2xl": "max-w-[46rem]",
};

function isVideo(item: ProductImageViewerItem | null) {
  return Boolean(item?.mimeType?.startsWith("video/") || item?.kind === "VIDEO");
}

function MediaBody({
  item,
  title,
  priority = false,
  className,
}: {
  item: ProductImageViewerItem | null;
  title: string;
  priority?: boolean;
  className?: string;
}) {
  if (!item) {
    return <div className={cn("grid h-full w-full place-items-center bg-white text-ec-muted", className)}>COBAM</div>;
  }

  if (isVideo(item)) {
    return (
      <video
        src={item.url}
        controls
        className={cn("h-full w-full bg-white object-contain", className)}
        aria-label={item.altText || item.title || title}
      />
    );
  }

  return (
    <Image
      src={item.url}
      alt={item.altText || item.title || title}
      fill
      priority={priority}
      unoptimized
      sizes="(min-width: 1024px) 46rem, calc(100vw - 3rem)"
      className={cn("bg-white object-contain", className)}
    />
  );
}

export default function ProductImageViewer({
  items,
  title,
  size = "xl",
  className,
  emptyLabel = "COBAM",
}: {
  items: ProductImageViewerItem[];
  title: string;
  size?: ProductImageViewerSize;
  className?: string;
  emptyLabel?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const activeItem = items[activeIndex] ?? null;
  const hasItems = items.length > 0;
  const portalTarget = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <div className={cn("w-full", frameSizes[size], className)}>
        <button
          type="button"
          className="group relative block aspect-square w-full overflow-hidden border border-ec-line bg-white text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ec-blue"
          onClick={() => hasItems && setIsOpen(true)}
          aria-label={`Agrandir ${title}`}
        >
          {hasItems ? (
            <MediaBody item={activeItem} title={title} priority />
          ) : (
            <span className="grid h-full w-full place-items-center bg-white text-ec-muted">{emptyLabel}</span>
          )}
          {hasItems ? (
            <span className="absolute right-3 top-3 grid size-10 place-items-center rounded-full border border-ec-line bg-white/92 text-ec-ink opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <Maximize2 className="size-4" aria-hidden="true" />
            </span>
          ) : null}
        </button>

        {items.length > 1 ? (
          <div className="commerce-thin-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative size-14 shrink-0 overflow-hidden border bg-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-blue",
                  index === activeIndex ? "border-ec-ink" : "border-ec-line hover:border-ec-blue",
                )}
                aria-label={`Voir le visuel ${index + 1}`}
              >
                {isVideo(item) ? (
                  <span className="grid h-full w-full place-items-center text-xs font-black text-ec-muted">VID</span>
                ) : (
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={item.altText || item.title || `${title} ${index + 1}`}
                    fill
                    unoptimized
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isOpen && portalTarget
        ? createPortal(
            <div
              className="fixed inset-0 z-[1000] grid place-items-center bg-ec-ink/86 p-4 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onClick={() => setIsOpen(false)}
            >
              <div
                className="relative grid max-h-[calc(100svh-2rem)] w-full max-w-6xl grid-rows-[minmax(0,1fr)_auto] bg-white"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-ec-line bg-white text-ec-ink transition hover:border-ec-ink"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fermer l'aperçu"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>

                <div className="relative min-h-[18rem] bg-white sm:min-h-[32rem]">
                  <MediaBody item={activeItem} title={title} priority />
                </div>

                {items.length > 1 ? (
                  <div className="commerce-thin-scrollbar flex justify-center gap-2 overflow-x-auto border-t border-ec-line bg-white p-3">
                    {items.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                          "relative size-16 shrink-0 overflow-hidden border bg-white transition",
                          index === activeIndex ? "border-ec-ink" : "border-ec-line hover:border-ec-blue",
                        )}
                        aria-label={`Voir le visuel ${index + 1}`}
                      >
                        {isVideo(item) ? (
                          <span className="grid h-full w-full place-items-center text-xs font-black text-ec-muted">VID</span>
                        ) : (
                          <Image
                            src={item.thumbnailUrl || item.url}
                            alt={item.altText || item.title || `${title} ${index + 1}`}
                            fill
                            unoptimized
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
}
