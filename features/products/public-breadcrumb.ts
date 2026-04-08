import { findPublicProductSubcategoryBySlugs } from "@/features/product-categories/public";
import type { PublicProductSubcategoryLink } from "./types";

export type PublicProductBreadcrumb = {
  categoryName: string;
  categorySlug: string;
  subcategoryName: string;
  subcategorySlug: string;
};

export function parseOriginPath(originPath: string | null | undefined) {
  const normalizedPath = (originPath ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (!normalizedPath) {
    return null;
  }

  const segments = normalizedPath.split("/").filter(Boolean);
  if (segments.length !== 2) {
    return null;
  }

  const [categorySlug, subcategorySlug] = segments;

  if (!categorySlug || !subcategorySlug) {
    return null;
  }

  return {
    categorySlug,
    subcategorySlug,
  };
}

export async function resolvePublicProductBreadcrumb(input: {
  originPath?: string | null;
  fallbackSubcategories?: PublicProductSubcategoryLink[];
}): Promise<PublicProductBreadcrumb | null> {
  const origin = parseOriginPath(input.originPath);

  if (origin) {
    const subcategory = await findPublicProductSubcategoryBySlugs(origin);
    if (subcategory) {
      return {
        categoryName: subcategory.parentName ?? "Produits",
        categorySlug: origin.categorySlug,
        subcategoryName: subcategory.name,
        subcategorySlug: origin.subcategorySlug,
      };
    }
  }

  const fallback = input.fallbackSubcategories?.[0];
  if (!fallback) {
    return null;
  }

  return {
    categoryName: fallback.categoryName,
    categorySlug: fallback.categorySlug,
    subcategoryName: fallback.name,
    subcategorySlug: fallback.slug,
  };
}
