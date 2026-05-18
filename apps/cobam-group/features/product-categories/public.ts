import { Prisma } from "@prisma/client";
import { makeMediaPublicMany } from "@/features/media/repository";
import { prisma } from "@/lib/server/db/prisma";
import { resolveColorHex } from "@/lib/color-values";
import type {
  PublicMegaMenuProductCategory,
  PublicProductCategoryPageData,
  PublicProductSubcategoryCardData,
} from "./public-types";

type PublicImageRelation = {
  id: bigint;
  isActive: boolean;
  deletedAt: Date | null;
} | null;

type PublicProductCategoryRecord = {
  id: bigint;
  name: string;
  subtitle: string | null;
  slug: string;
  themeColor: string | null;
  description: string | null;
  descriptionSeo: string | null;
  imageMediaId: bigint | null;
  imageMedia: PublicImageRelation;
  subcategories: Array<{
    id: bigint;
    categoryId: bigint;
    name: string;
    subtitle: string | null;
    slug: string;
    description: string | null;
    descriptionSeo: string | null;
    imageMediaId: bigint | null;
    imageMedia: PublicImageRelation;
  }>;
};

type PublicProductCategoryCardRecord = PublicProductCategoryRecord & {
  subcategories: Array<
    PublicProductCategoryRecord["subcategories"][number] & {
      productLinks?: Array<{ productId: bigint }>;
    }
  >;
};

type PublicProductSubcategoryRecord = {
  id: bigint;
  categoryId: bigint;
  name: string;
  subtitle: string | null;
  slug: string;
  description: string | null;
  descriptionSeo: string | null;
  imageMediaId: bigint | null;
  imageMedia: PublicImageRelation;
  category: {
    id: bigint;
    name: string;
    slug: string;
    themeColor: string | null;
  };
};

let subcategoryVisibilityColumnsPromise: Promise<boolean> | null = null;

function hasProductSubcategoryVisibilityColumns() {
  subcategoryVisibilityColumnsPromise ??= prisma
    .$queryRaw<Array<{ column_name: string }>>(Prisma.sql`
      SELECT "column_name"
      FROM "information_schema"."columns"
      WHERE "table_schema" = 'public'
        AND "table_name" = 'product_subcategories'
        AND "column_name" IN ('visible_ecommerce', 'visible_vitrine')
    `)
    .then((columns) => columns.length === 2)
    .catch(() => false);

  return subcategoryVisibilityColumnsPromise;
}

function publicVitrineSubcategoryWhere(
  hasVisibilityColumns: boolean,
): Prisma.ProductSubcategoryWhereInput {
  return hasVisibilityColumns
    ? { isActive: true, visibleVitrine: true }
    : { isActive: true };
}

function publicCategorySelectFor(
  hasVisibilityColumns: boolean,
): Prisma.ProductCategorySelect {
  return {
    id: true,
    name: true,
    subtitle: true,
    slug: true,
    themeColor: true,
    description: true,
    descriptionSeo: true,
    imageMediaId: true,
    imageMedia: {
      select: {
        id: true,
        isActive: true,
        deletedAt: true,
      },
    },
    subcategories: {
      where: publicVitrineSubcategoryWhere(hasVisibilityColumns),
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
      select: {
        id: true,
        categoryId: true,
        name: true,
        subtitle: true,
        slug: true,
        description: true,
        descriptionSeo: true,
        imageMediaId: true,
        imageMedia: {
          select: {
            id: true,
            isActive: true,
            deletedAt: true,
          },
        },
      },
    },
  };
}

function publicCategoryCardSelectFor(
  hasVisibilityColumns: boolean,
): Prisma.ProductCategorySelect {
  return {
    id: true,
    name: true,
    subtitle: true,
    slug: true,
    themeColor: true,
    description: true,
    descriptionSeo: true,
    imageMediaId: true,
    imageMedia: {
      select: {
        id: true,
        isActive: true,
        deletedAt: true,
      },
    },
    subcategories: {
      where: publicVitrineSubcategoryWhere(hasVisibilityColumns),
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
      select: {
        id: true,
        categoryId: true,
        name: true,
        subtitle: true,
        slug: true,
        description: true,
        descriptionSeo: true,
        imageMediaId: true,
        imageMedia: {
          select: {
            id: true,
            isActive: true,
            deletedAt: true,
          },
        },
        productLinks: {
          where: {
            product: {
              visibleVitrine: true,
              kind: {
                in: ["STANDARD", "SINGLE", "VARIANT"],
              },
            },
          },
          select: {
            productId: true,
          },
        },
      },
    },
  };
}

function activePublicPromotionWhere(now = new Date()): Prisma.CommercePromotionWhereInput {
  return {
    status: "ACTIVE",
    AND: [
      {
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      },
      {
        OR: [{ endsAt: null }, { endsAt: { gte: now } }],
      },
    ],
    coupons: {
      none: {
        customers: {
          some: {},
        },
      },
    },
  };
}

async function getPublicPromotedCategoryIds() {
  const links = await prisma.commercePromotionCategory.findMany({
    where: {
      promotion: activePublicPromotionWhere(),
    },
    select: {
      categoryId: true,
    },
  });

  return new Set(links.map((link) => link.categoryId.toString()));
}

