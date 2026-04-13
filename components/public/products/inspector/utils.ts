import { PublicProductBreadcrumb } from "@/features/products/public-breadcrumb";
import { PublicProductColorReference, PublicProductFinishReference, PublicProductInspector, PublicProductInspectorAttribute, PublicProductInspectorMedia, PublicProductInspectorVariant, PublicProductSubcategoryLink, PublicSimpleProductInspector } from "@/features/products/types";

export type DerivedColorOption = {
  key: string;
  label: string;
  reference: PublicProductColorReference | null;
};

export type DerivedFinishOption = {
  key: string;
  label: string;
  reference: PublicProductFinishReference | null;
};

export type SpecialAttributeKind = "COLOR" | "FINISH";

export type UnifiedInspectorProduct = {
  entityType: "FAMILY" | "SINGLE" | "PACK";
  id: number;
  slug: string;
  brandName: string | null;
  coverMedia: PublicProductInspectorMedia | null;
  defaultVariantId: number | null;
  variants: PublicProductInspectorVariant[];
  subcategories: PublicProductSubcategoryLink[];
  colorReferences: PublicProductColorReference[];
  finishReferences: PublicProductFinishReference[];
};

export type PublicProductInspectorViewProps = {
  product: PublicProductInspector | PublicSimpleProductInspector;
  breadcrumb?: PublicProductBreadcrumb | null;
};

export type VariantSpecialValue = {
  key: string;
  label: string;
};

export type NormalAttributeOption = {
  key: string;
  label: string;
};

export type NormalAttributeGroup = {
  attributeId: string;
  name: string;
  unit: string | null;
  options: NormalAttributeOption[];
};

export type SelectorPillProps = {
  label: string;
  unit: null | string;
  active: boolean;
  onClick: () => void;
};

export type RailScrollState = {
  showButtons: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

export function normalizeComparableValue(value: string | null | undefined) {
  return value ?? "";
}

export function normalizeInspectorProduct(
  product: PublicProductInspector | PublicSimpleProductInspector,
): UnifiedInspectorProduct {
  if ("variants" in product) {
    return {
      entityType: "FAMILY",
      id: product.id,
      slug: product.slug,
      brandName: product.brandName,
      coverMedia: product.coverMedia,
      defaultVariantId: product.defaultVariantId,
      variants: product.variants,
      subcategories: product.subcategories,
      colorReferences: product.colorReferences,
      finishReferences: product.finishReferences,
    };
  }

  return {
    entityType: product.kind,
    id: product.id,
    slug: product.slug,
    brandName: product.brandNames.length > 0 ? product.brandNames.join(" · ") : null,
    coverMedia: product.media[0] ?? null,
    defaultVariantId: product.id,
    variants: [
      {
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        description: product.description,
        basePriceAmount: product.basePriceAmount,
        priceVisibility: product.priceVisibility,
        stock: product.stock,
        stockUnit: product.stockUnit,
        stockVisibility: product.stockVisibility,
        commercialMode: product.commercialMode,
        datasheet: product.datasheet,
        media: product.media,
        attributes: product.attributes,
      },
    ],
    subcategories: product.subcategories,
    colorReferences: product.colorReferences,
    finishReferences: product.finishReferences,
  };
}

export function resolveInitialVariantId(product: UnifiedInspectorProduct) {
  return product.defaultVariantId ?? product.variants[0]?.id ?? null;
}

export function getVariantAttributeValue(
  variant: PublicProductInspectorVariant,
  attributeId: string,
) {
  return variant.attributes.find(
    (attribute) => attribute.attributeId === attributeId && attribute.specialType == null,
  );
}

export function getVariantMedia(
  variant: PublicProductInspectorVariant | null,
  coverMedia: PublicProductInspectorMedia | null,
) {
  if (variant?.media.length) {
    return variant.media;
  }
  return coverMedia ? [coverMedia] : [];
}

export function buildColorOptions(product: UnifiedInspectorProduct) {
  const references = new Map(
    product.colorReferences.map((reference) => [reference.key, reference]),
  );
  const options = new Map<string, DerivedColorOption>();

  for (const variant of product.variants) {
    const value = getVariantSpecialValue(variant, "COLOR");

    if (!value || options.has(value.key)) {
      continue;
    }

    const reference = references.get(value.key) ?? null;

    options.set(value.key, {
      key: value.key,
      label: reference?.label ?? value.label,
      reference,
    });
  }

  return [...options.values()];
}

export function buildFinishOptions(product: UnifiedInspectorProduct) {
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

export function getVariantSpecialValue(
  variant: PublicProductInspectorVariant | null,
  kind: SpecialAttributeKind,
): VariantSpecialValue
 | null {
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

export function buildNormalAttributeGroups(product: UnifiedInspectorProduct) {
  const groups = new Map<string, NormalAttributeGroup>();

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

export function findVariantBySpecialValues(
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

export function findVariantByNormalAttribute(
  variants: PublicProductInspectorVariant[],
  attributeId: string,
  valueKey: string,
) {
  return (
    variants.find((variant) => {
      const attribute = getVariantAttributeValue(variant, attributeId);

      return attribute != null && normalizeComparableValue(attribute.value) === valueKey;
    }) ?? null
  );
}

export function buildSpecialOptions(input: {
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
