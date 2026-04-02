import { Prisma } from "@prisma/client";
import {
  deleteAllProductsForPackTx,
  syncAllProductsForPackTx,
} from "@/features/all-products/repository";
import type { ProductPriceUnit } from "@/features/products/types";
import { prisma } from "@/lib/server/db/prisma";
import type { ProductPackListQuery } from "./types";

type ResolvedProductPackInput = {
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  descriptionSeo: string | null;
  productSubcategoryIds: number[];
  commercialMode: "REFERENCE_ONLY" | "QUOTE_ONLY" | "SELLABLE";
  lifecycleStatusMode: "AUTO" | "MANUAL";
  manualLifecycleStatus: "DRAFT" | "ACTIVE" | "ARCHIVED" | null;
  visibilityMode: "AUTO" | "MANUAL";
  manualVisibility: "HIDDEN" | "PUBLIC" | null;
  priceVisibilityMode: "AUTO" | "MANUAL";
  manualPriceVisibility: "HIDDEN" | "VISIBLE" | null;
  mainImageMediaId: number | null;
  mediaIds: number[];
  lines: Array<{
    variantId: number;
    quantity: number;
    sortOrder: number;
  }>;
};

const productPackLinkedMediaSelect = Prisma.validator<Prisma.MediaSelect>()({
  id: true,
  kind: true,
  title: true,
  originalFilename: true,
  altText: true,
  mimeType: true,
  extension: true,
  widthPx: true,
  heightPx: true,
  sizeBytes: true,
});

const productPackSelect = Prisma.validator<Prisma.ProductPackSelect>()({
  id: true,
  name: true,
  slug: true,
  sku: true,
  description: true,
  descriptionSeo: true,
  commercialMode: true,
  lifecycleStatusMode: true,
  manualLifecycleStatus: true,
  visibilityMode: true,
  manualVisibility: true,
  priceVisibilityMode: true,
  manualPriceVisibility: true,
  createdAt: true,
  updatedAt: true,
  subcategories: {
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      categoryId: true,
      name: true,
      slug: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
  mediaLinks: {
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      role: true,
      sortOrder: true,
      media: {
        select: productPackLinkedMediaSelect,
      },
    },
  },
  lines: {
    orderBy: [{ sortOrder: "asc" }, { variantId: "asc" }],
    select: {
      variantId: true,
      quantity: true,
      sortOrder: true,
      variant: {
        select: {
          familyId: true,
          name: true,
          slug: true,
          sku: true,
        },
      },
    },
  },
});

type ProductPackRecord = Prisma.ProductPackGetPayload<{ select: typeof productPackSelect }>;

type ProjectedPackRecord = {
  sourceId: bigint;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  descriptionSeo: string | null;
  lifecycleStatus: "DRAFT" | "ACTIVE" | "ARCHIVED";
  visibility: "HIDDEN" | "PUBLIC";
  commercialMode: "REFERENCE_ONLY" | "QUOTE_ONLY" | "SELLABLE";
  priceVisibility: "HIDDEN" | "VISIBLE";
  basePriceAmount: Prisma.Decimal | null;
  priceUnit: ProductPriceUnit;
  vatRate: number;
  brandIds: bigint[];
  tags: string;
  coverMediaId: bigint | null;
};

