"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { getArticlePlainText } from "@/features/articles/document";
import type {
  PublicProductColorReference,
  PublicProductFinishReference,
  PublicProductInspectorAttribute,
  PublicProductInspectorMedia,
  PublicSimpleProductInspector,
} from "@/features/products/public";
import type { PublicProductBreadcrumb } from "@/features/products/public-breadcrumb";
import PublicRichText from "@/components/public/articles/public-rich-text";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type PublicSimpleProductInspectorProps = {
  product: PublicSimpleProductInspector;
  breadcrumb?: PublicProductBreadcrumb | null;
};

function normalizeComparableValue(value: string | null | undefined) {
  return value ?? "";
}

function formatPriceParts(price: string | null) {
  if (!price) {
    return null;
  }

  const numericValue = Number(price);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  const fixed = numericValue.toFixed(3);
  const [integerPartRaw, decimalPartRaw] = fixed.split(".");
  const integerPart = new Intl.NumberFormat("fr-TN", {
    maximumFractionDigits: 0,
  }).format(Number(integerPartRaw));
  const hasDecimals = decimalPartRaw !== "000";

  return {
    integerPart,
    decimalPart: hasDecimals ? decimalPartRaw : null,
  };
}

function copyText(text: string) {
  return navigator.clipboard.writeText(text);
}

function MediaFrame({
  media,
  title,
  priority = false,
}: {
  media: PublicProductInspectorMedia;
  title: string;
  priority?: boolean;
}) {
  if (media.kind === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt={media.altText ?? media.title ?? title}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
    );
  }

  if (media.kind === "VIDEO") {
    return (
      <video
        className="h-full w-full object-cover"
        controls
        playsInline
        preload="metadata"
      >
        <source src={media.url} type={media.mimeType ?? undefined} />
      </video>
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-slate-100 px-8 text-center text-slate-500">
      <div className="space-y-3">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
          <CircleAlert className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium">This media is not supported.</p>
      </div>
    </div>
  );
}

