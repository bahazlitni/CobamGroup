import type { MetadataRoute } from "next";
import { ProductKind } from "@prisma/client";
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    categories,
    subcategories,
    products,
    families,
    packs,
    articles,
  ] = await Promise.all([
    prisma.productCategory.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.productSubcategory.findMany({
      where: {
        isActive: true,
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
          in: [ProductKind.SINGLE, ProductKind.VARIANT],
        },
        lifecycle: "ACTIVE",
        visibility: true,
      },
      select: {
        slug: true,
        updatedAt: true,
        subcategoryLinks: {
          orderBy: {
            subcategoryId: "asc",
          },
          take: 1,
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
              lifecycle: "ACTIVE",
              visibility: true,
            },
          },
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        members: {
          orderBy: [{ sortOrder: "asc" }, { productId: "asc" }],
          take: 1,
          select: {
            product: {
              select: {
                subcategoryLinks: {
                  orderBy: {
                    subcategoryId: "asc",
                  },
                  take: 1,
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
    prisma.product.findMany({
      where: {
        kind: ProductKind.PACK,
      },
      select: {
        slug: true,
        updatedAt: true,
        subcategoryLinks: {
          orderBy: {
            subcategoryId: "asc",
          },
          take: 1,
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
        packLinesAsPack: {
          select: {
            product: {
              select: {
                visibility: true,
                lifecycle: true,
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
    mapUrl("/notre-histoire"),
    mapUrl("/partenaires"),
    mapUrl("/promotions"),
    mapUrl("/references"),
    mapUrl("/actualites"),
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
    ...products
      .filter((product) => product.subcategoryLinks[0])
      .map((product) => {
        const subcategory = product.subcategoryLinks[0]!.subcategory;
        return mapUrl(
          `/produits/${subcategory.category.slug}/${subcategory.slug}/${product.slug}`,
          product.updatedAt,
        );
      }),
    ...families
      .filter((family) => family.members[0]?.product.subcategoryLinks[0])
      .map((family) => {
        const subcategory = family.members[0]!.product.subcategoryLinks[0]!.subcategory;
        return mapUrl(
          `/produits/${subcategory.category.slug}/${subcategory.slug}/famille/${family.slug}`,
          family.updatedAt,
        );
      }),
    ...packs
      .filter(
        (pack) =>
          pack.subcategoryLinks[0] &&
          pack.packLinesAsPack.length > 0 &&
          pack.packLinesAsPack.every(
            (line) =>
              line.product.visibility === true &&
              line.product.lifecycle === "ACTIVE",
          ),
      )
      .map((pack) => {
        const subcategory = pack.subcategoryLinks[0]!.subcategory;
        return mapUrl(
          `/produits/${subcategory.category.slug}/${subcategory.slug}/${pack.slug}`,
          pack.updatedAt,
        );
      }),
    ...articles.map((article) =>
      mapUrl(`/actualites/${article.slug}`, article.updatedAt),
    ),
  ];

  return entries;
}
