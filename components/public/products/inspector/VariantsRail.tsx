"use client";

import { PublicProductInspectorMedia, PublicProductInspectorVariant } from "@/features/products/types";
import { cn } from "@/lib/utils";
import { getVariantMedia } from "./utils";
import MediaFrame from "./MediaFrame";
import RailCarousel from "@/components/ui/custom/RailCarousel";
import { useEffect, useMemo, useRef } from "react";

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
  onClick: () => void;
};

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
        "w-[85vw] max-w-[18rem] min-w-[15rem] shrink-0 snap-start overflow-hidden rounded-[1.4rem] border bg-white text-left transition sm:w-72",
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
  selectVariant: (id: number) => void;
}

export default function VariantRail({
  selectedVariantId,
  variants,
  coverMedia,
  selectVariant,
}: VariantRailProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const activeIndex = useMemo(() => {
    const index = variants.findIndex((variant) => variant.id === selectedVariantId);
    return index >= 0 ? index : 0;
  }, [selectedVariantId, variants]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const target = viewport.querySelector<HTMLElement>(
      `[data-variant-id="${variants[activeIndex]?.id ?? ""}"]`,
    );

    if (!target) {
      return;
    }

    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  }, [activeIndex, variants]);

  return (
    <section className="space-y-4">
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

      <RailCarousel
        viewportRef={viewportRef}
        autoScroll={false}
        showButtons="on-hover"
        allowDrag={true}
        applyPhysics={true}
        modularScroll={false}
        className="-mx-2 px-2"
        viewportClassName="p-2 pb-4 pr-1"
        trackClassName="gap-4"
        previousButtonLabel="Variantes precedentes"
        nextButtonLabel="Variantes suivantes"
      >
        {variants.map((variant) => (
          <VariantRailCard
            key={variant.id}
            variant={variant}
            coverMedia={coverMedia}
            isActive={selectedVariantId !== null && variant.id === selectedVariantId}
            onClick={() => { console.log("Hello!"); selectVariant(variant.id)}}
          />
        ))}
      </RailCarousel>
    </section>
  );
}
