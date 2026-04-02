import { formatStoredProductAttributeValue } from "./attribute-values";
import { resolveVariantEffectiveValues } from "./overrides";
import { countOwnedTags, parseOwnedTagString } from "@/features/tags/owned";
import { slugifyTagName } from "@/features/tags/slug";
import type {
  ProductAttributeDto,
  ProductBrandOptionDto,
  ProductCommercialMode,
  ProductDetailDto,
  ProductLifecycleStatus,
  ProductListItemDto,
  ProductMediaDto,
  ProductPriceUnit,
  ProductPriceVisibility,
  ProductSubcategoryOptionDto,
  ProductTagOptionDto,
  ProductVariantAttributeValueDto,
  ProductVariantDto,
  ProductVisibility,
} from "./types";

type DefaultVariantSummaryRecord = {
  id: bigint;
  lifecycleStatus: ProductLifecycleStatus | null;
  visibility: ProductVisibility | null;
  commercialMode: ProductCommercialMode | null;
  priceVisibility: ProductPriceVisibility | null;
  basePriceAmount: { toString(): string } | number | null;
} | null;

type ProductFamilyListRecord = {
  id: bigint;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  tags: string;
  priceUnit: ProductPriceUnit;
  vatRate: number;
  createdAt: Date;
  updatedAt: Date;
  defaultVariant: DefaultVariantSummaryRecord;
  brand: {
    id: bigint;
    name: string;
    slug: string;
  } | null;
  subcategories: Array<{
    id: bigint;
    categoryId: bigint;
    category: {
      name: string;
      slug: string;
    };
    name: string;
    slug: string;
  }>;
  _count: {
    variants: number;
  };
};

