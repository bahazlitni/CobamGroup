"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { getArticlePlainText } from "@/features/articles/document";
import PublicRichText from "@/components/public/articles/public-rich-text";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type PublicProductColorReference,
  type PublicProductFinishReference,
  type PublicProductInspector,
  type PublicProductInspectorMedia,
  type PublicProductInspectorVariant,
} from "@/features/products/public";
import { getProductPriceUnitSymbol } from "@/features/products/price-units";
import { normalizeProductAttributeMetadataName } from "@/features/product-attribute-metadata/normalize";
import { cn } from "@/lib/utils";

type PublicProductInspectorViewProps = {
  product: PublicProductInspector;
  breadcrumb: {
    categoryName: string;
    categorySlug: string;
    subcategoryName: string;
    subcategorySlug: string;
  };
};

type SpecialAttributeKind = "COLOR" | "FINISH";

type VariantSpecialValue = {
  key: string;
  label: string;
};

type DerivedColorOption = {
  key: string;
  label: string;
  reference: PublicProductColorReference | null;
};

type DerivedFinishOption = {
  key: string;
  label: string;
  reference: PublicProductFinishReference | null;
};

type NormalAttributeOption = {
  key: string;
  label: string;
};

type NormalAttributeGroup = {
  attributeId: number;
  name: string;
  unit: string | null;
  options: NormalAttributeOption[];
};

type CarouselProps = {
  media: PublicProductInspectorMedia[];
  title: string;
};

type VariantRailCardProps = {
  variant: PublicProductInspectorVariant;
  coverMedia: PublicProductInspectorMedia | null;
  isActive: boolean;
  onSelect: () => void;
};

type SelectorPillProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

