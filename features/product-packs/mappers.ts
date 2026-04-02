import { parseOwnedTagString } from "@/features/tags/owned";
import {
  mapProductSubcategoryOptionDto,
} from "@/features/products/mappers";
import type { ProductMediaDto } from "@/features/products/types";
import type {
  ProductPackRepositoryRecord,
  ProjectedPackRepositoryRecord,
} from "./repository";
import type {
  ProductPackDetailDto,
  ProductPackLineDto,
  ProductPackListItemDto,
} from "./types";

type AllProductRecord = ProjectedPackRepositoryRecord;
type ProductPackRecord = ProductPackRepositoryRecord;

function formatDecimalValue(value: { toString(): string } | number | null) {
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

function mapLineDto(
  line: ProductPackRecord["lines"][number],
): ProductPackLineDto {
  return {
    variantId: Number(line.variantId),
    familyId: Number(line.variant.familyId),
    name: line.variant.name ?? line.variant.sku,
    slug: line.variant.slug,
    sku: line.variant.sku,
    quantity: line.quantity,
    sortOrder: line.sortOrder,
  };
}

export function mapProductPackToListItemDto(input: {
  pack: ProductPackRecord;
  projected: AllProductRecord;
}): ProductPackListItemDto {
  return {
    id: Number(input.pack.id),
    name: input.projected.name,
    slug: input.projected.slug,
    sku: input.projected.sku,
    description: input.projected.description,
    descriptionSeo: input.projected.descriptionSeo,
    lifecycleStatus: input.projected.lifecycleStatus,
    visibility: input.projected.visibility,
    commercialMode: input.projected.commercialMode,
    priceVisibility: input.projected.priceVisibility,
    basePriceAmount: formatDecimalValue(input.projected.basePriceAmount),
    priceUnit: "ITEM",
    vatRate: input.projected.vatRate,
    brandIds: input.projected.brandIds.map((brandId) => Number(brandId)),
    tags: parseOwnedTagString(input.projected.tags),
    productSubcategories: input.pack.subcategories.map(mapProductSubcategoryOptionDto),
    lineCount: input.pack.lines.length,
    coverMediaId:
      input.projected.coverMediaId != null ? Number(input.projected.coverMediaId) : null,
    createdAt: input.pack.createdAt.toISOString(),
    updatedAt: input.pack.updatedAt.toISOString(),
  };
}

export function mapProductPackToDetailDto(input: {
  pack: ProductPackRecord;
  projected: AllProductRecord;
}): ProductPackDetailDto {
  const base = mapProductPackToListItemDto(input);

  return {
    ...base,
    lifecycleStatusMode: input.pack.lifecycleStatusMode,
    manualLifecycleStatus: input.pack.manualLifecycleStatus,
    visibilityMode: input.pack.visibilityMode,
    manualVisibility: input.pack.manualVisibility,
    priceVisibilityMode: input.pack.priceVisibilityMode,
    manualPriceVisibility: input.pack.manualPriceVisibility,
    mainImage:
      input.pack.mediaLinks.find((link) => link.role === "COVER") != null
        ? mapProductMediaToDto(
            input.pack.mediaLinks.find((link) => link.role === "COVER")!.media,
          )
        : null,
    media: input.pack.mediaLinks
      .filter((link) => link.role === "GALLERY")
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((link) => mapProductMediaToDto(link.media)),
    lines: input.pack.lines.map(mapLineDto),
  };
}
