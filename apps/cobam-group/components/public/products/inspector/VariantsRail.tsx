"use client";

import {
  PublicProductInspectorMedia,
  PublicProductInspectorVariant,
} from "@/features/products/types";
import { cn } from "@/lib/utils";
import {
  getVariantMedia,
  getVariantSpecialValue,
  normalizeComparableValue,
} from "./utils";
import MediaFrame from "./MediaFrame";
import RailCarousel from "@/components/ui/custom/RailCarousel";
import { useEffect, useMemo, useRef } from "react";

function getVariantAttribute(
  variant: PublicProductInspectorVariant,
  keys: string[],
) {
  const wanted = new Set(keys.map((key) => normalizeComparableValue(key).replace(/\s+/g, "_")));

  return variant.attributes.find((attribute) => {
    const normalizedKeys = [
      attribute.attributeId,
      attribute.name,
      attribute.kind,
    ]
      .filter(Boolean)
      .map((value) => normalizeComparableValue(value).replace(/\s+/g, "_"));

    return normalizedKeys.some((key) => wanted.has(key));
  });
}

function formatOptionLabel(value: string, unit: string | null | undefined) {
  const trimmedValue = value.trim();
  if (!unit) {
    return trimmedValue;
  }

  const normalizedValue = trimmedValue.toLowerCase();
  const normalizedUnit = unit.toLowerCase();

  if (normalizedValue.endsWith(normalizedUnit)) {
    return trimmedValue;
  }

  return `${trimmedValue} ${unit}`;
}

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
  const color = getVariantSpecialValue(variant, "COLOR");
  const packaging = getVariantAttribute(variant, ["packaging_weight_kg", "conditionnement"]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-[78vw] max-w-[17rem] min-w-[14rem] shrink-0 snap-start overflow-hidden rounded-[1.4rem] border bg-white text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobam-water-blue/40 sm:w-64",
        isActive
          ? "border-cobam-dark-blue ring-2 ring-cobam-dark-blue/10"
          : "border-slate-200 hover:border-slate-300",
      )}
      data-variant-id={variant.id}
      aria-pressed={isActive}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
        <MediaFrame isThumbnail={true} media={previewMedia} />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {color?.label ?? "Variante"}
          </span>
          {packaging ? (
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {formatOptionLabel(packaging.value, packaging.unit)}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-cobam-dark-blue">
          {variant.name}
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          SKU {variant.sku}
        </p>
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
      const viewportRect = viewport.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetCenterOffset =
        targetRect.left - viewportRect.left + targetRect.width / 2;
      const nextLeft =
        viewport.scrollLeft + targetCenterOffset - viewport.clientWidth / 2;
      const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

      viewport.scrollTo({
        left: Math.max(0, Math.min(maxLeft, nextLeft)),
        behavior: "smooth",
      });
    });
  }, [activeIndex, variants]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Variantes disponibles
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-cobam-dark-blue">
            Même gamme
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
        previousButtonLabel="Produits de la même gamme precedents"
        nextButtonLabel="Produits de la même gamme suivants"
      >
        {variants.map((variant) => (
          <VariantRailCard
            key={variant.id}
            variant={variant}
            coverMedia={coverMedia}
            isActive={selectedVariantId !== null && variant.id === selectedVariantId}
            onClick={() => selectVariant(variant.id)}
          />
        ))}
      </RailCarousel>
    </section>
  );
}
