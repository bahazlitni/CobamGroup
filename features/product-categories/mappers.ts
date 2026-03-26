import type { ProductCategory } from "@prisma/client";
import type {
  ProductCategoryDetailDto,
  ProductCategoryListItemDto,
  ProductCategoryParentOptionDto,
} from "./types";

type ProductCategoryWithRelations = ProductCategory & {
  parent: { id: bigint; name: string; slug: string } | null;
  _count: {
    children: number;
    productModels: number;
  };
};

function toNumber(value: bigint | null | undefined): number | null {
  return value == null ? null : Number(value);
}

export function mapProductCategoryToListItemDto(
  category: ProductCategoryWithRelations,
): ProductCategoryListItemDto {
  return {
    id: Number(category.id),
    name: category.name,
    subtitle: category.subtitle,
    slug: category.slug,
    description: category.description,
    descriptionSeo: category.descriptionSeo,
    imageMediaId: toNumber(category.imageMediaId),
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    parentId: toNumber(category.parentId),
    parentName: category.parent?.name ?? null,
    parentSlug: category.parent?.slug ?? null,
    childCount: category._count.children,
    productModelCount: category._count.productModels,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function mapProductCategoryToDetailDto(
  category: ProductCategoryWithRelations,
): ProductCategoryDetailDto {
  return mapProductCategoryToListItemDto(category);
}

export function mapProductCategoryToParentOptionDto(category: {
  id: bigint;
  name: string;
  slug: string;
  parentId: bigint | null;
}): ProductCategoryParentOptionDto {
  return {
    id: Number(category.id),
    name: category.name,
    slug: category.slug,
    parentId: toNumber(category.parentId),
  };
}

export function toProductCategoryAuditSnapshot(value: unknown): unknown {
  if (value == null) return value;

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toProductCategoryAuditSnapshot);
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      result[key] = toProductCategoryAuditSnapshot(item);
    }
    return result;
  }

  return value;
}
