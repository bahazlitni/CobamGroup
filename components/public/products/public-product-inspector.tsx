"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CircleAlert } from "lucide-react";
import type {
  PublicProductInspector,
  PublicProductInspectorMedia,
  PublicProductInspectorVariant,
} from "@/features/products/public";
import { getProductPriceUnitSymbol } from "@/features/products/price-units";
import { cn } from "@/lib/utils";

type PublicProductInspectorProps = {
  product: PublicProductInspector;
};

type SpecialAttributeOption = {
  key: string;
  label: string;
  colorHex: string | null;
  mediaUrl: string | null;
  mediaThumbnailUrl: string | null;
  variantIds: number[];
  isResolved: boolean;
};

type SpecialAttributeGroup = {
  attributeId: number;
  name: string;
  type: "COLOR" | "FINISH";
  options: SpecialAttributeOption[];
};

function normalizeLookupKey(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fr-FR");
}

function formatPrice(value: string | null) {
  if (!value) {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return `${value} TND`;
  }

  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function formatAttributeValue(value: string) {
  if (value === "true") {
    return "Oui";
  }

  if (value === "false") {
    return "Non";
  }

  return value;
}

function getVariantFirstImageMedia(variant: PublicProductInspectorVariant) {
  return variant.media.find((media) => media.kind === "IMAGE") ?? null;
}

function getRenderableMedia(
  product: PublicProductInspector,
  variant: PublicProductInspectorVariant,
) {
  if (variant.media.length > 0) {
    return variant.media;
  }

  return product.coverMedia != null ? [product.coverMedia] : [];
}

function getVariantAttributeValue(
  variant: PublicProductInspectorVariant,
  attributeId: number,
) {
  const match = variant.attributes.find(
    (attribute) => attribute.attributeId === attributeId,
  );

  return match?.value ?? null;
}

function buildSpecialAttributeGroups(
  product: PublicProductInspector,
): SpecialAttributeGroup[] {
  const colorLookup = new Map(
    product.colorReferences.map((reference) => [reference.key, reference]),
  );
  const finishLookup = new Map(
    product.finishReferences.map((reference) => [reference.key, reference]),
  );
  const groupsByAttributeId = new Map<number, SpecialAttributeGroup>();

  for (const variant of product.variants) {
    for (const attribute of variant.attributes) {
      if (attribute.specialType == null) {
        continue;
      }

      const normalizedValue = normalizeLookupKey(attribute.value);

      if (!normalizedValue) {
        continue;
      }

      let group = groupsByAttributeId.get(attribute.attributeId);

      if (!group) {
        group = {
          attributeId: attribute.attributeId,
          name: attribute.name,
          type: attribute.specialType,
          options: [],
        };
        groupsByAttributeId.set(attribute.attributeId, group);
      }

      const existingOption = group.options.find(
        (option) => option.key === normalizedValue,
      );

      if (existingOption) {
        if (!existingOption.variantIds.includes(variant.id)) {
          existingOption.variantIds.push(variant.id);
        }

        continue;
      }

      const colorReference =
        attribute.specialType === "COLOR"
          ? colorLookup.get(normalizedValue) ?? null
          : null;
      const finishReference =
        attribute.specialType === "FINISH"
          ? finishLookup.get(normalizedValue) ?? null
          : null;

      group.options.push({
        key: normalizedValue,
        label: attribute.value,
        colorHex:
          attribute.specialType === "COLOR"
            ? colorReference?.hexValue ?? null
            : finishReference?.colorHex ?? null,
        mediaUrl: finishReference?.mediaUrl ?? null,
        mediaThumbnailUrl: finishReference?.mediaThumbnailUrl ?? null,
        variantIds: [variant.id],
        isResolved:
          attribute.specialType === "COLOR"
            ? colorReference != null
            : finishReference != null,
      });
    }
  }

  return [...groupsByAttributeId.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "fr-FR", { sensitivity: "base" }),
  );
}

