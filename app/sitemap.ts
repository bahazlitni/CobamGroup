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
          select: {
            product: {
              select: {
                subcategoryLinks: {
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
    prisma.product.findMany({
      where: {
        kind: ProductKind.PACK,
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
      product.subcategoryLinks.map((link) =>
        mapUrl(
          `/produits/${link.subcategory.category.slug}/${link.subcategory.slug}/${product.slug}`,
          product.updatedAt,
        ),
      ),
    ),
    ...families.flatMap((family) =>
      family.members.flatMap((member) =>
        member.product.subcategoryLinks.map((link) =>
          mapUrl(
            `/produits/${link.subcategory.category.slug}/${link.subcategory.slug}/famille/${family.slug}`,
            family.updatedAt,
          ),
        ),
      ),
    ),
    ...packs
      .filter(
        (pack) =>
          pack.packLinesAsPack.length > 0 &&
          pack.packLinesAsPack.every(
            (line) =>
              line.product.visibility === true &&
              line.product.lifecycle === "ACTIVE",
          ),
      )
      .flatMap((pack) =>
        pack.subcategoryLinks.map((link) =>
          mapUrl(
            `/produits/${link.subcategory.category.slug}/${link.subcategory.slug}/${pack.slug}`,
            pack.updatedAt,
          ),
        ),
      ),
    ...articles.map((article) =>
      mapUrl(`/actualites/${article.slug}`, article.updatedAt),
    ),
  ];

  return dedupeEntries(entries);
}