function buildProductPackWhere(query: ProductPackListQuery): Prisma.ProductPackWhereInput {
  if (!query.q?.trim()) {
    return {};
  }

  return {
    OR: [
      { name: { contains: query.q, mode: "insensitive" } },
      { slug: { contains: query.q, mode: "insensitive" } },
      { sku: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { descriptionSeo: { contains: query.q, mode: "insensitive" } },
      {
        subcategories: {
          some: {
            name: { contains: query.q, mode: "insensitive" },
          },
        },
      },
    ],
  };
}

async function syncPackCoverMedia(
  tx: Prisma.TransactionClient,
  packId: bigint,
  mediaId: number | null,
) {
  const mediaIdValue = mediaId != null ? BigInt(mediaId) : null;

  await tx.productPackMediaLink.deleteMany({
    where: mediaIdValue
      ? {
          packId,
          role: "COVER",
          mediaId: {
            not: mediaIdValue,
          },
        }
      : {
          packId,
          role: "COVER",
        },
  });

  if (!mediaIdValue) {
    return;
  }

  await tx.productPackMediaLink.upsert({
    where: {
      packId_mediaId: {
        packId,
        mediaId: mediaIdValue,
      },
    },
    update: {
      role: "COVER",
      sortOrder: 0,
    },
    create: {
      packId,
      mediaId: mediaIdValue,
      role: "COVER",
      sortOrder: 0,
    },
  });
}

async function syncPackGalleryMedia(
  tx: Prisma.TransactionClient,
  packId: bigint,
  mediaIds: readonly number[],
) {
  const uniqueMediaIds = [...new Set(mediaIds)].map((mediaId) => BigInt(mediaId));

  await tx.productPackMediaLink.deleteMany({
    where: uniqueMediaIds.length
      ? {
          packId,
          role: "GALLERY",
          mediaId: {
            notIn: uniqueMediaIds,
          },
        }
      : {
          packId,
          role: "GALLERY",
        },
  });

  for (const [index, mediaId] of uniqueMediaIds.entries()) {
    await tx.productPackMediaLink.upsert({
      where: {
        packId_mediaId: {
          packId,
          mediaId,
        },
      },
      update: {
        role: "GALLERY",
        sortOrder: index,
      },
      create: {
        packId,
        mediaId,
        role: "GALLERY",
        sortOrder: index,
      },
    });
  }
}

async function syncPackSubcategories(
  tx: Prisma.TransactionClient,
  packId: bigint,
  productSubcategoryIds: readonly number[],
) {
  await tx.productPack.update({
    where: { id: packId },
    data: {
      subcategories: {
        set: productSubcategoryIds.map((productSubcategoryId) => ({
          id: BigInt(productSubcategoryId),
        })),
      },
    },
  });
}

async function syncPackLines(
  tx: Prisma.TransactionClient,
  packId: bigint,
  lines: ResolvedProductPackInput["lines"],
) {
  await tx.productPackLine.deleteMany({
    where: { packId },
  });

  if (lines.length === 0) {
    return;
  }

  await tx.productPackLine.createMany({
    data: lines.map((line) => ({
      packId,
      variantId: BigInt(line.variantId),
      quantity: line.quantity,
      sortOrder: line.sortOrder,
    })),
  });
}

async function findProjectedPacksByPackIds(
  packIds: readonly bigint[],
) {
  if (packIds.length === 0) {
    return [];
  }

  return prisma.allProduct.findMany({
    where: {
      sourceType: "PACK",
      sourceId: {
        in: [...packIds],
      },
    },
    select: {
      sourceId: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      descriptionSeo: true,
      lifecycleStatus: true,
      visibility: true,
      commercialMode: true,
      priceVisibility: true,
      basePriceAmount: true,
      priceUnit: true,
      vatRate: true,
      brandIds: true,
      tags: true,
      coverMediaId: true,
    },
  });
}

export async function listProductPacks(query: ProductPackListQuery) {
  const packs = await prisma.productPack.findMany({
    where: buildProductPackWhere(query),
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
    select: productPackSelect,
  });
  const projected = await findProjectedPacksByPackIds(packs.map((pack) => pack.id));

  return {
    packs,
    projected,
  };
}

export async function countProductPacks(query: ProductPackListQuery) {
  return prisma.productPack.count({
    where: buildProductPackWhere(query),
  });
}

export async function findProductPackById(packId: number) {
  const pack = await prisma.productPack.findUnique({
    where: { id: BigInt(packId) },
    select: productPackSelect,
  });

  if (!pack) {
    return null;
  }

  const projected = await prisma.allProduct.findUnique({
    where: {
      sourceType_sourceId: {
        sourceType: "PACK",
        sourceId: pack.id,
      },
    },
    select: {
      sourceId: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      descriptionSeo: true,
      lifecycleStatus: true,
      visibility: true,
      commercialMode: true,
      priceVisibility: true,
      basePriceAmount: true,
      priceUnit: true,
      vatRate: true,
      brandIds: true,
      tags: true,
      coverMediaId: true,
    },
  });

  if (!projected) {
    return null;
  }

  return {
    pack,
    projected,
  };
}

export async function findProductPackBySlug(slug: string) {
  return prisma.productPack.findUnique({
    where: { slug },
    select: { id: true },
  });
}

export async function findProductPackBySku(sku: string) {
  return prisma.productPack.findUnique({
    where: { sku },
    select: { id: true },
  });
}

export async function findProductPacksBySlugs(slugs: readonly string[]) {
  if (slugs.length === 0) {
    return [];
  }

  return prisma.productPack.findMany({
    where: {
      slug: {
        in: [...new Set(slugs)],
      },
    },
    select: {
      id: true,
      slug: true,
    },
  });
}

export async function findProductPacksBySkus(skus: readonly string[]) {
  if (skus.length === 0) {
    return [];
  }

  return prisma.productPack.findMany({
    where: {
      sku: {
        in: [...new Set(skus)],
      },
    },
    select: {
      id: true,
      sku: true,
    },
  });
}

export async function createProductPack(input: ResolvedProductPackInput) {
  return prisma.$transaction(async (tx) => {
    const created = await tx.productPack.create({
      data: {
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        description: input.description,
        descriptionSeo: input.descriptionSeo,
        commercialMode: input.commercialMode,
        lifecycleStatusMode: input.lifecycleStatusMode,
        manualLifecycleStatus: input.manualLifecycleStatus,
        visibilityMode: input.visibilityMode,
        manualVisibility: input.manualVisibility,
        priceVisibilityMode: input.priceVisibilityMode,
        manualPriceVisibility: input.manualPriceVisibility,
      },
      select: {
        id: true,
      },
    });

    await syncPackCoverMedia(tx, created.id, input.mainImageMediaId);
    await syncPackGalleryMedia(tx, created.id, input.mediaIds);
    await syncPackSubcategories(tx, created.id, input.productSubcategoryIds);
    await syncPackLines(tx, created.id, input.lines);
    await syncAllProductsForPackTx(tx, created.id);

    const pack = await tx.productPack.findUniqueOrThrow({
      where: { id: created.id },
      select: productPackSelect,
    });
    const projected = await tx.allProduct.findUniqueOrThrow({
      where: {
        sourceType_sourceId: {
          sourceType: "PACK",
          sourceId: created.id,
        },
      },
      select: {
        sourceId: true,
        name: true,
        slug: true,
        sku: true,
        description: true,
        descriptionSeo: true,
        lifecycleStatus: true,
        visibility: true,
        commercialMode: true,
        priceVisibility: true,
        basePriceAmount: true,
        priceUnit: true,
        vatRate: true,
        brandIds: true,
        tags: true,
        coverMediaId: true,
      },
    });

    return {
      pack,
      projected,
    };
  });
}

export async function updateProductPack(packId: number, input: ResolvedProductPackInput) {
  return prisma.$transaction(async (tx) => {
    const packIdValue = BigInt(packId);

    await tx.productPack.update({
      where: { id: packIdValue },
      data: {
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        description: input.description,
        descriptionSeo: input.descriptionSeo,
        commercialMode: input.commercialMode,
        lifecycleStatusMode: input.lifecycleStatusMode,
        manualLifecycleStatus: input.manualLifecycleStatus,
        visibilityMode: input.visibilityMode,
        manualVisibility: input.manualVisibility,
        priceVisibilityMode: input.priceVisibilityMode,
        manualPriceVisibility: input.manualPriceVisibility,
      },
    });

    await syncPackCoverMedia(tx, packIdValue, input.mainImageMediaId);
    await syncPackGalleryMedia(tx, packIdValue, input.mediaIds);
    await syncPackSubcategories(tx, packIdValue, input.productSubcategoryIds);
    await syncPackLines(tx, packIdValue, input.lines);
    await syncAllProductsForPackTx(tx, packIdValue);

    const pack = await tx.productPack.findUniqueOrThrow({
      where: { id: packIdValue },
      select: productPackSelect,
    });
    const projected = await tx.allProduct.findUniqueOrThrow({
      where: {
        sourceType_sourceId: {
          sourceType: "PACK",
          sourceId: packIdValue,
        },
      },
      select: {
        sourceId: true,
        name: true,
        slug: true,
        sku: true,
        description: true,
        descriptionSeo: true,
        lifecycleStatus: true,
        visibility: true,
        commercialMode: true,
        priceVisibility: true,
        basePriceAmount: true,
        priceUnit: true,
        vatRate: true,
        brandIds: true,
        tags: true,
        coverMediaId: true,
      },
    });

    return {
      pack,
      projected,
    };
  });
}

export async function deleteProductPack(packId: number) {
  return prisma.$transaction(async (tx) => {
    const deleted = await tx.productPack.delete({
      where: { id: BigInt(packId) },
      select: {
        id: true,
        name: true,
      },
    });

    await deleteAllProductsForPackTx(tx, deleted.id);

    return deleted;
  });
}

export type ProductPackRepositoryRecord = ProductPackRecord;
export type ProjectedPackRepositoryRecord = ProjectedPackRecord;

function toAuditJson(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function createProductPackAuditLog(data: {
  actorUserId: string;
  actionType: "CREATE" | "UPDATE" | "DELETE";
  entityId: string;
  targetLabel: string;
  summary: string;
  beforeSnapshotJson?: unknown;
  afterSnapshotJson?: unknown;
}) {
  return prisma.auditLog.create({
    data: {
      actorUserId: data.actorUserId,
      actionType: data.actionType,
      entityType: "ProductPack",
      entityId: data.entityId,
      targetLabel: data.targetLabel,
      summary: data.summary,
      beforeSnapshotJson: toAuditJson(data.beforeSnapshotJson),
      afterSnapshotJson: toAuditJson(data.afterSnapshotJson),
    },
  });
}
