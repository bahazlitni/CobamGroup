"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Maximize2, Play, X } from "lucide-react";
import {
  type FocusEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type ImagePreviewCarouselSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export type ImagePreviewCarouselItem = {
  id: number | string;
  url: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  title?: string | null;
  mimeType?: string | null;
  kind?: string | null;
};

type ImagePreviewCarouselProps = {
  items: ImagePreviewCarouselItem[];
  title: string;
  size?: ImagePreviewCarouselSize;
  className?: string;
  frameClassName?: string;
  viewerClassName?: string;
  railClassName?: string;
  thumbnailClassName?: string;
  activeThumbnailClassName?: string;
  inactiveThumbnailClassName?: string;
  mainImageClassName?: string;
  viewerImageClassName?: string;
  emptyLabel?: string;
  openLabel?: string;
  closeLabel?: string;
  onActiveItemChange?: (item: ImagePreviewCarouselItem, index: number) => void;
};

const SIZE_STYLES: Record<
  ImagePreviewCarouselSize,
  {
    frameRadius: string;
    thumbnailRadius: string;
    iconButton: string;
    icon: string;
    iconInset: string;
    rail: string;
    emptyText: string;
    viewerRadius: string;
  }
> = {
  xs: {
    frameRadius: "rounded-xl",
    thumbnailRadius: "rounded-lg",
    iconButton: "size-8",
    icon: "size-3.5",
    iconInset: "right-2 top-2",
    rail: "grid-cols-4 gap-1.5",
    emptyText: "text-xs",
    viewerRadius: "rounded-xl",
  },
  sm: {
    frameRadius: "rounded-2xl",
    thumbnailRadius: "rounded-lg",
    iconButton: "size-9",
    icon: "size-4",
    iconInset: "right-2.5 top-2.5",
    rail: "grid-cols-5 gap-1.5",
    emptyText: "text-xs",
    viewerRadius: "rounded-2xl",
  },
  md: {
    frameRadius: "rounded-[1.15rem]",
    thumbnailRadius: "rounded-xl",
    iconButton: "size-10",
    icon: "size-4",
    iconInset: "right-3 top-3",
    rail: "grid-cols-5 gap-2",
    emptyText: "text-sm",
    viewerRadius: "rounded-[1.25rem]",
  },
  lg: {
    frameRadius: "rounded-[1.35rem]",
    thumbnailRadius: "rounded-xl",
    iconButton: "size-10",
    icon: "size-4",
    iconInset: "right-4 top-4",
    rail: "grid-cols-5 gap-2",
    emptyText: "text-sm",
    viewerRadius: "rounded-[1.5rem]",
  },
  xl: {
    frameRadius: "rounded-[1.5rem]",
    thumbnailRadius: "rounded-2xl",
    iconButton: "size-11",
    icon: "size-[1.125rem]",
    iconInset: "right-4 top-4",
    rail: "grid-cols-5 gap-2 sm:grid-cols-6",
    emptyText: "text-sm",
    viewerRadius: "rounded-[1.75rem]",
  },
  "2xl": {
    frameRadius: "rounded-[2rem]",
    thumbnailRadius: "rounded-2xl",
    iconButton: "size-12",
    icon: "size-5",
    iconInset: "right-5 top-5",
    rail: "grid-cols-5 gap-2",
    emptyText: "text-sm",
    viewerRadius: "rounded-[2rem]",
  },
};

function isImageItem(item: ImagePreviewCarouselItem | null) {
  if (!item) return false;
  const kind = item.kind?.toUpperCase();
  return !kind || kind === "IMAGE" || Boolean(item.mimeType?.startsWith("image/"));
}

function isVideoItem(item: ImagePreviewCarouselItem | null) {
  if (!item) return false;
  return item.kind?.toUpperCase() === "VIDEO" || Boolean(item.mimeType?.startsWith("video/"));
}

function getItemAlt(item: ImagePreviewCarouselItem | null, title: string) {
  return item?.altText ?? item?.title ?? title;
}

function MediaBody({
  item,
  title,
  imageClassName,
  priority = false,
}: {
  item: ImagePreviewCarouselItem | null;
  title: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  if (!item) {
    return null;
  }

  if (isImageItem(item)) {
    return (
      <img
        src={item.url}
        alt={getItemAlt(item, title)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={cn("h-full w-full object-contain", imageClassName)}
      />
    );
  }

  if (isVideoItem(item)) {
    return (
      <video className="h-full w-full object-contain" controls playsInline preload="metadata">
        <source src={item.url} type={item.mimeType ?? undefined} />
      </video>
    );
  }

  return (
    <div className="grid h-full place-items-center px-8 text-center text-sm font-semibold text-slate-500">
      <FileText className="mb-3 size-8 text-slate-300" aria-hidden="true" />
      Document disponible dans les actions techniques.
    </div>
  );
}

function ThumbnailBody({ item, title }: { item: ImagePreviewCarouselItem; title: string }) {
  if (isImageItem(item)) {
    return (
      <img
        src={item.thumbnailUrl ?? item.url}
        alt={getItemAlt(item, title)}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="h-full w-full object-contain"
      />
    );
  }

  if (isVideoItem(item)) {
    return (
      <span className="grid h-full place-items-center text-slate-500">
        <Play className="size-4" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className="grid h-full place-items-center text-slate-500">
      <FileText className="size-4" aria-hidden="true" />
    </span>
  );
}

export default function ImagePreviewCarousel({
  items,
  title,
  size = "lg",
  className,
  frameClassName,
  viewerClassName,
  railClassName,
  thumbnailClassName,
  activeThumbnailClassName,
  inactiveThumbnailClassName,
  mainImageClassName,
  viewerImageClassName,
  emptyLabel = "Aucun media disponible.",
  openLabel,
  closeLabel = "Fermer l'apercu",
  onActiveItemChange,
}: ImagePreviewCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const styles = SIZE_STYLES[size];
  const activeItem = items[activeIndex] ?? items[0] ?? null;
  const canOpenViewer = isImageItem(activeItem);
  const activeAlt = getItemAlt(activeItem, title);
  const resolvedOpenLabel = openLabel ?? `Agrandir ${title}`;

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  useEffect(() => {
    if (activeIndex <= items.length - 1) {
      return;
    }
    setActiveIndex(0);
  }, [activeIndex, items.length]);

  useEffect(() => {
    if (!activeItem) return;
    onActiveItemChange?.(activeItem, activeIndex);
  }, [activeIndex, activeItem, onActiveItemChange]);

  useEffect(() => {
    if (!isViewerOpen) return undefined;

    viewerRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsViewerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isViewerOpen]);

  const thumbnailItems = useMemo(() => items.filter((item) => item.url), [items]);

  function handleViewerBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;
    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      setIsViewerOpen(false);
    }
  }

  function handleViewerMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      setIsViewerOpen(false);
    }
  }

  return (
    <>
      <aside className={cn("space-y-3", className)}>
        <div
          className={cn(
            "overflow-hidden border border-slate-200 bg-white",
            styles.frameRadius,
            frameClassName,
          )}
        >
          <button
            type="button"
            onClick={() => canOpenViewer && setIsViewerOpen(true)}
            disabled={!canOpenViewer}
            className={cn(
              "group relative block aspect-square w-full overflow-hidden bg-white text-left",
              canOpenViewer && "cursor-zoom-in",
            )}
            aria-label={canOpenViewer ? resolvedOpenLabel : undefined}
          >
            {activeItem ? (
              <MediaBody
                item={activeItem}
                title={title}
                priority
                imageClassName={mainImageClassName}
              />
            ) : (
              <div
                className={cn(
                  "grid h-full place-items-center px-8 text-center font-semibold tracking-[0.2em] text-slate-300 uppercase",
                  styles.emptyText,
                )}
              >
                {emptyLabel}
              </div>
            )}

            {canOpenViewer ? (
              <span
                className={cn(
                  "absolute z-10 inline-flex items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-800 opacity-0 shadow-sm backdrop-blur-sm transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
                  styles.iconInset,
                  styles.iconButton,
                )}
              >
                <Maximize2 className={styles.icon} aria-hidden="true" />
              </span>
            ) : null}
          </button>
        </div>

        {thumbnailItems.length > 1 ? (
          <div className={cn("grid", styles.rail, railClassName)}>
            {thumbnailItems.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "relative aspect-square overflow-hidden border bg-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/35",
                    styles.thumbnailRadius,
                    isActive
                      ? cn("border-slate-900 ring-2 ring-slate-900/10", activeThumbnailClassName)
                      : cn("border-slate-200 hover:border-sky-400/50", inactiveThumbnailClassName),
                    thumbnailClassName,
                  )}
                  aria-label={`Afficher le media ${index + 1}`}
                  aria-pressed={isActive}
                >
                  <ThumbnailBody item={item} title={title} />
                </button>
              );
            })}
          </div>
        ) : null}
      </aside>

      {portalRoot
        ? createPortal(
            <AnimatePresence>
              {isViewerOpen && activeItem && isImageItem(activeItem) ? (
          <motion.div
            ref={viewerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={resolvedOpenLabel}
            className={cn(
              "fixed inset-0 z-[9999] grid place-items-center bg-slate-950/88 p-4 backdrop-blur-sm focus:outline-none",
              viewerClassName,
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onBlur={handleViewerBlur}
            onMouseDown={handleViewerMouseDown}
          >
            <button
              type="button"
              onClick={() => setIsViewerOpen(false)}
              className="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:bg-sky-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label={closeLabel}
            >
              <X className="size-5" aria-hidden="true" />
            </button>

            <motion.div
              className="grid w-[min(94vw,78rem)] gap-3"
              initial={{ y: 12, scale: 0.985 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 10, scale: 0.985 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              <div
                className={cn(
                  "relative h-[min(78vh,64rem)] overflow-hidden bg-white shadow-2xl",
                  styles.viewerRadius,
                )}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <img
                  src={activeItem.url}
                  alt={activeAlt}
                  decoding="async"
                  draggable={false}
                  className={cn("h-full w-full object-contain", viewerImageClassName)}
                />
              </div>

              {thumbnailItems.length > 1 ? (
                <div
                  className="mx-auto flex max-w-full gap-2 overflow-x-auto rounded-full bg-white/10 p-2 backdrop-blur"
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  {thumbnailItems.map((item, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                          "relative size-14 shrink-0 overflow-hidden rounded-full border bg-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                          isActive ? "border-sky-400 ring-2 ring-sky-400/35" : "border-white/45",
                        )}
                        aria-label={`Afficher le media ${index + 1}`}
                        aria-pressed={isActive}
                      >
                        <ThumbnailBody item={item} title={title} />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </motion.div>
          </motion.div>
              ) : null}
            </AnimatePresence>,
            portalRoot,
          )
        : null}
    </>
  );
}

export type { ImagePreviewCarouselProps };