function InspectorMediaSlide({
  media,
  label,
}: {
  media: PublicProductInspectorMedia;
  label: string;
}) {
  if (media.kind === "IMAGE") {
    return (
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-white">
        <Image
          src={media.url}
          alt={media.altText ?? label}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain"
          priority
        />
      </div>
    );
  }

  if (media.kind === "VIDEO") {
    return (
      <div className="aspect-[5/4] w-full overflow-hidden bg-slate-950">
        <video
          controls
          preload="metadata"
          className="h-full w-full object-contain"
          src={media.url}
        >
          Votre navigateur ne peut pas lire cette video.
        </video>
      </div>
    );
  }

  return (
    <div className="flex aspect-[5/4] w-full items-center justify-center bg-slate-100 px-6 text-center text-sm font-medium text-slate-500">
      This media is not supported.
    </div>
  );
}

function ColorOptionButton({
  option,
  selected,
  onClick,
}: {
  option: SpecialAttributeOption;
  selected: boolean;
  onClick: () => void;
}) {
  const hasFailure = !option.isResolved;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2 text-center"
      aria-pressed={selected}
    >
      <span
        className={cn(
          "h-12 w-12 rounded-full border-2 transition-all duration-200",
          selected
            ? "scale-105 border-cobam-water-blue ring-4 ring-cobam-water-blue/15"
            : "border-slate-300 group-hover:border-cobam-water-blue/50",
          hasFailure ? "border-red-500 ring-2 ring-red-200" : null,
        )}
        style={{
          backgroundColor: option.isResolved ? option.colorHex ?? "#000000" : "#000000",
        }}
      />
      <span
        className={cn(
          "max-w-20 text-xs font-medium",
          selected ? "text-cobam-dark-blue" : "text-slate-500",
        )}
      >
        {option.label}
      </span>
    </button>
  );
}

function FinishOptionButton({
  option,
  selected,
  onClick,
}: {
  option: SpecialAttributeOption;
  selected: boolean;
  onClick: () => void;
}) {
  const [hasImageError, setHasImageError] = useState(!option.mediaThumbnailUrl);
  const hasFailure = !option.isResolved || hasImageError;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2 text-center"
      aria-pressed={selected}
    >
      <span
        className={cn(
          "relative h-12 w-12 overflow-hidden rounded-full border-2 transition-all duration-200",
          selected
            ? "scale-105 border-cobam-water-blue ring-4 ring-cobam-water-blue/15"
            : "border-slate-300 group-hover:border-cobam-water-blue/50",
          hasFailure ? "border-red-500 ring-2 ring-red-200" : null,
        )}
        style={{
          backgroundColor: option.colorHex ?? "#000000",
        }}
      >
        {option.mediaThumbnailUrl && !hasImageError ? (
          <Image
            src={option.mediaThumbnailUrl}
            alt={option.label}
            fill
            sizes="48px"
            className="object-cover"
            onError={() => setHasImageError(true)}
          />
        ) : null}
      </span>
      <span
        className={cn(
          "max-w-24 text-xs font-medium",
          selected ? "text-cobam-dark-blue" : "text-slate-500",
        )}
      >
        {option.label}
      </span>
    </button>
  );
}

