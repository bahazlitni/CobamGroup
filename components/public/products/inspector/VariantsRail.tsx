"use client"
import { PublicProductInspectorMedia, PublicProductInspectorVariant } from "@/features/products/types";
import { cn } from "@/lib/utils";
import { getVariantMedia, RailScrollState } from "./utils";
import MediaFrame from "./MediaFrame";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function getVariantPreviewMedia(
  variant: PublicProductInspectorVariant,
  coverMedia: PublicProductInspectorMedia | null,
) {
  const media = getVariantMedia(variant, coverMedia);

  return media.find((entry) => entry.kind === "IMAGE") ?? media[0] ?? coverMedia;
}

type VariantRailCardProps = {
  variant: PublicProductInspectorVariant;
  coverMedia: PublicProductInspectorMedia | null;
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
};

function getRailScrollState(element: HTMLDivElement): RailScrollState {
  const showButtons = element.scrollWidth - element.clientWidth > 12;

  if (!showButtons) {
    return {
      showButtons: false,
      canScrollLeft: false,
      canScrollRight: false,
    };
  }

  return {
    showButtons: true,
    canScrollLeft: element.scrollLeft > 12,
    canScrollRight: element.scrollLeft + element.clientWidth < element.scrollWidth - 12,
  };
}

function VariantRailCard({
  variant,
  coverMedia,
  isActive,
  onClick,
}: VariantRailCardProps) {
  const previewMedia = getVariantPreviewMedia(variant, coverMedia);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-[85vw] max-w-[18rem] sm:w-72 shrink-0 min-w-[15rem] snap-start overflow-hidden rounded-[1.4rem] border bg-white text-left transition",
        isActive
          ? "border-cobam-water-blue ring-2 ring-cobam-water-blue/25"
          : "border-slate-200 hover:border-slate-300",
      )}
      data-variant-id={variant.id}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <MediaFrame isThumbnail={true} media={previewMedia} />
      </div>
      <div className="p-4">
        <p className="text-base font-semibold text-cobam-dark-blue">{variant.name}</p>
        <p className="text-sm text-slate-500">{variant.sku}</p>
      </div>
    </button>
  );
}

interface VariantRailProps {
    selectedVariantId: number | null;
    variants: PublicProductInspectorVariant[];
    coverMedia: PublicProductInspectorMedia | null;
    selectVariant: (id: number) => void
}