const publicSubcategorySelect = {
  id: true,
  categoryId: true,
  name: true,
  subtitle: true,
  slug: true,
  description: true,
  descriptionSeo: true,
  imageMediaId: true,
  imageMedia: {
    select: {
      id: true,
      isActive: true,
      deletedAt: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      themeColor: true,
    },
  },
} satisfies Prisma.ProductSubcategorySelect;

function buildPublicMediaUrl(
  mediaId: bigint | number,
  variant: "original" | "thumbnail" = "original",
) {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

function getPublicImageUrls(input: {
  imageMediaId: bigint | null;
  imageMedia: PublicImageRelation;
}) {
  const hasImage =
    input.imageMediaId != null &&
    input.imageMedia != null &&
    input.imageMedia.isActive &&
    input.imageMedia.deletedAt == null;

  if (!hasImage || input.imageMediaId == null) {
    return {
      imageUrl: "",
      imageUrlHD: "",
      imageThumbnailUrl: null,
      imageOriginalUrl: null,
    };
  }

  return {
    imageUrl: buildPublicMediaUrl(input.imageMediaId, "thumbnail"),
    imageUrlHD: buildPublicMediaUrl(input.imageMediaId, "original"),
    imageThumbnailUrl: buildPublicMediaUrl(input.imageMediaId, "thumbnail"),
    imageOriginalUrl: buildPublicMediaUrl(input.imageMediaId, "original"),
  };
}

async function ensurePublicCategoryImages(records: PublicProductCategoryRecord[]) {
  const mediaIds = records.flatMap((category) => {
    const rootMediaIds =
      category.imageMediaId != null &&
      category.imageMedia != null &&
      category.imageMedia.isActive &&
      category.imageMedia.deletedAt == null
        ? [Number(category.imageMediaId)]
        : [];

    const subcategoryMediaIds = category.subcategories.flatMap((subcategory) =>
      subcategory.imageMediaId != null &&
      subcategory.imageMedia != null &&
      subcategory.imageMedia.isActive &&
      subcategory.imageMedia.deletedAt == null
        ? [Number(subcategory.imageMediaId)]
        : [],
    );

    return [...rootMediaIds, ...subcategoryMediaIds];
  });

  await makeMediaPublicMany(mediaIds);
}

async function ensurePublicSubcategoryImage(record: PublicProductSubcategoryRecord) {
  const mediaIds =
    record.imageMediaId != null &&
    record.imageMedia != null &&
    record.imageMedia.isActive &&
    record.imageMedia.deletedAt == null
      ? [Number(record.imageMediaId)]
      : [];

  await makeMediaPublicMany(mediaIds);
}

function mapRootCategoryToMenuItem(
  category: PublicProductCategoryRecord,
  promotedCategoryIds: Set<string>,
): PublicMegaMenuProductCategory {
  const images = getPublicImageUrls(category);

  return {
    id: Number(category.id),
    href: `/produits/${category.slug}`,
    title: category.name,
    subtitle: category.subtitle?.trim() ?? "",
    descriptionSEO:
      category.descriptionSeo?.trim() ?? category.description?.trim() ?? "",
    imageUrl: images.imageUrl,
    imageUrlHD: images.imageUrlHD,
    slug: category.slug,
    parent: null,
    themeColor: resolveColorHex(category.themeColor),
    isPromoted: promotedCategoryIds.has(category.id.toString()),
  };
}

function mapSubcategoryToMenuItem(
  category: Pick<PublicProductCategoryRecord, "slug" | "themeColor">,
  subcategory: PublicProductCategoryRecord["subcategories"][number],
  promotedCategoryIds: Set<string>,
): PublicMegaMenuProductCategory {
  const images = getPublicImageUrls(subcategory);

  return {
    id: Number(subcategory.id),
    href: `/produits/${category.slug}/${subcategory.slug}`,
    title: subcategory.name,
    subtitle: subcategory.subtitle?.trim() ?? "",
    descriptionSEO:
      subcategory.descriptionSeo?.trim() ??
      subcategory.description?.trim() ??
      "",
    imageUrl: images.imageUrl,
    imageUrlHD: images.imageUrlHD,
    slug: subcategory.slug,
    parent: category.slug,
    themeColor: resolveColorHex(category.themeColor),
    isPromoted: promotedCategoryIds.has(subcategory.categoryId.toString()),
  };
}

function mapCategoryToPageData(
  category: PublicProductCategoryRecord,
  isPromoted = false,
): PublicProductCategoryPageData {
  const images = getPublicImageUrls(category);

  return {
    id: Number(category.id),
    name: category.name,
    subtitle: category.subtitle?.trim() ?? "",
    slug: category.slug,
    themeColor: resolveColorHex(category.themeColor),
    description: category.description?.trim() ?? "",
    descriptionSEO:
      category.descriptionSeo?.trim() ?? category.description?.trim() ?? "",
    href: `/produits/${category.slug}`,
    parentSlug: null,
    parentName: null,
    imageUrl: images.imageOriginalUrl,
    imageThumbnailUrl: images.imageThumbnailUrl,
    isPromoted,
  };
}

function mapSubcategoryToPageData(
  subcategory: PublicProductSubcategoryRecord,
): PublicProductCategoryPageData {
  const images = getPublicImageUrls(subcategory);

  return {
    id: Number(subcategory.id),
    name: subcategory.name,
    subtitle: subcategory.subtitle?.trim() ?? "",
    slug: subcategory.slug,
    themeColor: resolveColorHex(subcategory.category.themeColor),
    description: subcategory.description?.trim() ?? "",
    descriptionSEO:
      subcategory.descriptionSeo?.trim() ?? subcategory.description?.trim() ?? "",
    href: `/produits/${subcategory.category.slug}/${subcategory.slug}`,
    parentSlug: subcategory.category.slug,
    parentName: subcategory.category.name,
    imageUrl: images.imageOriginalUrl,
    imageThumbnailUrl: images.imageThumbnailUrl,
    isPromoted: false,
  };
}

function mapSubcategoryToCardData(
  category: Pick<PublicProductCategoryRecord, "slug">,
  subcategory: PublicProductCategoryRecord["subcategories"][number] & {
    productLinks?: Array<{ productId: bigint }>;
  },
): PublicProductSubcategoryCardData {
  const images = getPublicImageUrls(subcategory);

  return {
    id: Number(subcategory.id),
    name: subcategory.name,
    subtitle: subcategory.subtitle?.trim() ?? "",
    description:
      subcategory.descriptionSeo?.trim() ??
      subcategory.description?.trim() ??
      "",
    href: `/produits/${category.slug}/${subcategory.slug}`,
    imageUrl: images.imageOriginalUrl,
    imageThumbnailUrl: images.imageThumbnailUrl,
    productCount: subcategory.productLinks?.length ?? 0,
  };
}

export async function listPublicMegaMenuProductCategories(): Promise<
  PublicMegaMenuProductCategory[]
> {
  const hasVisibilityColumns = await hasProductSubcategoryVisibilityColumns();
  const categories = (await prisma.productCategory.findMany({
    where: {
      isActive: true,
      subcategories: {
        some: publicVitrineSubcategoryWhere(hasVisibilityColumns),
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
    select: publicCategorySelectFor(hasVisibilityColumns),
  })) as unknown as PublicProductCategoryRecord[];

  const [promotedCategoryIds] = await Promise.all([getPublicPromotedCategoryIds()]);
  await ensurePublicCategoryImages(categories);

  return categories.flatMap((category) => [
    mapRootCategoryToMenuItem(category, promotedCategoryIds),
    ...category.subcategories.map((subcategory) =>
      mapSubcategoryToMenuItem(category, subcategory, promotedCategoryIds),
    ),
  ]);
}

export async function findPublicRootProductCategoryBySlug(
  slug: string,
): Promise<PublicProductCategoryPageData | null> {
  const hasVisibilityColumns = await hasProductSubcategoryVisibilityColumns();
  const category = (await prisma.productCategory.findFirst({
    where: {
      isActive: true,
      slug,
      subcategories: {
        some: publicVitrineSubcategoryWhere(hasVisibilityColumns),
      },
    },
    select: publicCategorySelectFor(hasVisibilityColumns),
  })) as unknown as PublicProductCategoryRecord | null;

  if (!category) {
    return null;
  }

  const [promotedCategoryIds] = await Promise.all([getPublicPromotedCategoryIds()]);
  await ensurePublicCategoryImages([category]);
  return mapCategoryToPageData(category, promotedCategoryIds.has(category.id.toString()));
}

export async function findPublicProductSubcategoryBySlugs(input: {
  categorySlug: string;
  subcategorySlug: string;
}): Promise<PublicProductCategoryPageData | null> {
  const hasVisibilityColumns = await hasProductSubcategoryVisibilityColumns();
  const subcategory = await prisma.productSubcategory.findFirst({
    where: {
      ...publicVitrineSubcategoryWhere(hasVisibilityColumns),
      slug: input.subcategorySlug,
      category: {
        isActive: true,
        slug: input.categorySlug,
      },
    },
    select: publicSubcategorySelect,
  });

  if (!subcategory) {
    return null;
  }

  await ensurePublicSubcategoryImage(subcategory);
  return mapSubcategoryToPageData(subcategory);
}

export async function listPublicProductSubcategoryCardsByCategorySlug(
  categorySlug: string,
): Promise<PublicProductSubcategoryCardData[]> {
  const hasVisibilityColumns = await hasProductSubcategoryVisibilityColumns();
  const category = (await prisma.productCategory.findFirst({
    where: {
      isActive: true,
      slug: categorySlug,
      subcategories: {
        some: publicVitrineSubcategoryWhere(hasVisibilityColumns),
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
    select: publicCategoryCardSelectFor(hasVisibilityColumns),
  })) as unknown as PublicProductCategoryCardRecord | null;

  if (!category) {
    return [];
  }

  await ensurePublicCategoryImages([category]);

  return category.subcategories.map((subcategory) =>
    mapSubcategoryToCardData(category, subcategory),
  );
}