type ProductVariantRecord = {
  id: bigint;
  sku: string;
  slug: string | null;
  name: string | null;
  description: string | null;
  descriptionSeo: string | null;
  lifecycleStatus: ProductLifecycleStatus | null;
  visibility: ProductVisibility | null;
  commercialMode: ProductCommercialMode | null;
  priceVisibility: ProductPriceVisibility | null;
  basePriceAmount: { toString(): string } | number | null;
  sortOrder: number;
  mediaLinks: Array<{
    media: {
      id: bigint;
      kind: ProductMediaDto["kind"];
      title: string | null;
      originalFilename: string | null;
      altText: string | null;
      mimeType: string | null;
      extension: string | null;
      widthPx: number | null;
      heightPx: number | null;
      sizeBytes: bigint | number | null;
    };
  }>;
  attributeValues: Array<{
    attributeId: bigint;
    valueText: string | null;
    valueNumber: { toString(): string } | number | null;
    valueBoolean: boolean | null;
    valueJson: unknown | null;
    attribute: {
      dataType: ProductAttributeDto["dataType"];
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
};

type ProductFamilyDetailRecord = ProductFamilyListRecord & {
  descriptionSeo: string | null;
  mediaLinks: Array<{
    media: {
      id: bigint;
      kind: ProductMediaDto["kind"];
      title: string | null;
      originalFilename: string | null;
      altText: string | null;
      mimeType: string | null;
      extension: string | null;
      widthPx: number | null;
      heightPx: number | null;
      sizeBytes: bigint | number | null;
    };
  }>;
  defaultVariant: (DefaultVariantSummaryRecord & {
    sku?: string;
    slug?: string | null;
    name?: string | null;
    description?: string | null;
    descriptionSeo?: string | null;
  }) | null;
  attributeValues: Array<{
    attribute: {
      id: bigint;
      key: string;
      name: string;
      slug: string;
      dataType: ProductAttributeDto["dataType"];
      unit: string | null;
      sortOrder: number;
    };
  }>;
  variants: ProductVariantRecord[];
};

function formatDecimalValue(value: { toString(): string } | number | null): string | null {
  return value != null ? String(value) : null;
}

function mapProductMediaToDto(media: {
  id: bigint;
  kind: ProductMediaDto["kind"];
  title: string | null;
  originalFilename: string | null;
  altText: string | null;
  mimeType: string | null;
  extension: string | null;
  widthPx: number | null;
  heightPx: number | null;
  sizeBytes: bigint | number | null;
}): ProductMediaDto {
  return {
    id: Number(media.id),
    kind: media.kind,
    title: media.title,
    originalFilename: media.originalFilename,
    altText: media.altText,
    mimeType: media.mimeType,
    extension: media.extension,
    widthPx: media.widthPx,
    heightPx: media.heightPx,
    sizeBytes: typeof media.sizeBytes === "bigint" ? Number(media.sizeBytes) : media.sizeBytes,
  };
}

function mapProductAttributeToDto(
  attributeLink: ProductFamilyDetailRecord["attributeValues"][number],
): ProductAttributeDto {
  return {
    id: Number(attributeLink.attribute.id),
    key: attributeLink.attribute.key,
    name: attributeLink.attribute.name,
    slug: attributeLink.attribute.slug,
    dataType: attributeLink.attribute.dataType,
    unit: attributeLink.attribute.unit,
    sortOrder: attributeLink.attribute.sortOrder,
  };
}

function mapProductVariantAttributeValueToDto(
  value: ProductFamilyDetailRecord["variants"][number]["attributeValues"][number],
): ProductVariantAttributeValueDto {
  return {
    attributeId: Number(value.attributeId),
    value: formatStoredProductAttributeValue({
      dataType: value.attribute.dataType,
      valueText: value.valueText,
      valueNumber: value.valueNumber,
      valueBoolean: value.valueBoolean,
      valueJson: value.valueJson,
    }),
  };
}

function getDefaultVariantFallback(defaultVariant: DefaultVariantSummaryRecord) {
  return {
    lifecycleStatus: defaultVariant?.lifecycleStatus ?? "DRAFT",
    visibility: defaultVariant?.visibility ?? "HIDDEN",
    commercialMode: defaultVariant?.commercialMode ?? "REFERENCE_ONLY",
    priceVisibility: defaultVariant?.priceVisibility ?? "HIDDEN",
    basePriceAmount: formatDecimalValue(defaultVariant?.basePriceAmount ?? null),
  };
}

function mapProductVariantToDto(
  defaultVariant: DefaultVariantSummaryRecord,
  variant: ProductVariantRecord,
): ProductVariantDto {
  const effectiveValues = resolveVariantEffectiveValues(getDefaultVariantFallback(defaultVariant), {
    lifecycleStatus: variant.lifecycleStatus,
    visibility: variant.visibility,
    commercialMode: variant.commercialMode,
    priceVisibility: variant.priceVisibility,
    basePriceAmount: formatDecimalValue(variant.basePriceAmount),
  });

  return {
    id: Number(variant.id),
    sku: variant.sku,
    slug: variant.slug,
    name: variant.name,
    description: variant.description,
    descriptionSeo: variant.descriptionSeo,
    lifecycleStatus: variant.lifecycleStatus,
    visibility: variant.visibility,
    commercialMode: variant.commercialMode,
    priceVisibility: variant.priceVisibility,
    basePriceAmount: formatDecimalValue(variant.basePriceAmount),
    ...effectiveValues,
    sortOrder: variant.sortOrder,
    media: variant.mediaLinks.map((link) => mapProductMediaToDto(link.media)),
    attributeValues: variant.attributeValues.map(mapProductVariantAttributeValueToDto),
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
  };
}

export function mapProductBrandOptionDto(brand: {
  id: bigint;
  name: string;
  slug: string;
}): ProductBrandOptionDto {
  return {
    id: Number(brand.id),
    name: brand.name,
    slug: brand.slug,
  };
}

export function mapProductSubcategoryOptionDto(subcategory: {
  id: bigint;
  categoryId: bigint;
  name: string;
  slug: string;
  category: {
    name: string;
    slug: string;
  };
}): ProductSubcategoryOptionDto {
  return {
    id: Number(subcategory.id),
    name: subcategory.name,
    slug: subcategory.slug,
    categoryId: Number(subcategory.categoryId),
    categoryName: subcategory.category.name,
    categorySlug: subcategory.category.slug,
  };
}

export function mapProductTagOptionDto(tag: {
  name: string;
  slug: string;
}): ProductTagOptionDto {
  return {
    name: tag.name,
    slug: tag.slug,
  };
}

export function mapProductToListItemDto(product: ProductFamilyListRecord): ProductListItemDto {
  const basePriceAmount = formatDecimalValue(product.defaultVariant?.basePriceAmount ?? null);

  return {
    id: Number(product.id),
    name: product.name,
    slug: product.slug,
    subtitle: product.subtitle,
    description: product.description,
    lifecycleStatus: product.defaultVariant?.lifecycleStatus ?? "DRAFT",
    visibility: product.defaultVariant?.visibility ?? "HIDDEN",
    commercialMode: product.defaultVariant?.commercialMode ?? "REFERENCE_ONLY",
    priceVisibility: product.defaultVariant?.priceVisibility ?? "HIDDEN",
    priceUnit: product.priceUnit,
    vatRate: product.vatRate,
    basePriceAmount,
    effectivePriceAmount: basePriceAmount,
    brand: product.brand != null ? mapProductBrandOptionDto(product.brand) : null,
    productSubcategories: product.subcategories.map(mapProductSubcategoryOptionDto),
    tagCount: countOwnedTags(product.tags),
    variantCount: product._count.variants,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function mapProductToDetailDto(product: ProductFamilyDetailRecord): ProductDetailDto {
  const base = mapProductToListItemDto(product);
  const defaultVariant = product.defaultVariant ?? product.variants[0] ?? null;

  return {
    ...base,
    descriptionSeo: product.descriptionSeo,
    mainImage:
      product.mediaLinks[0] != null ? mapProductMediaToDto(product.mediaLinks[0].media) : null,
    attributes: product.attributeValues.map(mapProductAttributeToDto),
    defaultVariantId: defaultVariant != null ? Number(defaultVariant.id) : null,
    tags: parseOwnedTagString(product.tags).map((name) =>
      mapProductTagOptionDto({
        name,
        slug: slugifyTagName(name),
      }),
    ),
    variants: product.variants.map((variant) => mapProductVariantToDto(defaultVariant, variant)),
  };
}

export function toProductAuditSnapshot(value: unknown): unknown {
  if (value == null) return value;

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toProductAuditSnapshot);
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      result[key] = toProductAuditSnapshot(item);
    }
    return result;
  }

  return value;
}
