import { parseOwnedTagString } from "@/features/tags/owned";
import type { AllProductListItemDto } from "./types";

export function mapAllProductToListItemDto(product: {
  id: bigint;
  sourceType: "VARIANT" | "PACK";
  sourceId: bigint;
  productFamilyId: bigint | null;
  productPackId: bigint | null;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  descriptionSeo: string | null;
  lifecycleStatus: "DRAFT" | "ACTIVE" | "ARCHIVED";
  visibility: "HIDDEN" | "PUBLIC";
  commercialMode: "REFERENCE_ONLY" | "QUOTE_ONLY" | "SELLABLE";
  priceVisibility: "HIDDEN" | "VISIBLE";
  basePriceAmount: { toString(): string } | number | null;
  priceUnit:
    | "ITEM"
    | "MILLIGRAM"
    | "GRAM"
    | "KILOGRAM"
    | "MILLILITER"
    | "CENTILITER"
    | "LITER"
    | "CUBIC_METER"
    | "MILLIMETER"
    | "CENTIMETER"
    | "METER"
    | "SQUARE_METER";
  vatRate: number;
  brandIds: bigint[];
  tags: string;
  subcategoryIds: bigint[];
  coverMediaId: bigint | null;
  createdAt: Date;
  updatedAt: Date;
}): AllProductListItemDto {
  return {
    id: Number(product.id),
    sourceType: product.sourceType,
    sourceId: Number(product.sourceId),
    productFamilyId:
      product.productFamilyId != null ? Number(product.productFamilyId) : null,
    productPackId:
      product.productPackId != null ? Number(product.productPackId) : null,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    descriptionSeo: product.descriptionSeo,
    lifecycleStatus: product.lifecycleStatus,
    visibility: product.visibility,
    commercialMode: product.commercialMode,
    priceVisibility: product.priceVisibility,
    basePriceAmount:
      product.basePriceAmount != null ? String(product.basePriceAmount) : null,
    priceUnit: product.priceUnit,
    vatRate: product.vatRate,
    brandIds: product.brandIds.map((brandId) => Number(brandId)),
    tags: parseOwnedTagString(product.tags),
    subcategoryIds: product.subcategoryIds.map((subcategoryId) =>
      Number(subcategoryId),
    ),
    coverMediaId: product.coverMediaId != null ? Number(product.coverMediaId) : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
