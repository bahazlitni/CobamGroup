import { Prisma } from "@prisma/client";
import { getArticleFirstParagraphText } from "@/features/articles/document";
import { makeMediaPublicMany } from "@/features/media/repository";
import { prisma } from "@/lib/server/db/prisma";

export const PUBLIC_PRODUCTS_PAGE_SIZE = 6;

export type PublicProductSummary = {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  brandName: string;
  price: string | null;
  imageUrl: string | null;
  imageThumbnailUrl: string | null;
  imageAlt: string | null;
};

export type PublicProductListQuery = {
  categorySlug: string;
  subcategorySlug: string;
  page: number;
  pageSize: number;
};

export type PublicProductListResult = {
  items: PublicProductSummary[];
  total: number;
  page: number;
  pageSize: number;
};

type PublicProductImageRelation = {
  id: bigint;
  altText: string | null;
  title: string | null;
  isActive: boolean;
  deletedAt: Date | null;
} | null;

type PublicProductRecord = {
  id: bigint;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  brand: {
    name: string;
  } | null;
  variants: Array<{
    lifecycleStatus: "DRAFT" | "ACTIVE" | "ARCHIVED" | null;
    visibility: "HIDDEN" | "PUBLIC" | null;
    priceVisibility: "HIDDEN" | "VISIBLE" | null;
    basePriceAmount: { toString(): string } | number | null;
  }>;
  mediaLinks: Array<{
    mediaId: bigint;
    media: PublicProductImageRelation;
  }>;
};

const publicProductSelect = {
  id: true,
  name: true,
  slug: true,
  subtitle: true,
  description: true,
  brand: {
    select: {
      name: true,
    },
  },
  variants: {
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      lifecycleStatus: true,
      visibility: true,
      priceVisibility: true,
      basePriceAmount: true,
    },
  },
  mediaLinks: {
    where: {
      role: "COVER",
    },
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
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
} satisfies Prisma.ProductFamilySelect;

function buildPublicMediaUrl(
  mediaId: bigint | number,
  variant: "original" | "thumbnail" = "original",
) {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

function buildPublicProductsWhere(
  input: Pick<PublicProductListQuery, "categorySlug" | "subcategorySlug">,
): Prisma.ProductFamilyWhereInput {
  return {
    variants: {
      some: {
        lifecycleStatus: "ACTIVE",
        visibility: "PUBLIC",
      },
    },
    subcategories: {
      some: {
        isActive: true,
        slug: input.subcategorySlug,
        category: {
          isActive: true,
          slug: input.categorySlug,
        },
      },
    },
  };
}

async function ensurePublicProductImages(records: PublicProductRecord[]) {
  const mediaIds = records.flatMap((record) => {
    const coverMedia = record.mediaLinks[0];

    if (
      coverMedia?.mediaId == null ||
      coverMedia.media == null ||
      !coverMedia.media.isActive ||
      coverMedia.media.deletedAt != null
    ) {
      return [];
    }

    return [Number(coverMedia.mediaId)];
  });

  await makeMediaPublicMany(mediaIds);
}

function mapPublicProductSummary(product: PublicProductRecord): PublicProductSummary {
  const coverMedia = product.mediaLinks[0];
  const hasCover =
    coverMedia?.mediaId != null &&
    coverMedia.media != null &&
    coverMedia.media.isActive &&
    coverMedia.media.deletedAt == null;
  const descriptionPreview = getArticleFirstParagraphText(product.description);
  const visiblePriceVariant =
    product.variants.find(
      (variant) =>
        variant.lifecycleStatus === "ACTIVE" &&
        variant.visibility === "PUBLIC" &&
        variant.priceVisibility === "VISIBLE" &&
        variant.basePriceAmount != null,
    ) ?? null;

  return {
    id: Number(product.id),
    name: product.name,
    slug: product.slug,
    subtitle: product.subtitle?.trim() ?? "",
    description: descriptionPreview || "Découvrez cette famille produit COBAM GROUP.",
    brandName: product.brand?.name ?? "Sans marque",
    price: visiblePriceVariant?.basePriceAmount != null ? String(visiblePriceVariant.basePriceAmount) : null,
    imageUrl:
      hasCover && coverMedia?.mediaId != null
        ? buildPublicMediaUrl(coverMedia.mediaId, "original")
        : null,
    imageThumbnailUrl:
      hasCover && coverMedia?.mediaId != null
        ? buildPublicMediaUrl(coverMedia.mediaId, "thumbnail")
        : null,
    imageAlt: coverMedia?.media?.altText ?? coverMedia?.media?.title ?? product.name,
  };
}

export async function listPublicProductsBySubcategory(
  input: PublicProductListQuery,
): Promise<PublicProductListResult> {
  const normalizedPage = Number.isInteger(input.page) && input.page > 0 ? input.page : 1;
  const normalizedPageSize =
    Number.isInteger(input.pageSize) && input.pageSize > 0
      ? Math.min(input.pageSize, 24)
      : PUBLIC_PRODUCTS_PAGE_SIZE;
  const where = buildPublicProductsWhere(input);

  const [items, total] = await Promise.all([
    prisma.productFamily.findMany({
      where,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: (normalizedPage - 1) * normalizedPageSize,
      take: normalizedPageSize,
      select: publicProductSelect,
    }),
    prisma.productFamily.count({
      where,
    }),
  ]);

  await ensurePublicProductImages(items);

  return {
    items: items.map(mapPublicProductSummary),
    total,
    page: normalizedPage,
    pageSize: normalizedPageSize,
  };
}
