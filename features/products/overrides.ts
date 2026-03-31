import type {
  ProductCommercialMode,
  ProductLifecycleStatus,
  ProductPriceVisibility,
  ProductVariantInput,
  ProductVisibility,
} from "./types";

type DefaultVariantLike = Pick<
  ProductVariantInput,
  | "lifecycleStatus"
  | "visibility"
  | "commercialMode"
  | "priceVisibility"
  | "basePriceAmount"
>;

type VariantAddonLike = Pick<
  ProductVariantInput,
  | "lifecycleStatus"
  | "visibility"
  | "commercialMode"
  | "priceVisibility"
  | "basePriceAmount"
>;

export function resolveVariantAddonValue<T>(
  variantValue: T | null | undefined,
  defaultValue: T | null,
): T | null {
  return variantValue ?? defaultValue;
}

export function resolveVariantLifecycleStatus(
  defaultVariant: DefaultVariantLike,
  variant: VariantAddonLike,
): ProductLifecycleStatus {
  return resolveVariantAddonValue(
    variant.lifecycleStatus,
    defaultVariant.lifecycleStatus,
  ) as ProductLifecycleStatus;
}

export function resolveVariantVisibility(
  defaultVariant: DefaultVariantLike,
  variant: VariantAddonLike,
): ProductVisibility {
  return resolveVariantAddonValue(variant.visibility, defaultVariant.visibility) as ProductVisibility;
}

export function resolveVariantCommercialMode(
  defaultVariant: DefaultVariantLike,
  variant: VariantAddonLike,
): ProductCommercialMode {
  return resolveVariantAddonValue(
    variant.commercialMode,
    defaultVariant.commercialMode,
  ) as ProductCommercialMode;
}

export function resolveVariantPriceVisibility(
  defaultVariant: DefaultVariantLike,
  variant: VariantAddonLike,
): ProductPriceVisibility {
  return resolveVariantAddonValue(
    variant.priceVisibility,
    defaultVariant.priceVisibility,
  ) as ProductPriceVisibility;
}

export function resolveVariantEffectiveValues(
  defaultVariant: DefaultVariantLike,
  variant: VariantAddonLike,
) {
  const effectiveBasePriceAmount = resolveVariantAddonValue(
    variant.basePriceAmount,
    defaultVariant.basePriceAmount,
  );

  return {
    effectiveLifecycleStatus: resolveVariantLifecycleStatus(defaultVariant, variant),
    effectiveVisibility: resolveVariantVisibility(defaultVariant, variant),
    effectiveCommercialMode: resolveVariantCommercialMode(defaultVariant, variant),
    effectivePriceVisibility: resolveVariantPriceVisibility(defaultVariant, variant),
    effectiveBasePriceAmount,
    effectivePriceAmount: effectiveBasePriceAmount,
  };
}
