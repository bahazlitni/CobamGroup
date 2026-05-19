import type { Prisma } from "@prisma/client";
import { makeMediaPublicMany } from "@/features/media/repository";
import { prisma } from "@/lib/server/db/prisma";

export type PublicPromotionKind = "PRODUCT" | "BRAND" | "CATEGORY" | "GENERAL";

export type PublicPromotionTargetCard = {
  id: string;
  kind: "product" | "brand" | "category";
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  href: string;
};

export type PublicPromotion = {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  description: string | null;
  kind: PublicPromotionKind;
  href: string;
  discountLabel: string;
  startsAt: string | null;
  endsAt: string | null;
  bannerImageUrl: string | null;
  bannerImageAlt: string;
  productCards: PublicPromotionTargetCard[];
  brandCards: PublicPromotionTargetCard[];
  categoryCards: PublicPromotionTargetCard[];
  mixedProductCards: PublicPromotionTargetCard[];
};

export type PublicPromotionScope = {
  id: bigint;
  slug: string;
  displayName: string;
  productIds: bigint[];
  categoryIds: bigint[];
  brandIds: bigint[];
  isGlobal: boolean;
};

const PROMOTION_PRODUCT_CARD_SELECT = {
  id: true,
  slug: true,
  name: true,
  displayName: true,
  brand: {
    select: {
      name: true,
    },
  },
  media: {
    where: {
      media: {
        kind: "IMAGE",
        isActive: true,
        deletedAt: null,
      },
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    take: 1,
    select: {
      altText: true,
      mediaId: true,
      media: {
        select: {
          id: true,
          altText: true,
          title: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  },
  subcategories: {
    where: {
      subcategory: {
        isActive: true,
        visibleVitrine: true,
        category: {
          isActive: true,
        },
      },
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
} satisfies Prisma.ProductSelect;

const PROMOTION_PUBLIC_SELECT = {
  id: true,
  name: true,
  displayName: true,
  slug: true,
  description: true,
  discountType: true,
  discountValue: true,
  startsAt: true,
  endsAt: true,
  bannerMediaId: true,
  bannerMedia: {
    select: {
      id: true,
      altText: true,
      title: true,
      isActive: true,
      deletedAt: true,
    },
  },
  products: {
    select: {
      productId: true,
      product: {
        select: PROMOTION_PRODUCT_CARD_SELECT,
      },
    },
  },
  categories: {
    select: {
      categoryId: true,
      category: {
        select: {
          id: true,
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
    },
  },
  brands: {
    select: {
      brandId: true,
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logoMediaId: true,
          logoMedia: {
            select: {
              id: true,
              isActive: true,
              deletedAt: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CommercePromotionSelect;

type PublicPromotionRecord = Prisma.CommercePromotionGetPayload<{
  select: typeof PROMOTION_PUBLIC_SELECT;
}>;

type PromotionProductRecord = Prisma.ProductGetPayload<{
  select: typeof PROMOTION_PRODUCT_CARD_SELECT;
}>;

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

function buildMediaUrl(mediaId: bigint | number, variant: "original" | "thumbnail" = "original") {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

function discountLabel(promotion: Pick<PublicPromotionRecord, "discountType" | "discountValue">) {
  if (promotion.discountType === "PERCENT") {
    return `-${promotion.discountValue.toString()}%`;
  }

  if (promotion.discountType === "FREE_SHIPPING") {
    return "Livraison offerte";
  }

  return `-${promotion.discountValue.toString()} TND`;
}

function getPromotionKind(promotion: PublicPromotionRecord): PublicPromotionKind {
  const scopedTypes = [
    promotion.products.length > 0,
    promotion.categories.length > 0,
    promotion.brands.length > 0,
  ].filter(Boolean).length;

  if (scopedTypes === 0 || scopedTypes > 1) {
    return "GENERAL";
  }

  if (promotion.products.length > 0) {
    return "PRODUCT";
  }

  if (promotion.brands.length > 0) {
    return "BRAND";
  }

  return "CATEGORY";
}

function getProductCardHref(product: PromotionProductRecord) {
  const link = product.subcategories[0]?.subcategory;

  if (!link) {
    return `/produits?search=${encodeURIComponent(product.displayName || product.name)}`;
  }

  return `/produits/${link.category.slug}/${link.slug}/${product.slug}`;
}

function mapProductCard(product: PromotionProductRecord): PublicPromotionTargetCard {
  const mediaLink = product.media[0] ?? null;
  const imageMediaId = mediaLink?.mediaId ?? null;

  return {
    id: product.id.toString(),
    kind: "product",
    title: product.displayName || product.name,
    subtitle: product.brand?.name ?? null,
    imageUrl: imageMediaId == null ? null : buildMediaUrl(imageMediaId, "thumbnail"),
    href: getProductCardHref(product),
  };
}

function mapCategoryCard(
  category: PublicPromotionRecord["categories"][number]["category"],
): PublicPromotionTargetCard {
  const hasImage =
    category.imageMediaId != null &&
    category.imageMedia != null &&
    category.imageMedia.isActive &&
    category.imageMedia.deletedAt == null;

  return {
    id: category.id.toString(),
    kind: "category",
    title: category.name,
    subtitle: category.subtitle ?? category.descriptionSeo ?? category.description ?? null,
    imageUrl: hasImage ? buildMediaUrl(category.imageMediaId!, "thumbnail") : null,
    href: `/produits/${category.slug}`,
  };
}

function mapBrandCard(
  brand: PublicPromotionRecord["brands"][number]["brand"],
): PublicPromotionTargetCard {
  const hasLogo =
    brand.logoMediaId != null &&
    brand.logoMedia != null &&
    brand.logoMedia.isActive &&
    brand.logoMedia.deletedAt == null;

  return {
    id: brand.id.toString(),
    kind: "brand",
    title: brand.name,
    subtitle: brand.description,
    imageUrl: hasLogo ? buildMediaUrl(brand.logoMediaId!, "thumbnail") : null,
    href: `/produits?search=${encodeURIComponent(brand.name)}`,
  };
}

function getPromotionProductWhere(scope: {
  productIds: bigint[];
  categoryIds: bigint[];
  brandIds: bigint[];
}): Prisma.ProductWhereInput {
  const scopedConditions: Prisma.ProductWhereInput[] = [];

  if (scope.productIds.length > 0) {
    scopedConditions.push({ id: { in: scope.productIds } });
  }

  if (scope.brandIds.length > 0) {
    scopedConditions.push({ brandId: { in: scope.brandIds } });
  }

  if (scope.categoryIds.length > 0) {
    scopedConditions.push({
      subcategories: {
        some: {
          subcategory: {
            categoryId: { in: scope.categoryIds },
            isActive: true,
            visibleVitrine: true,
            category: {
              isActive: true,
            },
          },
        },
      },
    });
  }

  return {
    kind: { in: ["STANDARD", "SINGLE", "VARIANT"] },
    visibleVitrine: true,
    subcategories: {
      some: {
        subcategory: {
          isActive: true,
          visibleVitrine: true,
          category: {
            isActive: true,
          },
        },
      },
    },
    ...(scopedConditions.length > 0 ? { OR: scopedConditions } : {}),
  };
}

async function loadConcernedProductCards(promotion: PublicPromotionRecord) {
  const products = await prisma.product.findMany({
    where: getPromotionProductWhere({
      productIds: promotion.products.map((link) => link.productId),
      categoryIds: promotion.categories.map((link) => link.categoryId),
      brandIds: promotion.brands.map((link) => link.brandId),
    }),
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    take: 12,
    select: PROMOTION_PRODUCT_CARD_SELECT,
  });

  await makeMediaPublicMany(products.flatMap((product) => product.media.map((link) => Number(link.mediaId))));

  return products.map(mapProductCard);
}

async function countConcernedProducts(scope: {
  productIds: bigint[];
  categoryIds: bigint[];
  brandIds: bigint[];
}) {
  return prisma.product.count({
    where: getPromotionProductWhere(scope),
  });
}

async function mapVisiblePublicPromotions(promotions: PublicPromotionRecord[]) {
  await ensurePromotionMediaPublic(promotions);

  const productCardEntries = await Promise.all(promotions.map(loadConcernedProductCards));

  return promotions
    .map((promotion, index) => mapPromotion(promotion, productCardEntries[index]))
    .filter((promotion) => promotion.productCards.length > 0);
}

async function ensurePromotionMediaPublic(promotions: PublicPromotionRecord[]) {
  const mediaIds = promotions.flatMap((promotion) => [
    ...(promotion.bannerMediaId != null &&
    promotion.bannerMedia != null &&
    promotion.bannerMedia.isActive &&
    promotion.bannerMedia.deletedAt == null
      ? [Number(promotion.bannerMediaId)]
      : []),
    ...promotion.products.flatMap((link) =>
      link.product.media.map((mediaLink) => Number(mediaLink.mediaId)),
    ),
    ...promotion.categories.flatMap((link) =>
      link.category.imageMediaId != null &&
      link.category.imageMedia != null &&
      link.category.imageMedia.isActive &&
      link.category.imageMedia.deletedAt == null
        ? [Number(link.category.imageMediaId)]
        : [],
    ),
    ...promotion.brands.flatMap((link) =>
      link.brand.logoMediaId != null &&
      link.brand.logoMedia != null &&
      link.brand.logoMedia.isActive &&
      link.brand.logoMedia.deletedAt == null
        ? [Number(link.brand.logoMediaId)]
        : [],
    ),
  ]);

  await makeMediaPublicMany(mediaIds);
}

function mapPromotion(
  promotion: PublicPromotionRecord,
  concernedProductCards: PublicPromotionTargetCard[],
): PublicPromotion {
  const kind = getPromotionKind(promotion);
  const hasBanner =
    promotion.bannerMediaId != null &&
    promotion.bannerMedia != null &&
    promotion.bannerMedia.isActive &&
    promotion.bannerMedia.deletedAt == null;

  return {
    id: promotion.id.toString(),
    name: promotion.name,
    displayName: promotion.displayName,
    slug: promotion.slug,
    description: promotion.description,
    kind,
    href: `/produits?promo=${encodeURIComponent(promotion.slug)}`,
    discountLabel: discountLabel(promotion),
    startsAt: promotion.startsAt?.toISOString() ?? null,
    endsAt: promotion.endsAt?.toISOString() ?? null,
    bannerImageUrl: hasBanner ? buildMediaUrl(promotion.bannerMediaId!, "original") : null,
    bannerImageAlt:
      promotion.bannerMedia?.altText ??
      promotion.bannerMedia?.title ??
      promotion.displayName,
    productCards: concernedProductCards,
    brandCards: promotion.brands.map((link) => mapBrandCard(link.brand)),
    categoryCards: promotion.categories.map((link) => mapCategoryCard(link.category)),
    mixedProductCards: concernedProductCards,
  };
}

export async function hasPublicActivePromotions() {
  const promotions = await prisma.commercePromotion.findMany({
    where: activePublicPromotionWhere(),
    select: {
      products: { select: { productId: true } },
      categories: { select: { categoryId: true } },
      brands: { select: { brandId: true } },
    },
  });

  const productCounts = await Promise.all(
    promotions.map((promotion) =>
      countConcernedProducts({
        productIds: promotion.products.map((link) => link.productId),
        categoryIds: promotion.categories.map((link) => link.categoryId),
        brandIds: promotion.brands.map((link) => link.brandId),
      }),
    ),
  );

  return productCounts.some((count) => count > 0);
}

export async function resolvePublicPromotionScopeBySlug(
  slug: string,
): Promise<PublicPromotionScope | null> {
  const promotion = await prisma.commercePromotion.findFirst({
    where: {
      ...activePublicPromotionWhere(),
      slug,
    },
    select: {
      id: true,
      slug: true,
      displayName: true,
      products: { select: { productId: true } },
      categories: { select: { categoryId: true } },
      brands: { select: { brandId: true } },
    },
  });

  if (!promotion) {
    return null;
  }

  const productIds = promotion.products.map((link) => link.productId);
  const categoryIds = promotion.categories.map((link) => link.categoryId);
  const brandIds = promotion.brands.map((link) => link.brandId);
  const productCount = await countConcernedProducts({
    productIds,
    categoryIds,
    brandIds,
  });

  if (productCount === 0) {
    return null;
  }

  return {
    id: promotion.id,
    slug: promotion.slug,
    displayName: promotion.displayName,
    productIds,
    categoryIds,
    brandIds,
    isGlobal: productIds.length + categoryIds.length + brandIds.length === 0,
  };
}

export async function findPublicPromotionSummaryBySlug(slug: string) {
  const promotion = await resolvePublicPromotionScopeBySlug(slug);

  if (!promotion) {
    return null;
  }

  return {
    id: promotion.id.toString(),
    slug: promotion.slug,
    displayName: promotion.displayName,
  };
}

export async function listPublicPromotions(): Promise<PublicPromotion[]> {
  const promotions = await prisma.commercePromotion.findMany({
    where: activePublicPromotionWhere(),
    orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
    take: 80,
    select: PROMOTION_PUBLIC_SELECT,
  });

  return mapVisiblePublicPromotions(promotions);
}

export async function listPublicPromotionBanners() {
  const promotions = await prisma.commercePromotion.findMany({
    where: {
      ...activePublicPromotionWhere(),
      bannerMediaId: { not: null },
    },
    orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
    select: PROMOTION_PUBLIC_SELECT,
  });

  const visiblePromotions = await mapVisiblePublicPromotions(promotions);

  return visiblePromotions.filter((promotion) => promotion.bannerImageUrl);
}
