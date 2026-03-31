import { Prisma } from "@prisma/client";
import {
  mapProductBrandOptionDto,
  mapProductSubcategoryOptionDto,
  mapProductTagOptionDto,
} from "@/features/products/mappers";
import { resolveVariantEffectiveValues } from "@/features/products/overrides";
import type {
  ProductBrandOptionDto,
  ProductCommercialMode,
  ProductLifecycleStatus,
  ProductMediaDto,
  ProductPriceVisibility,
  ProductSubcategoryOptionDto,
  ProductTagOptionDto,
  ProductVisibility,
} from "@/features/products/types";
import { deriveProductPackComputedValues } from "./derived";
import type {
  ProductPackDetailDto,
  ProductPackLineDto,
  ProductPackListItemDto,
  ProductPackVariantOptionDto,
} from "./types";

type MediaRecord = {
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

type BrandRecord = {
  id: bigint;
  name: string;
  slug: string;
};

type SubcategoryRecord = {
  id: bigint;
  categoryId: bigint;
  name: string;
  slug: string;
  category: {
    name: string;
    slug: string;
  };
};

type TagRecord = {
  id: bigint;
  name: string;
  slug: string;
};

type DefaultVariantSummaryRecord = {
  lifecycleStatus: ProductLifecycleStatus | null;
  visibility: ProductVisibility | null;
  commercialMode: ProductCommercialMode | null;
  priceVisibility: ProductPriceVisibility | null;
  basePriceAmount: Prisma.Decimal | number | null;
} | null;

type PackVariantRecord = {
  id: bigint;
  sku: string;
  slug: string | null;
  name: string | null;
  lifecycleStatus: ProductLifecycleStatus | null;
  visibility: ProductVisibility | null;
  commercialMode: ProductCommercialMode | null;
  priceVisibility: ProductPriceVisibility | null;
  basePriceAmount: Prisma.Decimal | number | null;
  mediaLinks: Array<{
    media: MediaRecord;
  }>;
  family: {
    id: bigint;
    name: string;
    slug: string;
    vatRate: number;
    defaultVariant: DefaultVariantSummaryRecord;
    brand: BrandRecord | null;
    subcategories: SubcategoryRecord[];
    tagLinks: Array<{
      tag: TagRecord;
    }>;
    mediaLinks: Array<{
      media: MediaRecord;
    }>;
  };
};

type PackLineRecord = {
  productVariantId: bigint;
  quantity: number;
  sortOrder: number;
  productVariant: PackVariantRecord;
};

type PackRecord = {
  id: bigint;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  descriptionSeo?: string | null;
  createdAt: Date;
  updatedAt: Date;
  mediaLinks: Array<{
    role: "COVER" | "GALLERY";
    sortOrder: number;
    media: MediaRecord;
  }>;
  lines: PackLineRecord[];
};

function formatDecimalValue(value: Prisma.Decimal | number | null): string | null {
  return value != null ? String(value) : null;
}

function mapProductMediaToDto(media: MediaRecord): ProductMediaDto {
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

function mapVariantBrandToDto(brand: BrandRecord | null): ProductBrandOptionDto | null {
  return brand != null ? mapProductBrandOptionDto(brand) : null;
}

function mapVariantSubcategoriesToDto(records: SubcategoryRecord[]): ProductSubcategoryOptionDto[] {
  return records.map(mapProductSubcategoryOptionDto);
}

function mapVariantTagsToDto(
  records: Array<{
    tag: TagRecord;
  }>,
): ProductTagOptionDto[] {
  return records.map((record) => mapProductTagOptionDto(record.tag));
}

function getVariantFallbackValues(defaultVariant: DefaultVariantSummaryRecord) {
  return {
    lifecycleStatus: defaultVariant?.lifecycleStatus ?? "DRAFT",
    visibility: defaultVariant?.visibility ?? "HIDDEN",
    commercialMode: defaultVariant?.commercialMode ?? "REFERENCE_ONLY",
    priceVisibility: defaultVariant?.priceVisibility ?? "HIDDEN",
    basePriceAmount: formatDecimalValue(defaultVariant?.basePriceAmount ?? null),
  };
}

export function mapProductPackVariantOptionDto(record: PackVariantRecord): ProductPackVariantOptionDto {
  const effectiveValues = resolveVariantEffectiveValues(getVariantFallbackValues(record.family.defaultVariant), {
    lifecycleStatus: record.lifecycleStatus,
    visibility: record.visibility,
    commercialMode: record.commercialMode,
    priceVisibility: record.priceVisibility,
    basePriceAmount: formatDecimalValue(record.basePriceAmount),
  });

  const coverMedia = record.mediaLinks[0]?.media ?? record.family.mediaLinks[0]?.media ?? null;

  return {
    id: Number(record.id),
    familyId: Number(record.family.id),
    familyName: record.family.name,
    familySlug: record.family.slug,
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    mainImage: coverMedia != null ? mapProductMediaToDto(coverMedia) : null,
    lifecycleStatus: effectiveValues.effectiveLifecycleStatus,
    visibility: effectiveValues.effectiveVisibility,
    commercialMode: effectiveValues.effectiveCommercialMode,
    priceVisibility: effectiveValues.effectivePriceVisibility,
    basePriceAmount: effectiveValues.effectiveBasePriceAmount,
    vatRate: record.family.vatRate,
    brand: mapVariantBrandToDto(record.family.brand),
    productSubcategories: mapVariantSubcategoriesToDto(record.family.subcategories),
    tags: mapVariantTagsToDto(record.family.tagLinks),
  };
}

export function mapProductPackLineDto(record: PackLineRecord): ProductPackLineDto {
  return {
    productVariantId: Number(record.productVariantId),
    quantity: record.quantity,
    sortOrder: record.sortOrder,
    variant: mapProductPackVariantOptionDto(record.productVariant),
  };
}

function mapPackMainImage(mediaLinks: PackRecord["mediaLinks"]) {
  const coverLink = mediaLinks.find((link) => link.role === "COVER");
  return coverLink != null ? mapProductMediaToDto(coverLink.media) : null;
}

function mapPackGallery(mediaLinks: PackRecord["mediaLinks"]) {
  return mediaLinks
    .filter((link) => link.role === "GALLERY")
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((link) => mapProductMediaToDto(link.media));
}

export function mapProductPackToListItemDto(record: PackRecord): ProductPackListItemDto {
  const lines = record.lines
    .map(mapProductPackLineDto)
    .sort((left, right) => left.sortOrder - right.sortOrder);

  return {
    id: Number(record.id),
    name: record.name,
    slug: record.slug,
    subtitle: record.subtitle,
    description: record.description,
    mainImage: mapPackMainImage(record.mediaLinks),
    computed: deriveProductPackComputedValues(lines),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapProductPackToDetailDto(record: PackRecord): ProductPackDetailDto {
  const base = mapProductPackToListItemDto(record);

  return {
    ...base,
    descriptionSeo: record.descriptionSeo ?? null,
    media: mapPackGallery(record.mediaLinks),
    lines: record.lines
      .map(mapProductPackLineDto)
      .sort((left, right) => left.sortOrder - right.sortOrder),
  };
}

export function toProductPackAuditSnapshot(value: unknown): unknown {
  if (value == null) return value;

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toProductPackAuditSnapshot);
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      result[key] = toProductPackAuditSnapshot(item);
    }
    return result;
  }

  return value;
}