function Carousel({
  media,
  title,
}: {
  media: PublicProductInspectorMedia[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = media[activeIndex] ?? media[0] ?? null;

  if (!activeMedia) {
    return (
      <div className="rounded-[1.75rem] border border-slate-200 bg-white">
        <div className="flex aspect-square items-center justify-center px-8 text-center text-slate-500">
          Aucun media disponible pour ce produit.
        </div>
      </div>
    );
  }

  if (media.length === 1) {
    return (
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          <MediaFrame media={activeMedia} title={title} priority />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          <MediaFrame media={activeMedia} title={title} priority />
        </div>

        <AnimatedUIButton
          variant="light"
          size="sm"
          onClick={() =>
            setActiveIndex((currentIndex) =>
              currentIndex === 0 ? media.length - 1 : currentIndex - 1,
            )
          }
          className="absolute left-3 top-1/2 h-10 w-10 min-h-0 -translate-y-1/2 rounded-full px-0 py-0"
          textClassName="inline-flex items-center justify-center"
          aria-label="Media precedente"
          icon="chevron-left"
        />
        <AnimatedUIButton
          variant="light"
          size="sm"
          onClick={() =>
            setActiveIndex((currentIndex) =>
              currentIndex === media.length - 1 ? 0 : currentIndex + 1,
            )
          }
          className="absolute right-3 top-1/2 h-10 w-10 min-h-0 -translate-y-1/2 rounded-full px-0 py-0"
          textClassName="inline-flex items-center justify-center"
          aria-label="Media suivante"
          icon="chevron-right"
        />
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
        {media.map((entry, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "overflow-hidden rounded-[1rem] border bg-white transition",
                isActive
                  ? "border-cobam-dark-blue"
                  : "border-slate-200 hover:border-slate-300",
              )}
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                {entry.kind === "IMAGE" ? (
                  <Image
                    src={entry.thumbnailUrl ?? entry.url}
                    alt={entry.altText ?? entry.title ?? title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : entry.kind === "VIDEO" ? (
                  <div className="flex h-full items-center justify-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Video
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Fichier
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CommercialModeAction({
  commercialMode,
}: {
  commercialMode: PublicSimpleProductInspector["commercialMode"];
}) {
  if (commercialMode === "ONLINE_ONLY" || commercialMode === "ON_REQUEST_OR_ONLINE") {
    return (
      <AnimatedUIButton size="md" variant="secondary" onClick={() => undefined}>
        Acheter
      </AnimatedUIButton>
    );
  }

  if (commercialMode === "ON_REQUEST_ONLY") {
    return (
      <AnimatedUIButton size="md" variant="outline" onClick={() => undefined}>
        Demander
      </AnimatedUIButton>
    );
  }

  return (
    <AnimatedUIButton size="md" variant="light" disabled>
      Produit de reference
    </AnimatedUIButton>
  );
}

function buildSpecialOptions(input: {
  attributes: PublicProductInspectorAttribute[];
  colorReferences: PublicProductColorReference[];
  finishReferences: PublicProductFinishReference[];
}) {
  const colors = input.attributes
    .filter((attribute) => attribute.specialType === "COLOR")
    .map((attribute) => {
      const key = normalizeComparableValue(attribute.value);
      return {
        key,
        label: attribute.value,
        reference: input.colorReferences.find((reference) => reference.key === key) ?? null,
      };
    });

  const finishes = input.attributes
    .filter((attribute) => attribute.specialType === "FINISH")
    .map((attribute) => {
      const key = normalizeComparableValue(attribute.value);
      return {
        key,
        label: attribute.value,
        reference: input.finishReferences.find((reference) => reference.key === key) ?? null,
      };
    });

  return {
    colors,
    finishes,
  };
}

function ColorBlob({
  label,
  reference,
}: {
  label: string;
  reference: PublicProductColorReference | null;
}) {
  const hasFailure = reference == null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "block h-11 w-11 rounded-full border",
            hasFailure ? "border-2 border-red-500 bg-black" : "border-slate-200",
          )}
          aria-label={label}
          style={
            hasFailure
              ? undefined
              : {
                  backgroundColor: reference?.hexValue ?? undefined,
                }
          }
        />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function FinishBlob({
  label,
  reference,
}: {
  label: string;
  reference: PublicProductFinishReference | null;
}) {
  const hasFailure = reference == null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {reference?.mediaThumbnailUrl || reference?.mediaUrl ? (
          <span
            className={cn(
              "relative block h-12 w-12 overflow-hidden rounded-full border bg-white",
              hasFailure ? "border-2 border-red-500" : "border-slate-200",
            )}
            aria-label={label}
          >
            <Image
              src={reference.mediaThumbnailUrl ?? reference.mediaUrl ?? ""}
              alt={reference.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </span>
        ) : (
          <span
            className={cn(
              "block h-12 w-12 rounded-full border",
              hasFailure ? "border-2 border-red-500 bg-black" : "border-slate-200",
            )}
            aria-label={label}
            style={
              hasFailure
                ? undefined
                : {
                    backgroundColor: reference?.colorHex ?? "#0f172a",
                  }
            }
          />
        )}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export default function PublicSimpleProductInspector({
  product,
  breadcrumb,
}: PublicSimpleProductInspectorProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const selectedPrice = product.priceVisibility
    ? formatPriceParts(product.basePriceAmount)
    : null;
  const normalAttributes = product.attributes.filter((attribute) => attribute.specialType == null);
  const { colors, finishes } = buildSpecialOptions(product);
  const descriptionPlainText = getArticlePlainText(product.description ?? null);
  const hasLongDescription = descriptionPlainText.length > 420;
  const brandLabel = product.brandNames.join(" · ");

  const copySku = async () => {
    try {
      await copyText(product.sku);
      toast.success("SKU copie.");
    } catch {
      toast.error("Impossible de copier le SKU produit.");
    }
  };

  return (
    <TooltipProvider>
      <div className="grid gap-6 lg:grid-cols-[minmax(20rem,0.92fr)_minmax(0,1.08fr)]">
        <div>
          <Carousel media={product.media} title={product.name} />
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 sm:p-8">
            <div className="space-y-6">
              <div className="space-y-3">
                {breadcrumb ? (
                  <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                    <Link href="/produits" className="transition hover:text-cobam-water-blue">
                      Produits
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                    <Link
                      href={`/produits/${breadcrumb.categorySlug}`}
                      className="transition hover:text-cobam-water-blue"
                    >
                      {breadcrumb.categoryName}
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                    <Link
                      href={`/produits/${breadcrumb.categorySlug}/${breadcrumb.subcategorySlug}`}
                      className="transition hover:text-cobam-water-blue"
                    >
                      {breadcrumb.subcategoryName}
                    </Link>
                  </div>
                ) : null}

                <div className="space-y-2">
                  {brandLabel ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cobam-water-blue">
                      {brandLabel}
                    </p>
                  ) : null}

                  <h1 className="text-3xl font-semibold tracking-[-0.04em] text-cobam-dark-blue sm:text-4xl">
                    {product.name}
                  </h1>

                  <div className="flex w-fit flex-wrap items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      SKU
                    </span>
                    <span className="text-sm font-semibold text-cobam-dark-blue">{product.sku}</span>
                    <AnimatedUIButton
                      size="xs"
                      variant="light"
                      onClick={copySku}
                      icon="copy"
                    />
                  </div>
                </div>
              </div>

              {colors.length > 0 || finishes.length > 0 ? (
                <div className="space-y-5">
                  {colors.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Couleur
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {colors.map((color) => (
                          <ColorBlob
                            key={color.key}
                            label={color.label}
                            reference={color.reference}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {finishes.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Finition
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {finishes.map((finish) => (
                          <FinishBlob
                            key={finish.key}
                            label={finish.label}
                            reference={finish.reference}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {selectedPrice ? (
                <div className="flex flex-wrap items-end justify-between gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Prix
                    </p>
                    <div className="flex items-start gap-1 text-cobam-dark-blue">
                      <span className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                        {selectedPrice.integerPart}
                      </span>
                      {selectedPrice.decimalPart ? (
                        <span className="pt-1 text-lg font-semibold tracking-[-0.03em] text-slate-500">
                          ,{selectedPrice.decimalPart}
                        </span>
                      ) : null}
                      <span className="pt-2 text-sm font-medium text-slate-500">TND</span>
                    </div>
                  </div>

                  <CommercialModeAction commercialMode={product.commercialMode} />
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-end">
                  <CommercialModeAction commercialMode={product.commercialMode} />
                </div>
              )}

              {product.description ? (
                <div className="space-y-3">
                  <div
                    className={cn(
                      "text-slate-600",
                      !isDescriptionExpanded && hasLongDescription ? "max-h-64 overflow-hidden" : "",
                    )}
                  >
                    <PublicRichText content={product.description} className="max-w-none" />
                  </div>
                  {hasLongDescription ? (
                    <AnimatedUIButton
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsDescriptionExpanded((current) => !current)}
                      className="-ml-3 w-fit"
                    >
                      {isDescriptionExpanded ? "Afficher moins" : "Afficher plus"}
                    </AnimatedUIButton>
                  ) : null}
                </div>
              ) : null}

              {product.subcategories.length > 0 ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                  <span className="font-medium text-slate-400">Sous-categories</span>
                  {product.subcategories.map((subcategory) => (
                    <Link
                      key={`${subcategory.categorySlug}-${subcategory.slug}`}
                      href={`/produits/${subcategory.categorySlug}/${subcategory.slug}`}
                      className="transition hover:text-cobam-water-blue"
                    >
                      {subcategory.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {normalAttributes.length > 0 ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 sm:p-8">
              <div className="space-y-4">
                {normalAttributes.map((attribute) => (
                  <div
                    key={attribute.attributeId}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm"
                  >
                    <span className="text-slate-500">{attribute.name}</span>
                    <span className="font-semibold text-cobam-dark-blue">{attribute.value}</span>
                    {attribute.unit ? (
                      <span className="text-slate-400">{attribute.unit}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </TooltipProvider>
  );
}