export default function VariantRail({
    selectedVariantId,
    variants, 
    coverMedia, 
    selectVariant
}: VariantRailProps){
    const [variantRailState, setVariantRailState] = useState<RailScrollState>({
        showButtons: false,
        canScrollLeft: false,
        canScrollRight: false,
    });
    const variantRailRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const hasDragged = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        hasDragged.current = false;
        startX.current = e.pageX - variantRailRef.current!.offsetLeft;
        scrollLeft.current = variantRailRef.current!.scrollLeft;
        variantRailRef.current!.style.scrollBehavior = 'auto';
        variantRailRef.current!.style.cursor = 'grabbing';
    };

    const onMouseLeave = () => {
        isDragging.current = false;
        if (variantRailRef.current) {
            variantRailRef.current!.style.scrollBehavior = 'smooth';
            variantRailRef.current!.style.cursor = '';
        }
    };

    const onMouseUp = () => {
        isDragging.current = false;
        if (variantRailRef.current) {
            variantRailRef.current!.style.scrollBehavior = 'smooth';
            variantRailRef.current!.style.cursor = '';
        }
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const x = e.pageX - variantRailRef.current!.offsetLeft;
        const walk = (x - startX.current) * 2; 
        if (Math.abs(walk) > 5) {
           hasDragged.current = true;
        }
        if (variantRailRef.current) {
            variantRailRef.current!.scrollLeft = scrollLeft.current - walk;
        }
    };

    useEffect(() => {
        const railElement = variantRailRef.current;

        if (!railElement) {
        return;
        }

        let frameId = 0;

        const updateRailState = () => {
        const nextState = getRailScrollState(railElement);

        setVariantRailState((currentState) => {
            if (
            currentState.showButtons === nextState.showButtons &&
            currentState.canScrollLeft === nextState.canScrollLeft &&
            currentState.canScrollRight === nextState.canScrollRight
            ) {
            return currentState;
            }

            return nextState;
        });
        };

        const requestUpdate = () => {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(updateRailState);
        };

        const resizeObserver = new ResizeObserver(() => {
        requestUpdate();
        });

        resizeObserver.observe(railElement);
        railElement.addEventListener("scroll", requestUpdate, { passive: true });
        requestUpdate();

        return () => {
        cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        railElement.removeEventListener("scroll", requestUpdate);
        };
    }, [variants.length]);

    const activeIndex = useMemo(() => {
        const index = variants.findIndex((variant) => variant.id === selectedVariantId);
        return index >= 0 ? index : 0;
    }, [selectedVariantId, variants]);

    const scrollToIndex = useCallback(
        (index: number) => {
            const railElement = variantRailRef.current;
            if (!railElement) {
                return;
            }

            const target = railElement.querySelector<HTMLElement>(
                `[data-variant-id="${variants[index]?.id ?? ""}"]`,
            );
            if (!target) {
                return;
            }

            requestAnimationFrame(() => {
                target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            });
        },
        [variants],
    );

    useEffect(() => {
        if (!variantRailState.showButtons) {
            return;
        }
        scrollToIndex(activeIndex);
    }, [activeIndex, scrollToIndex, variantRailState.showButtons]);

    const scrollVariantRail = (direction: "left" | "right") => {
        const nextIndex =
            direction === "left"
                ? Math.max(0, activeIndex - 1)
                : Math.min(variants.length - 1, activeIndex + 1);

        if (nextIndex === activeIndex) {
            return;
        }

        selectVariant(variants[nextIndex].id);
    };

    return <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Variantes
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-cobam-dark-blue">
            Choisir une variante
            </h2>
        </div>

        
        </div>

                <div className="relative group/carousel -mx-2 px-2">
            {variantRailState.showButtons && variantRailState.canScrollLeft ? (
                <AnimatedUIButton
                    variant="light"
                    size="sm"
                    onClick={() => { const el = variantRailRef.current; el && el.scrollBy({ left: -300, behavior: 'smooth' }); }}
                    className="absolute left-0 top-1/2 z-10 h-10 w-10 min-h-0 -translate-y-1/2 rounded-full shadow-md opacity-0 transition-opacity duration-300 group-hover/carousel:opacity-100 hidden sm:inline-flex border-slate-200 bg-white/95 backdrop-blur px-0 py-0"
                    textClassName="inline-flex items-center justify-center p-0"
                    aria-label="Variantes precedentes"
                    icon="chevron-left"
                />
            ) : null}

            <div
                ref={variantRailRef}
                className={cn(
                    "flex gap-4 p-2 pr-1 scroll-smooth snap-x snap-mandatory overflow-x-auto select-none",
                    "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-4 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
                )}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
            >
                {variants.map((v) => (
                    <VariantRailCard
                        key={v.id}
                        variant={v}
                        coverMedia={coverMedia}
                        isActive={selectedVariantId !== null && v.id === selectedVariantId}
                        onClick={(e) => {
                            if (hasDragged.current) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                            }
                            selectVariant(v.id);
                        }}
                    />
                ))}
            </div>

            {variantRailState.showButtons && variantRailState.canScrollRight ? (
                <AnimatedUIButton
                    variant="light"
                    size="sm"
                    onClick={() => { const el = variantRailRef.current; el && el.scrollBy({ left: 300, behavior: 'smooth' }); }}
                    className="absolute right-0 top-1/2 z-10 h-10 w-10 min-h-0 -translate-y-1/2 rounded-full shadow-md opacity-0 transition-opacity duration-300 group-hover/carousel:opacity-100 hidden sm:inline-flex border-slate-200 bg-white/95 backdrop-blur px-0 py-0"
                    textClassName="inline-flex items-center justify-center p-0"
                    aria-label="Variantes suivantes"
                    icon="chevron-right"
                />
            ) : null}
        </div>
    </section>
}
