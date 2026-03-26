import type { BrandShowcasePlacement, ProductBrand } from "@prisma/client";
import type { BrandDetailDto, BrandListItemDto } from "./types";

export function mapBrandToDetailDto(brand: ProductBrand): BrandDetailDto {
  return {
    id: Number(brand.id),
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    logoMediaId: brand.logoMediaId != null ? Number(brand.logoMediaId) : null,
    showcasePlacement: brand.showcasePlacement,
    isProductBrand: brand.isProductBrand,
    ownerUserId: brand.ownerUserId,
    createdByUserId: brand.createdByUserId,
    updatedByUserId: brand.updatedByUserId,
    createdAt: brand.createdAt.toISOString(),
    updatedAt: brand.updatedAt.toISOString(),
  };
}

export function mapBrandToListItemDto(brand: {
  id: bigint;
  name: string;
  slug: string;
  description: string | null;
  logoMediaId: bigint | null;
  showcasePlacement: BrandShowcasePlacement;
  isProductBrand: boolean;
  ownerUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): BrandListItemDto {
  return {
    id: Number(brand.id),
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    logoMediaId: brand.logoMediaId != null ? Number(brand.logoMediaId) : null,
    showcasePlacement: brand.showcasePlacement,
    isProductBrand: brand.isProductBrand,
    ownerUserId: brand.ownerUserId,
    createdAt: brand.createdAt.toISOString(),
    updatedAt: brand.updatedAt.toISOString(),
  };
}

export function toBrandAuditSnapshot(value: unknown): unknown {
  if (value == null) return value;

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toBrandAuditSnapshot);
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      result[key] = toBrandAuditSnapshot(item);
    }
    return result;
  }

  return value;
}