export default function PublicProductInspectorView({
  product,
}: PublicProductInspectorProps) {
  const initialVariantId = product.defaultVariantId ?? product.variants[0]?.id ?? 0;
  const [selectedVariantId, setSelectedVariantId] = useState<number>(
    initialVariantId,
  );
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const specialAttributeGroups = useMemo(
    () => buildSpecialAttributeGroups(product),
    [product],
  );

  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    product.variants[0];

  if (!selectedVariant) {
    return null;
  }

  const renderableMedia = getRenderableMedia(product, selectedVariant);
  const safeMediaIndex =
    renderableMedia.length > 0
      ? Math.min(activeMediaIndex, renderableMedia.length - 1)
      : 0;
  const activeMedia = renderableMedia[safeMediaIndex] ?? null;
  const normalAttributes = selectedVariant.attributes.filter(
    (attribute) => attribute.specialType == null,
  );
  const selectedDescription =
    selectedVariant.description || product.description || product.descriptionSeo;
  const selectedPrice =
    selectedVariant.priceVisibility === "VISIBLE"
      ? formatPrice(selectedVariant.basePriceAmount)
      : null;
  const priceUnitSymbol = getProductPriceUnitSymbol(product.priceUnit);

  const handleSpecialAttributeSelect = (
    group: SpecialAttributeGroup,
    option: SpecialAttributeOption,
  ) => {
    const desiredValues = new Map<number, string>();

    for (const specialGroup of specialAttributeGroups) {
      const currentValue = getVariantAttributeValue(selectedVariant, specialGroup.attributeId);

      if (currentValue) {
        desiredValues.set(
          specialGroup.attributeId,
          normalizeLookupKey(currentValue),
        );
      }
    }

    desiredValues.set(group.attributeId, option.key);

    const exactMatch = product.variants.find((variant) => {
      for (const [attributeId, desiredValue] of desiredValues.entries()) {
        const candidateValue = getVariantAttributeValue(variant, attributeId);

        if (normalizeLookupKey(candidateValue) !== desiredValue) {
          return false;
        }
      }

      return true;
    });

    if (exactMatch) {
      setSelectedVariantId(exactMatch.id);
      setActiveMediaIndex(0);
      return;
    }

    const directMatch = product.variants.find((variant) =>
      option.variantIds.includes(variant.id),
    );

    if (directMatch) {
      setSelectedVariantId(directMatch.id);
      setActiveMediaIndex(0);
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <div className="overflow-hidden rounded-[32px] border border-slate-300 bg-white shadow-sm">
          <div className="relative">
            {activeMedia ? (
              <InspectorMediaSlide
                media={activeMedia}
                label={selectedVariant.name || product.name}
              />
            ) : (
              <div className="flex aspect-[5/4] items-center justify-center bg-gradient-to-br from-cobam-light-bg via-white to-cobam-light-bg px-8 text-center text-sm font-semibold text-cobam-dark-blue">
                {selectedVariant.name || product.name}
              </div>
            )}

            {renderableMedia.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveMediaIndex((current) =>
                      current === 0 ? renderableMedia.length - 1 : current - 1,
                    )
                  }
                  className="absolute top-1/2 left-4 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-cobam-dark-blue shadow-lg transition hover:bg-white"
                  aria-label="Media precedent"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveMediaIndex((current) =>
                      current === renderableMedia.length - 1 ? 0 : current + 1,
                    )
                  }
                  className="absolute top-1/2 right-4 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-cobam-dark-blue shadow-lg transition hover:bg-white"
                  aria-label="Media suivant"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}
          </div>

          {renderableMedia.length > 1 ? (
            <div className="flex items-center justify-center gap-2 border-t border-slate-200 px-5 py-4">
              {renderableMedia.map((media, index) => (
                <button
                  key={`${media.id}-${index}`}
                  type="button"
                  onClick={() => setActiveMediaIndex(index)}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-200",
                    index === safeMediaIndex
                      ? "w-8 bg-cobam-water-blue"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400",
                  )}
                  aria-label={`Afficher le media ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 rounded-[32px] border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-3">
            {product.subtitle ? (
              <p className="text-xs font-semibold tracking-[0.28em] text-cobam-water-blue uppercase">
                {product.subtitle}
              </p>
            ) : null}

            <h1
              className="text-4xl font-bold leading-tight text-cobam-dark-blue sm:text-5xl"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {product.name}
            </h1>

            {specialAttributeGroups.length > 0 ? (
              <div className="space-y-4 pt-2">
                {specialAttributeGroups.map((group) => {
                  const currentValue = normalizeLookupKey(
                    getVariantAttributeValue(selectedVariant, group.attributeId),
                  );

                  return (
                    <div key={group.attributeId} className="space-y-3">
                      <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                        {group.name}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {group.options.map((option) =>
                          group.type === "COLOR" ? (
                            <ColorOptionButton
                              key={option.key}
                              option={option}
                              selected={option.key === currentValue}
                              onClick={() =>
                                handleSpecialAttributeSelect(group, option)
                              }
                            />
                          ) : (
                            <FinishOptionButton
                              key={option.key}
                              option={option}
                              selected={option.key === currentValue}
                              onClick={() =>
                                handleSpecialAttributeSelect(group, option)
                              }
                            />
                          ),
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            {selectedVariant.name && selectedVariant.name !== product.name ? (
              <p className="text-lg font-semibold text-slate-600">
                {selectedVariant.name}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="font-medium">SKU {selectedVariant.sku}</span>
              {product.brandName ? (
                <span className="rounded-full bg-cobam-light-bg px-3 py-1 font-medium text-cobam-dark-blue">
                  {product.brandName}
                </span>
              ) : null}
            </div>

            {selectedPrice ? (
              <div className="space-y-1">
                <p className="text-3xl font-bold text-cobam-dark-blue">
                  {selectedPrice}
                </p>
                <p className="text-sm text-slate-500">Prix par {priceUnitSymbol}</p>
              </div>
            ) : null}

            {selectedDescription ? (
              <p className="text-base leading-8 text-slate-600">
                {selectedDescription}
              </p>
            ) : null}
          </div>

          {normalAttributes.length > 0 ? (
            <div className="grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
              {normalAttributes.map((attribute) => (
                <div
                  key={`${selectedVariant.id}-${attribute.attributeId}`}
                  className="rounded-2xl bg-cobam-light-bg/70 px-4 py-3"
                >
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    {attribute.name}
                  </p>
                  <p className="mt-2 text-lg font-bold text-cobam-dark-blue">
                    {formatAttributeValue(attribute.value)}
                  </p>
                  {attribute.unit ? (
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {attribute.unit}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {(product.colorReferences.length > 0 || product.finishReferences.length > 0) &&
          specialAttributeGroups.some((group) =>
            group.options.some((option) => !option.isResolved),
          ) ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Certaines couleurs ou finitions n&apos;ont pas ete trouvees dans la
                bibliotheque. Elles apparaissent avec un contour rouge pour signaler
                l&apos;ecart.
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.28em] text-cobam-water-blue uppercase">
              Variantes
            </p>
            <h2
              className="text-3xl font-bold text-cobam-dark-blue"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Choisir une variante
            </h2>
          </div>

          <p className="text-sm font-medium text-slate-500">
            {product.variants.length} variante{product.variants.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {product.variants.map((variant) => {
            const cardImage = getVariantFirstImageMedia(variant);
            const selected = variant.id === selectedVariant.id;

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  setSelectedVariantId(variant.id);
                  setActiveMediaIndex(0);
                }}
                className={cn(
                  "overflow-hidden rounded-[28px] border bg-white text-left shadow-sm transition-all duration-200",
                  selected
                    ? "border-cobam-water-blue ring-4 ring-cobam-water-blue/15"
                    : "border-slate-300 hover:-translate-y-1 hover:shadow-lg",
                )}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {cardImage ? (
                    <Image
                      src={cardImage.thumbnailUrl ?? cardImage.url}
                      alt={cardImage.altText ?? variant.name}
                      fill
                      sizes="(max-width: 1280px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-cobam-light-bg via-white to-cobam-light-bg px-6 text-center text-sm font-semibold text-cobam-dark-blue">
                      {variant.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2 p-5">
                  <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                    {variant.sku}
                  </p>
                  <p className="text-lg font-bold leading-snug text-cobam-dark-blue">
                    {variant.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
