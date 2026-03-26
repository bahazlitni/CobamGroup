import type {
  ProductBrandOptionDto,
  ProductCategoryOptionDto,
  ProductDetailDto,
  ProductListItemDto,
  ProductTagOptionDto,
} from "./types";

type ProductModelListRecord = {
  id: bigint;
  baseName: string;
  baseSlug: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  brand: {
    id: bigint;
    name: string;
    slug: string;
  };
  productType: {
    id: bigint;
    name: string;
    slug: string;
  };
  _count: {
    products: number;
    tagLinks: number;
  };
};

type ProductModelDetailRecord = ProductModelListRecord & {
  descriptionSeo: string | null;
  tagLinks: Array<{
    tag: {
      id: bigint;
      name: string;
      slug: string;
    };
  }>;
};

export function mapProductBrandOptionDto(
  brand: { id: bigint; name: string; slug: string },
): ProductBrandOptionDto {
  return {
    id: Number(brand.id),
    name: brand.name,
    slug: brand.slug,
  };
}

export function mapProductCategoryOptionDto(
  category: { id: bigint; name: string; slug: string },
): ProductCategoryOptionDto {
  return {
    id: Number(category.id),
    name: category.name,
    slug: category.slug,
  };
}

export function mapProductTagOptionDto(
  tag: { id: bigint; name: string; slug: string },
): ProductTagOptionDto {
  return {
    id: Number(tag.id),
    name: tag.name,
    slug: tag.slug,
  };
}

export function mapProductToListItemDto(
  product: ProductModelListRecord,
): ProductListItemDto {
  return {
    id: Number(product.id),
    baseName: product.baseName,
    baseSlug: product.baseSlug,
    description: product.description,
    isActive: product.isActive,
    brand: mapProductBrandOptionDto(product.brand),
    productCategory: mapProductCategoryOptionDto(product.productType),
    tagCount: product._count.tagLinks,
    variantCount: product._count.products,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function mapProductToDetailDto(
  product: ProductModelDetailRecord,
): ProductDetailDto {
  const base = mapProductToListItemDto(product);

  return {
    ...base,
    descriptionSeo: product.descriptionSeo,
    tags: product.tagLinks.map((item) => mapProductTagOptionDto(item.tag)),
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