type RailScrollState = {
  showButtons: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

function normalizeComparableValue(value: string | null | undefined) {
  return normalizeProductAttributeMetadataName(value ?? "");
}

function resolveInitialVariantId(product: PublicProductInspector) {
  return product.defaultVariantId ?? product.variants[0]?.id ?? null;
}

function getVariantSpecialValue(
  variant: PublicProductInspectorVariant | null,
  kind: SpecialAttributeKind,
): VariantSpecialValue | null {
  if (!variant) {
    return null;
  }

  const attribute = variant.attributes.find((entry) => entry.specialType === kind);

  if (!attribute) {
    return null;
  }

  return {
    key: normalizeComparableValue(attribute.value),
    label: attribute.value,
  };
}

function getVariantAttributeValue(
  variant: PublicProductInspectorVariant,
  attributeId: number,
) {
  return variant.attributes.find(
    (attribute) => attribute.attributeId === attributeId && attribute.specialType == null,
  );
}

function getVariantMedia(
  variant: PublicProductInspectorVariant | null,
  coverMedia: PublicProductInspectorMedia | null,
) {
  if (variant?.media.length) {
    return variant.media;
  }

  return coverMedia ? [coverMedia] : [];
}

function getVariantPreviewMedia(
  variant: PublicProductInspectorVariant,
  coverMedia: PublicProductInspectorMedia | null,
) {
  const media = getVariantMedia(variant, coverMedia);

  return media.find((entry) => entry.kind === "IMAGE") ?? media[0] ?? coverMedia;
}

function buildColorOptions(product: PublicProductInspector) {
  const references = new Map(
    product.colorReferences.map((reference) => [reference.key, reference]),
  );
  const options = new Map<string, DerivedColorOption>();

  for (const variant of product.variants) {
    const value = getVariantSpecialValue(variant, "COLOR");

    if (!value || options.has(value.key)) {
      continue;
    }

    options.set(value.key, {
      key: value.key,
      label: value.label,
      reference: references.get(value.key) ?? null,
    });
  }

  return [...options.values()];
}

function buildFinishOptions(product: PublicProductInspector) {
  const references = new Map(
    product.finishReferences.map((reference) => [reference.key, reference]),
  );
  const options = new Map<string, DerivedFinishOption>();

  for (const variant of product.variants) {
    const value = getVariantSpecialValue(variant, "FINISH");

    if (!value || options.has(value.key)) {
      continue;
    }

    options.set(value.key, {
      key: value.key,
      label: value.label,
      reference: references.get(value.key) ?? null,
    });
  }

  return [...options.values()];
}

function buildNormalAttributeGroups(product: PublicProductInspector) {
  const groups = new Map<number, NormalAttributeGroup>();

  for (const variant of product.variants) {
    for (const attribute of variant.attributes) {
      if (attribute.specialType != null) {
        continue;
      }

      const existingGroup = groups.get(attribute.attributeId);

      if (!existingGroup) {
        groups.set(attribute.attributeId, {
          attributeId: attribute.attributeId,
          name: attribute.name,
          unit: attribute.unit,
          options: [
            {
              key: normalizeComparableValue(attribute.value),
              label: attribute.value,
            },
          ],
        });
        continue;
      }

      const optionKey = normalizeComparableValue(attribute.value);

      if (existingGroup.options.some((option) => option.key === optionKey)) {
        continue;
      }

      existingGroup.options.push({
        key: optionKey,
        label: attribute.value,
      });
    }
  }

  return [...groups.values()];
}

function findVariantBySpecialValues(
  variants: PublicProductInspectorVariant[],
  filters: {
    colorKey?: string | null;
    finishKey?: string | null;
  },
) {
  return (
    variants.find((variant) => {
      const colorValue = getVariantSpecialValue(variant, "COLOR");
      const finishValue = getVariantSpecialValue(variant, "FINISH");

      if (filters.colorKey && colorValue?.key !== filters.colorKey) {
        return false;
      }

      if (filters.finishKey && finishValue?.key !== filters.finishKey) {
        return false;
      }

      return true;
    }) ?? null
  );
}

function findVariantByNormalAttribute(
  variants: PublicProductInspectorVariant[],
  attributeId: number,
  valueKey: string,
) {
  return (
    variants.find((variant) => {
      const attribute = getVariantAttributeValue(variant, attributeId);

      return attribute != null && normalizeComparableValue(attribute.value) === valueKey;
    }) ?? null
  );
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

function Carousel({ media, title }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = media[activeIndex] ?? media[0] ?? null;

  if (!activeMedia) {
    return (
      <div className="rounded-[1.75rem] border border-slate-200 bg-white">
        <div className="flex aspect-square items-center justify-center px-8 text-center text-slate-500">
          Aucun media disponible pour cette variante.
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

function SelectorPill({ label, active, onClick }: SelectorPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm font-medium transition",
        active
          ? "border-cobam-dark-blue bg-cobam-dark-blue text-white"
          : "border-slate-200 bg-white text-cobam-dark-blue hover:border-slate-300",
      )}
    >
      {label}
    </button>
  );
}

function ColorBlob({
  option,
  active,
  onClick,
}: {
  option: DerivedColorOption;
  active: boolean;
  onClick: () => void;
}) {
  const hasFailure = option.reference == null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className="rounded-full"
          aria-label={option.label}
        >
          <span
            className={cn(
              "block h-11 w-11 rounded-full border transition",
              active ? "ring-2 ring-cobam-water-blue/25" : "",
              hasFailure ? "border-2 border-red-500 bg-black" : "border-slate-200",
            )}
            style={
              hasFailure
                ? undefined
                : {
                    backgroundColor: option.reference?.hexValue,
                  }
            }
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>{option.label}</TooltipContent>
    </Tooltip>
  );
}

function FinishBlob({
  option,
  active,
  onClick,
}: {
  option: DerivedFinishOption;
  active: boolean;
  onClick: () => void;
}) {
  const hasFailure = option.reference == null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className="rounded-full"
          aria-label={option.label}
        >
          {option.reference?.mediaThumbnailUrl || option.reference?.mediaUrl ? (
            <span
              className={cn(
                "relative block h-12 w-12 overflow-hidden rounded-full border bg-white",
                active ? "ring-2 ring-cobam-water-blue/25" : "",
                hasFailure ? "border-2 border-red-500" : "border-slate-200",
              )}
            >
              <Image
                src={option.reference.mediaThumbnailUrl ?? option.reference.mediaUrl ?? ""}
                alt={option.reference.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </span>
          ) : (
            <span
              className={cn(
                "block h-12 w-12 rounded-full border",
                active ? "ring-2 ring-cobam-water-blue/25" : "",
                hasFailure ? "border-2 border-red-500 bg-black" : "border-slate-200",
              )}
              style={
                hasFailure
                  ? undefined
                  : {
                      backgroundColor: option.reference?.colorHex ?? "#0f172a",
                    }
              }
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{option.label}</TooltipContent>
    </Tooltip>
  );
}

function VariantRailCard({
  variant,
  coverMedia,
  isActive,
  onSelect,
}: VariantRailCardProps) {
  const previewMedia = getVariantPreviewMedia(variant, coverMedia);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "min-w-[14rem] snap-start overflow-hidden rounded-[1.4rem] border bg-white text-left transition",
        isActive
          ? "border-cobam-water-blue ring-2 ring-cobam-water-blue/25"
          : "border-slate-200 hover:border-slate-300",
      )}
      data-variant-id={variant.id}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {previewMedia ? (
          previewMedia.kind === "IMAGE" ? (
            <Image
              src={previewMedia.thumbnailUrl ?? previewMedia.url}
              alt={previewMedia.altText ?? variant.name}
              fill
              sizes="224px"
              className="object-cover"
            />
          ) : previewMedia.kind === "VIDEO" ? (
            <video className="h-full w-full object-cover" muted playsInline preload="metadata">
              <source src={previewMedia.url} type={previewMedia.mimeType ?? undefined} />
            </video>
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
              This media is not supported.
            </div>
          )
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
            Aucun media
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <p className="text-base font-semibold text-cobam-dark-blue">{variant.name}</p>
        <p className="text-sm text-slate-500">{variant.sku}</p>
      </div>
    </button>
  );
}

function CommercialModeAction({
  commercialMode,
}: {
  commercialMode: PublicProductInspectorVariant["commercialMode"];
}) {
  if (commercialMode === "SELLABLE") {
    return (
      <AnimatedUIButton size="md" variant="secondary" onClick={() => undefined}>
        Acheter
      </AnimatedUIButton>
    );
  }

  if (commercialMode === "QUOTE_ONLY") {
    return (
      <AnimatedUIButton size="md" variant="outline" onClick={() => undefined}>
        Demander un devis
      </AnimatedUIButton>
    );
  }

  return (
    <AnimatedUIButton size="md" variant="light" disabled>
      Produit de reference
    </AnimatedUIButton>
  );
}

export default function PublicProductInspectorView({
  product,
  breadcrumb,
}: PublicProductInspectorViewProps) {
  const unitSymbol = getProductPriceUnitSymbol(product.priceUnit);
  const variantRailRef = useRef<HTMLDivElement | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [variantRailState, setVariantRailState] = useState<RailScrollState>({
    showButtons: false,
    canScrollLeft: false,
    canScrollRight: false,
  });

  const selectedVariant =
    product.variants.find(
      (variant) => variant.id === (selectedVariantId ?? resolveInitialVariantId(product)),
    ) ??
    product.variants[0] ??
    null;

  const selectedMedia = getVariantMedia(selectedVariant, product.coverMedia);
  const colorOptions = buildColorOptions(product);
  const finishOptions = buildFinishOptions(product);
  const normalAttributeGroups = buildNormalAttributeGroups(product);
  const selectedColor = getVariantSpecialValue(selectedVariant, "COLOR");
  const selectedFinish = getVariantSpecialValue(selectedVariant, "FINISH");
  const selectedPrice =
    selectedVariant?.priceVisibility === "VISIBLE"
      ? formatPriceParts(selectedVariant.basePriceAmount)
      : null;
  const descriptionPlainText = getArticlePlainText(selectedVariant?.description ?? null);
  const hasLongDescription = descriptionPlainText.length > 420;
  const hasSpecialAttributes = colorOptions.length > 0 || finishOptions.length > 0;
  const shouldShowVariantRail = product.variants.length > 1;
  const selectedVariantKey = selectedVariant?.id ?? null;

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
  }, [product.variants.length]);

  useEffect(() => {
    const railElement = variantRailRef.current;

    if (!railElement || !shouldShowVariantRail || selectedVariantKey == null) {
      return;
    }

    const selectedCard = railElement.querySelector<HTMLElement>(
      `[data-variant-id="${selectedVariantKey}"]`,
    );

    if (!selectedCard) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      selectedCard.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [selectedVariantKey, shouldShowVariantRail]);

  if (!selectedVariant) {
    return null;
  }

  const selectVariant = (variantId: number) => {
    setSelectedVariantId(variantId);
    setIsDescriptionExpanded(false);
  };

  const handleColorSelect = (colorKey: string) => {
    const targetVariant =
      findVariantBySpecialValues(product.variants, {
        colorKey,
        finishKey: selectedFinish?.key ?? null,
      }) ??
      findVariantBySpecialValues(product.variants, {
        colorKey,
      });

    if (targetVariant) {
      selectVariant(targetVariant.id);
    }
  };

  const handleFinishSelect = (finishKey: string) => {
    const targetVariant =
      findVariantBySpecialValues(product.variants, {
        colorKey: selectedColor?.key ?? null,
        finishKey,
      }) ??
      findVariantBySpecialValues(product.variants, {
        finishKey,
      });

    if (targetVariant) {
      selectVariant(targetVariant.id);
    }
  };

  const handleNormalAttributeSelect = (attributeId: number, valueKey: string) => {
    const targetVariant = findVariantByNormalAttribute(product.variants, attributeId, valueKey);

    if (targetVariant) {
      selectVariant(targetVariant.id);
    }
  };

  const copySku = async () => {
    try {
      await copyText(selectedVariant.sku);
      toast.success("Code copié.");
    } catch {
      toast.error("Impossible de copier le code produit.");
    }
  };


  const copyTitle = async () => {
    try {
      await copyText(selectedVariant.name);
      toast.success("Titre copié.");
    } catch {
      toast.error("Impossible de copier le titre produit.");
    }
  };

  const scrollVariantRail = (direction: "left" | "right") => {
    const railElement = variantRailRef.current;

    if (!railElement) {
      return;
    }

    railElement.scrollBy({
      left: (direction === "left" ? -1 : 1) * railElement.clientWidth * 0.82,
      behavior: "smooth",
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(20rem,0.92fr)_minmax(0,1.08fr)]">
        <div>
          <Carousel
            key={`${selectedVariant.id}-${selectedMedia.map((media) => media.id).join("-")}`}
            media={selectedMedia}
            title={selectedVariant.name}
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 sm:p-8">
            <div className="space-y-6">
              <div className="space-y-3">
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

                <div className="space-y-2">
                  <h1 className="w-fit flex flex-wrap items-center gap-3 text-3xl font-semibold tracking-[-0.04em] text-cobam-dark-blue sm:text-4xl">
                    {selectedVariant.name}
                    <AnimatedUIButton
                      size="xs"
                      variant="light"
                      onClick={copyTitle}
                      icon="copy"
                    />
                  </h1>

                  <div className="w-fit flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Code
                    </span>
                    <span className="text-sm font-semibold text-cobam-dark-blue">{selectedVariant.sku}</span>
                    <AnimatedUIButton
                      size="xs"
                      variant="light"
                      onClick={copySku}
                      icon="copy"
                    />
                  </div>

                  { product.brandName && <div className="w-fit flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Marque
                    </span>
                    <span className="text-sm font-semibold text-cobam-water-blue">{product.brandName}</span>
                  </div>}

                  
                </div>
              </div>


              {hasSpecialAttributes ? (
                <div className="space-y-5">
                  {colorOptions.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Couleur
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {colorOptions.map((option) => (
                          <ColorBlob
                            key={option.key}
                            option={option}
                            active={selectedColor?.key === option.key}
                            onClick={() => handleColorSelect(option.key)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {finishOptions.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Finition
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {finishOptions.map((option) => (
                          <FinishBlob
                            key={option.key}
                            option={option}
                            active={selectedFinish?.key === option.key}
                            onClick={() => handleFinishSelect(option.key)}
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
                    {unitSymbol !== "item" ? (
                      <p className="text-sm text-slate-500">Par {unitSymbol}</p>
                    ) : null}
                  </div>

                  <CommercialModeAction commercialMode={selectedVariant.commercialMode} />
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-end">
                  <CommercialModeAction commercialMode={selectedVariant.commercialMode} />
                </div>
              )}

              {selectedVariant.description ? (
                <div className="space-y-3">
                  <div
                    className={cn(
                      "text-slate-600",
                      !isDescriptionExpanded && hasLongDescription ? "max-h-64 overflow-hidden" : "",
                    )}
                  >
                    <PublicRichText
                      content={selectedVariant.description}
                      className="max-w-none"
                    />
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
                  <span className="font-medium text-slate-400">Sous-catégories</span>
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

          {normalAttributeGroups.length > 0 ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 sm:p-8">
              <div className="space-y-5">
                {normalAttributeGroups.map((group) => {
                  const selectedValue = getVariantAttributeValue(selectedVariant, group.attributeId);
                  const selectedKey =
                    selectedValue != null
                      ? normalizeComparableValue(selectedValue.value)
                      : null;

                  return (
                    <div key={group.attributeId} className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm text-slate-500">{group.name}</p>
                        {group.unit ? (
                          <p className="text-xs text-slate-400">{group.unit}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {group.options.map((option) => (
                          <SelectorPill
                            key={`${group.attributeId}-${option.key}`}
                            label={option.label}
                            active={selectedKey === option.key}
                            onClick={() =>
                              handleNormalAttributeSelect(group.attributeId, option.key)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {shouldShowVariantRail ? (
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

            {variantRailState.showButtons ? (
              <div className="flex items-center gap-2">
                <AnimatedUIButton
                  variant="light"
                  size="sm"
                  onClick={() => scrollVariantRail("left")}
                  disabled={!variantRailState.canScrollLeft}
                  className="h-10 w-10 min-h-0 rounded-full px-0 py-0"
                  textClassName="inline-flex items-center justify-center"
                  aria-label="Variantes precedentes"
                  icon="chevron-left"
                />
                <AnimatedUIButton
                  variant="light"
                  size="sm"
                  onClick={() => scrollVariantRail("right")}
                  disabled={!variantRailState.canScrollRight}
                  className="h-10 w-10 min-h-0 rounded-full px-0 py-0"
                  textClassName="inline-flex items-center justify-center"
                  aria-label="Variantes suivantes"
                  icon="chevron-right"
                />
              </div>
            ) : null}
          </div>

          <div className="relative">
            <div
              ref={variantRailRef}
              className={cn(
                "flex gap-4 overflow-x-auto p-2 pr-1 scroll-smooth snap-x snap-mandatory",
                "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                variantRailState.showButtons ? "lg:px-1" : "",
              )}
            >
            {product.variants.map((variant) => (
              <VariantRailCard
                key={variant.id}
                variant={variant}
                coverMedia={product.coverMedia}
                isActive={variant.id === selectedVariant.id}
                onSelect={() => selectVariant(variant.id)}
              />
            ))}
            </div>
          </div>
        </section>
      ) : null}
      </div>
    </TooltipProvider>
  );
}
