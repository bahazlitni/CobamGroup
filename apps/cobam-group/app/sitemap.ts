import type { MetadataRoute } from "next";
import { Prisma, ProductKind } from "@prisma/client";
import { listPublicArticles } from "@/features/articles/public";
import { buildAbsoluteUrl } from "@/lib/seo/site";
import { prisma } from "@/lib/server/db/prisma";

function mapUrl(
  path: string,
  lastModified?: Date | string | null,
): MetadataRoute.Sitemap[number] {
  return {
    url: buildAbsoluteUrl(path),
    lastModified: lastModified ?? undefined,
  };
}

function dedupeEntries(
  entries: MetadataRoute.Sitemap,
): MetadataRoute.Sitemap {
  const seen = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const entry of entries) {
    const current = seen.get(entry.url);

    if (!current) {
      seen.set(entry.url, entry);
      continue;
    }

    const currentLastModified = current.lastModified
      ? new Date(current.lastModified)
      : null;
    const nextLastModified = entry.lastModified
      ? new Date(entry.lastModified)
      : null;

    if (
      nextLastModified &&
      (!currentLastModified || nextLastModified > currentLastModified)
    ) {
      seen.set(entry.url, entry);
    }
  }

  return Array.from(seen.values());
}

async function hasProductSubcategoryVisibilityColumns() {
  const columns = await prisma
    .$queryRaw<Array<{ column_name: string }>>(Prisma.sql`
      SELECT "column_name"
      FROM "information_schema"."columns"
      WHERE "table_schema" = 'public'
        AND "table_name" = 'product_subcategories'
        AND "column_name" IN ('visible_ecommerce', 'visible_vitrine')
    `)
    .catch(() => []);

  return columns.length === 2;
}

function publicSubcategoryWhere(
  hasVisibilityColumns: boolean,
): Prisma.ProductSubcategoryWhereInput {
  return hasVisibilityColumns
    ? { isActive: true, visibleVitrine: true }
    : { isActive: true };
}

function publicProductSubcategoryLinkWhere(
  hasVisibilityColumns: boolean,
): Prisma.ProductSubcategoryLinkWhereInput {
  return {
    subcategory: {
      ...publicSubcategoryWhere(hasVisibilityColumns),
      category: {
        isActive: true,
      },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hasVisibilityColumns = await hasProductSubcategoryVisibilityColumns();
  const visibleSubcategoryWhere = publicSubcategoryWhere(hasVisibilityColumns);
  const visibleSubcategoryLinkWhere =
    publicProductSubcategoryLinkWhere(hasVisibilityColumns);

  const [
    categories,
    subcategories,
    products,
    families,
    articles,
  ] = await Promise.all([
    prisma.productCategory.findMany({
      where: {
        isActive: true,
        subcategories: {
          some: visibleSubcategoryWhere,
        },
      },
      select: { slug: true, updatedAt: true },
    }),
    prisma.productSubcategory.findMany({
      where: {
        ...visibleSubcategoryWhere,
        category: {
          isActive: true,
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        category: {
          select: {
            slug: true,
          },
        },
      },
    }),
    prisma.product.findMany({
      where: {
        kind: {
          in: [ProductKind.STANDARD, ProductKind.SINGLE, ProductKind.VARIANT],
        },
        visibleVitrine: true,
        subcategories: {
          some: visibleSubcategoryLinkWhere,
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        subcategories: {
          where: visibleSubcategoryLinkWhere,
          orderBy: {
            subcategoryId: "asc",
          },
          select: {
            subcategory: {
              select: {
                slug: true,
                category: {
                  select: {
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.productFamily.findMany({
      where: {
        members: {
          some: {
            product: {
              kind: ProductKind.VARIANT,
              visibleVitrine: true,
              subcategories: {
                some: visibleSubcategoryLinkWhere,
              },
            },
          },
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        members: {
          orderBy: [{ sortOrder: "asc" }, { productId: "asc" }],
          select: {
            product: {
              select: {
                subcategories: {
                  where: visibleSubcategoryLinkWhere,
                  orderBy: {
                    subcategoryId: "asc",
                  },
                  select: {
                    subcategory: {
                      select: {
                        slug: true,
                        category: {
                          select: {
                            slug: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    listPublicArticles(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    mapUrl("/"),
    mapUrl("/contact"),
    mapUrl("/a-propos"),
    mapUrl("/partenaires"),
    mapUrl("/promotions"),
    mapUrl("/references"),
    mapUrl("/actualites"),
    mapUrl("/annuaire"),
    mapUrl("/produits"),
    
    ...categories.map((category) =>
      mapUrl(`/produits/${category.slug}`, category.updatedAt),
    ),
    ...subcategories.map((subcategory) =>
      mapUrl(
        `/produits/${subcategory.category.slug}/${subcategory.slug}`,
        subcategory.updatedAt,
      ),
    ),
    ...products.flatMap((product) =>
      product.subcategories.map((link) =>
        mapUrl(
          `/produits/${link.subcategory.category.slug}/${link.subcategory.slug}/${product.slug}`,
          product.updatedAt,
        ),
      ),
    ),
    ...families.flatMap((family) =>
      family.members.flatMap((member) =>
        member.product.subcategories.map((link) =>
          mapUrl(
            `/produits/${link.subcategory.category.slug}/${link.subcategory.slug}/famille/${family.slug}`,
            family.updatedAt,
          ),
        ),
      ),
    ),
    ...articles.map((article) =>
      mapUrl(`/actualites/${article.slug}`, article.updatedAt),
    ),
  ];

  return dedupeEntries(entries);
}
