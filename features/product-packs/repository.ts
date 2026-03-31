import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import type { ProductPackLineInput, ProductPackListQuery, ProductPackVariantSearchQuery } from "./types";

type ResolvedProductPackInput = {
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  descriptionSeo: string | null;
  mainImageMediaId: number | null;
  mediaIds: number[];
  lines: ProductPackLineInput[];
};

const packMediaSelect = {
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
} satisfies Prisma.MediaSelect;

const packVariantOptionSelect = {
  id: true,
  sku: true,
  slug: true,
  name: true,
  lifecycleStatus: true,
  visibility: true,
  commercialMode: true,
  priceVisibility: true,
  basePriceAmount: true,
  mediaLinks: {
    where: {
      role: "GALLERY",
    },
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    take: 1,
    select: {
      media: {
        select: packMediaSelect,
      },
    },
  },
  family: {
    select: {
      id: true,
      name: true,
      slug: true,
      vatRate: true,
      defaultVariant: {
        select: {
          lifecycleStatus: true,
          visibility: true,
          commercialMode: true,
          priceVisibility: true,
          basePriceAmount: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
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
      tagLinks: {
        orderBy: {
          tag: {
            name: "asc",
          },
        },
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      mediaLinks: {
        where: {
          role: "COVER",
        },
        orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
        take: 1,
        select: {
          media: {
            select: packMediaSelect,
          },
        },
      },
    },
  },
} satisfies Prisma.ProductVariantSelect;

const productPackSelect = {
  id: true,
  name: true,
  slug: true,
  subtitle: true,
  description: true,
  descriptionSeo: true,
  createdAt: true,
  updatedAt: true,
  mediaLinks: {
    orderBy: [{ role: "asc" }, { sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      role: true,
      sortOrder: true,
      media: {
        select: packMediaSelect,
      },
    },
  },
  lines: {
    orderBy: [{ sortOrder: "asc" }, { productVariantId: "asc" }],
    select: {
      productVariantId: true,
      quantity: true,
      sortOrder: true,
      productVariant: {
        select: packVariantOptionSelect,
      },
    },
  },
} satisfies Prisma.ProductPackSelect;

function buildProductPackWhere(query: ProductPackListQuery): Prisma.ProductPackWhereInput {
  if (!query.q) {
    return {};
  }

  return {
    OR: [
      { name: { contains: query.q, mode: "insensitive" } },
      { slug: { contains: query.q, mode: "insensitive" } },
      { subtitle: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { lines: { some: { productVariant: { sku: { contains: query.q, mode: "insensitive" } } } } },
      { lines: { some: { productVariant: { name: { contains: query.q, mode: "insensitive" } } } } },
      {
        lines: {
          some: {
            productVariant: {
              family: {
                name: { contains: query.q, mode: "insensitive" },
              },
            },
          },
        },
      },
    ],
  };
}

async function syncProductPackMediaLinks(
  tx: Prisma.TransactionClient,
  packId: bigint,
  mainImageMediaId: number | null,
  mediaIds: readonly number[],
) {
  const mainImageId = mainImageMediaId != null ? BigInt(mainImageMediaId) : null;
  const galleryIds = [...new Set(mediaIds)].map((mediaId) => BigInt(mediaId));

  await tx.productPackMediaLink.deleteMany({
    where: mainImageId
      ? {
          packId,
          role: "COVER",
          mediaId: {
            not: mainImageId,
          },
        }
      : {
          packId,
          role: "COVER",
        },
  });

  if (mainImageId != null) {
    await tx.productPackMediaLink.upsert({
      where: {
        packId_mediaId_role: {
          packId,
          mediaId: mainImageId,
          role: "COVER",
        },
      },
      update: {
        sortOrder: 0,
      },
      create: {
        packId,
        mediaId: mainImageId,
        role: "COVER",
        sortOrder: 0,
      },
    });
  }

  await tx.productPackMediaLink.deleteMany({
    where: galleryIds.length > 0
      ? {
          packId,
          role: "GALLERY",
          mediaId: {
            notIn: galleryIds,
          },
        }
      : {
          packId,
          role: "GALLERY",
        },
  });

  for (const [index, mediaId] of galleryIds.entries()) {
    await tx.productPackMediaLink.upsert({
      where: {
        packId_mediaId_role: {
          packId,
          mediaId,
          role: "GALLERY",
        },
      },
      update: {
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

async function syncProductPackLines(
  tx: Prisma.TransactionClient,
  packId: bigint,
  lines: readonly ProductPackLineInput[],
) {
  const keptVariantIds = lines.map((line) => BigInt(line.productVariantId));

  await tx.productPackLine.deleteMany({
    where: keptVariantIds.length > 0
      ? {
          packId,
          productVariantId: {
            notIn: keptVariantIds,
          },
        }
      : {
          packId,
        },
  });

  for (const line of lines) {
    const productVariantId = BigInt(line.productVariantId);

    await tx.productPackLine.upsert({
      where: {
        packId_productVariantId: {
          packId,
          productVariantId,
        },
      },
      update: {
        quantity: line.quantity,
        sortOrder: line.sortOrder,
      },
      create: {
        packId,
        productVariantId,
        quantity: line.quantity,
        sortOrder: line.sortOrder,
      },
    });
  }
}

export async function listProductPacks(query: ProductPackListQuery) {
  return prisma.productPack.findMany({
    where: buildProductPackWhere(query),
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
    select: productPackSelect,
  });
}

export async function countProductPacks(query: ProductPackListQuery) {
  return prisma.productPack.count({
    where: buildProductPackWhere(query),
  });
}

export async function findProductPackById(packId: number) {
  return prisma.productPack.findUnique({
    where: { id: BigInt(packId) },
    select: productPackSelect,
  });
}

export async function findProductPackBySlug(slug: string) {
  return prisma.productPack.findUnique({
    where: { slug },
    select: {
      id: true,
    },
  });
}

export async function searchProductPackVariants(query: ProductPackVariantSearchQuery) {
  return prisma.productVariant.findMany({
    where: query.q
      ? {
          OR: [
            { sku: { contains: query.q, mode: "insensitive" } },
            { name: { contains: query.q, mode: "insensitive" } },
            { slug: { contains: query.q, mode: "insensitive" } },
            {
              family: {
                name: { contains: query.q, mode: "insensitive" },
              },
            },
          ],
        }
      : undefined,
    orderBy: [{ family: { name: "asc" } }, { sortOrder: "asc" }, { createdAt: "asc" }],
    take: query.limit,
    select: packVariantOptionSelect,
  });
}

export async function findProductPackVariantsByIds(productVariantIds: readonly number[]) {
  if (productVariantIds.length === 0) {
    return [];
  }

  return prisma.productVariant.findMany({
    where: {
      id: {
        in: [...new Set(productVariantIds)].map((productVariantId) => BigInt(productVariantId)),
      },
    },
    select: packVariantOptionSelect,
  });
}

export async function createProductPack(input: ResolvedProductPackInput) {
  return prisma.$transaction(async (tx) => {
    const created = await tx.productPack.create({
      data: {
        name: input.name,
        slug: input.slug,
        subtitle: input.subtitle,
        description: input.description,
        descriptionSeo: input.descriptionSeo,
      },
      select: {
        id: true,
      },
    });

    await syncProductPackMediaLinks(tx, created.id, input.mainImageMediaId, input.mediaIds);
    await syncProductPackLines(tx, created.id, input.lines);

    return tx.productPack.findUniqueOrThrow({
      where: { id: created.id },
      select: productPackSelect,
    });
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
        subtitle: input.subtitle,
        description: input.description,
        descriptionSeo: input.descriptionSeo,
      },
    });

    await syncProductPackMediaLinks(tx, packIdValue, input.mainImageMediaId, input.mediaIds);
    await syncProductPackLines(tx, packIdValue, input.lines);

    return tx.productPack.findUniqueOrThrow({
      where: { id: packIdValue },
      select: productPackSelect,
    });
  });
}

export async function deleteProductPack(packId: number) {
  return prisma.productPack.delete({
    where: { id: BigInt(packId) },
    select: {
      id: true,
      name: true,
    },
  });
}

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
