import { MediaKind, MediaVisibility, Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import type {
  MediaFilterStatus,
  MediaListQuery,
  MediaUpdateInput,
} from "./types";

function buildMediaWhere(input: {
  query: MediaListQuery;
  ownerUserId: string | null;
}): Prisma.MediaWhereInput {
  const where: Prisma.MediaWhereInput = {
    deletedAt: null,
  };

  if (input.ownerUserId) {
    where.uploadedByUserId = input.ownerUserId;
  }

  if (input.query.q) {
    where.OR = [
      { originalFilename: { contains: input.query.q, mode: "insensitive" } },
      { title: { contains: input.query.q, mode: "insensitive" } },
      { description: { contains: input.query.q, mode: "insensitive" } },
      { altText: { contains: input.query.q, mode: "insensitive" } },
      { mimeType: { contains: input.query.q, mode: "insensitive" } },
      { storagePath: { contains: input.query.q, mode: "insensitive" } },
    ];
  }

  if (input.query.kind && input.query.kind !== "ALL") {
    where.kind = input.query.kind;
  }

  if (input.query.status === "active") {
    where.isActive = true;
  } else if (input.query.status === "inactive") {
    where.isActive = false;
  }

  return where;
}

function buildMediaOrderBy(
  query: MediaListQuery,
): Prisma.MediaOrderByWithRelationInput[] {
  const direction = query.sortDirection ?? "desc";

  switch (query.sortBy) {
    case "name":
      return [
        { originalFilename: direction },
        { title: direction },
        { storagePath: direction },
        { id: direction },
      ];

    case "size":
      return [
        { sizeBytes: direction },
        { createdAt: "desc" },
        { id: "desc" },
      ];

    case "date":
    default:
      return [
        { createdAt: direction },
        { id: direction },
      ];
  }
}

const mediaSelect = {
  id: true,
  kind: true,
  visibility: true,
  storagePath: true,
  originalFilename: true,
  mimeType: true,
  extension: true,
  altText: true,
  title: true,
  description: true,
  widthPx: true,
  heightPx: true,
  durationSeconds: true,
  sizeBytes: true,
  sha256Hash: true,
  isActive: true,
  uploadedByUserId: true,
  createdAt: true,
  updatedAt: true,
  uploadedByUser: {
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
} satisfies Prisma.MediaSelect;

type MediaUsageCounts = {
  productModelLinks: number;
  productLinks: number;
  brandLogoFor: number;
  productCategoryImageFor: number;
  staffProfileAvatarFor: number;
  articleMediaLinks: number;
  articleCoverFor: number;
  articleOgImageFor: number;
};

export type DetachedMediaReferenceCounts = {
  productModelLinks: number;
  productLinks: number;
  brandLogos: number;
  productCategoryImages: number;
  staffAvatars: number;
  articleAttachments: number;
  articleCovers: number;
  articleOgImages: number;
  total: number;
};

type MediaRecord = Prisma.MediaGetPayload<{
  select: typeof mediaSelect;
}>;

function createEmptyMediaUsageCounts(): MediaUsageCounts {
  return {
    productModelLinks: 0,
    productLinks: 0,
    brandLogoFor: 0,
    productCategoryImageFor: 0,
    staffProfileAvatarFor: 0,
    articleMediaLinks: 0,
    articleCoverFor: 0,
    articleOgImageFor: 0,
  };
}

function incrementUsageCount(
  countsByMediaId: Map<string, MediaUsageCounts>,
  mediaId: bigint | null | undefined,
  field: keyof MediaUsageCounts,
) {
  if (mediaId == null) {
    return;
  }

  const key = mediaId.toString();
  const counts = countsByMediaId.get(key);

  if (!counts) {
    return;
  }

  counts[field] += 1;
}

async function attachMediaUsageCounts<T extends MediaRecord>(records: T[]) {
  if (records.length === 0) {
    return [] as Array<T & { _count: MediaUsageCounts }>;
  }

  const mediaIds = [...new Set(records.map((record) => record.id.toString()))].map((id) =>
    BigInt(id),
  );
  const countsByMediaId = new Map(
    mediaIds.map((mediaId) => [mediaId.toString(), createEmptyMediaUsageCounts()]),
  );

  const [
    productModelLinks,
    productLinks,
    brandLogos,
    productCategoryImages,
    staffAvatars,
    articleAttachments,
    articleCovers,
    articleOgImages,
  ] = await Promise.all([
    prisma.productModelMediaLink.findMany({
      where: {
        mediaId: {
          in: mediaIds,
        },
      },
      select: {
        mediaId: true,
      },
    }),
    prisma.productMediaLink.findMany({
      where: {
        mediaId: {
          in: mediaIds,
        },
      },
      select: {
        mediaId: true,
      },
    }),
    prisma.productBrand.findMany({
      where: {
        deletedAt: null,
        logoMediaId: {
          in: mediaIds,
        },
      },
      select: {
        logoMediaId: true,
      },
    }),
    prisma.productCategory.findMany({
      where: {
        imageMediaId: {
          in: mediaIds,
        },
      },
      select: {
        imageMediaId: true,
      },
    }),
    prisma.staffProfile.findMany({
      where: {
        avatarMediaId: {
          in: mediaIds,
        },
      },
      select: {
        avatarMediaId: true,
      },
    }),
    prisma.articleMediaLink.findMany({
      where: {
        mediaId: {
          in: mediaIds,
        },
        article: {
          deletedAt: null,
        },
      },
      select: {
        mediaId: true,
      },
    }),
    prisma.article.findMany({
      where: {
        deletedAt: null,
        coverMediaId: {
          in: mediaIds,
        },
      },
      select: {
        coverMediaId: true,
      },
    }),
    prisma.article.findMany({
      where: {
        deletedAt: null,
        ogImageMediaId: {
          in: mediaIds,
        },
      },
      select: {
        ogImageMediaId: true,
      },
    }),
  ]);

  for (const link of productModelLinks) {
    incrementUsageCount(countsByMediaId, link.mediaId, "productModelLinks");
  }

  for (const link of productLinks) {
    incrementUsageCount(countsByMediaId, link.mediaId, "productLinks");
  }

  for (const brand of brandLogos) {
    incrementUsageCount(countsByMediaId, brand.logoMediaId, "brandLogoFor");
  }

  for (const category of productCategoryImages) {
    incrementUsageCount(
      countsByMediaId,
      category.imageMediaId,
      "productCategoryImageFor",
    );
  }

  for (const profile of staffAvatars) {
    incrementUsageCount(countsByMediaId, profile.avatarMediaId, "staffProfileAvatarFor");
  }

  for (const link of articleAttachments) {
    incrementUsageCount(countsByMediaId, link.mediaId, "articleMediaLinks");
  }

  for (const article of articleCovers) {
    incrementUsageCount(countsByMediaId, article.coverMediaId, "articleCoverFor");
  }

  for (const article of articleOgImages) {
    incrementUsageCount(countsByMediaId, article.ogImageMediaId, "articleOgImageFor");
  }

  return records.map((record) => ({
    ...record,
    _count: countsByMediaId.get(record.id.toString()) ?? createEmptyMediaUsageCounts(),
  }));
}

export async function listMedia(input: {
  query: MediaListQuery;
  ownerUserId: string | null;
}) {
  const records = await prisma.media.findMany({
    where: buildMediaWhere(input),
    orderBy: buildMediaOrderBy(input.query),
    skip: (input.query.page - 1) * input.query.pageSize,
    take: input.query.pageSize,
    select: mediaSelect,
  });

  return attachMediaUsageCounts(records);
}

export async function countMedia(input: {
  query: MediaListQuery;
  ownerUserId: string | null;
}) {
  return prisma.media.count({
    where: buildMediaWhere(input),
  });
}

export async function aggregateMediaStats(input: {
  q?: string;
  status?: MediaFilterStatus;
  ownerUserId: string | null;
}) {
  const baseWhere = buildMediaWhere({
    query: {
      page: 1,
      pageSize: 1,
      q: input.q,
      kind: "ALL",
      status: input.status,
    },
    ownerUserId: input.ownerUserId,
  });

  const [total, images, videos, documents, totalSize] = await Promise.all([
    prisma.media.count({ where: baseWhere }),
    prisma.media.count({ where: { ...baseWhere, kind: MediaKind.IMAGE } }),
    prisma.media.count({ where: { ...baseWhere, kind: MediaKind.VIDEO } }),
    prisma.media.count({ where: { ...baseWhere, kind: MediaKind.DOCUMENT } }),
    prisma.media.aggregate({
      where: baseWhere,
      _sum: {
        sizeBytes: true,
      },
    }),
  ]);

  return {
    total,
    images,
    videos,
    documents,
    totalSizeBytes: totalSize._sum.sizeBytes,
  };
}

export async function findMediaById(mediaId: number) {
  const record = await prisma.media.findFirst({
    where: {
      id: BigInt(mediaId),
      deletedAt: null,
    },
    select: mediaSelect,
  });

  if (!record) {
    return null;
  }

  const [media] = await attachMediaUsageCounts([record]);
  return media;
}

export async function findImageMediaById(mediaId: number) {
  return prisma.media.findFirst({
    where: {
      id: BigInt(mediaId),
      kind: MediaKind.IMAGE,
      deletedAt: null,
      isActive: true,
    },
    select: {
      id: true,
    },
  });
}

export async function findPublicMediaById(mediaId: number) {
  return prisma.media.findFirst({
    where: {
      id: BigInt(mediaId),
      deletedAt: null,
      isActive: true,
      visibility: MediaVisibility.PUBLIC,
    },
    select: {
      id: true,
      kind: true,
      visibility: true,
      storagePath: true,
      originalFilename: true,
      mimeType: true,
      extension: true,
    },
  });
}

export async function createMediaRecord(input: {
  kind: MediaKind;
  visibility: MediaVisibility;
  storagePath: string;
  originalFilename: string | null;
  mimeType: string | null;
  extension: string | null;
  title: string | null;
  altText: string | null;
  description: string | null;
  widthPx?: number | null;
  heightPx?: number | null;
  sizeBytes: bigint;
  sha256Hash: string;
  uploadedByUserId: string;
}) {
  const record = await prisma.media.create({
    data: {
      kind: input.kind,
      visibility: input.visibility,
      storagePath: input.storagePath,
      originalFilename: input.originalFilename,
      mimeType: input.mimeType,
      extension: input.extension,
      title: input.title,
      altText: input.altText,
      description: input.description,
      widthPx: input.widthPx ?? null,
      heightPx: input.heightPx ?? null,
      sizeBytes: input.sizeBytes,
      sha256Hash: input.sha256Hash,
      isActive: true,
      uploadedByUserId: input.uploadedByUserId,
      updatedByUserId: input.uploadedByUserId,
    },
    select: mediaSelect,
  });

  const [media] = await attachMediaUsageCounts([record]);
  return media;
}

export async function updateMediaRecord(
  mediaId: number,
  input: MediaUpdateInput & { updatedByUserId: string },
) {
  const record = await prisma.media.update({
    where: { id: BigInt(mediaId) },
    data: {
      visibility: input.visibility,
      updatedByUserId: input.updatedByUserId,
    },
    select: mediaSelect,
  });

  const [media] = await attachMediaUsageCounts([record]);
  return media;
}

export async function makeMediaPublic(mediaId: number) {
  return prisma.media.updateMany({
    where: {
      id: BigInt(mediaId),
      deletedAt: null,
      isActive: true,
    },
    data: {
      visibility: MediaVisibility.PUBLIC,
    },
  });
}

export async function makeMediaPublicMany(mediaIds: readonly number[]) {
  const normalizedIds = [...new Set(mediaIds.filter((mediaId) => Number.isInteger(mediaId) && mediaId > 0))];

  if (normalizedIds.length === 0) {
    return { count: 0 };
  }

  return prisma.media.updateMany({
    where: {
      id: {
        in: normalizedIds.map((mediaId) => BigInt(mediaId)),
      },
      deletedAt: null,
      isActive: true,
    },
    data: {
      visibility: MediaVisibility.PUBLIC,
    },
  });
}

export async function deleteMediaRecord(mediaId: number) {
  const record = await prisma.media.delete({
    where: { id: BigInt(mediaId) },
    select: mediaSelect,
  });

  const [media] = await attachMediaUsageCounts([record]);
  return media;
}

export async function detachMediaReferencesAndDeleteMediaRecord(mediaId: number) {
  const mediaIdValue = BigInt(mediaId);

  return prisma.$transaction(async (tx) => {
    const productModelLinks = await tx.productModelMediaLink.deleteMany({
      where: {
        mediaId: mediaIdValue,
      },
    });
    const productLinks = await tx.productMediaLink.deleteMany({
      where: {
        mediaId: mediaIdValue,
      },
    });
    const brandLogos = await tx.productBrand.updateMany({
      where: {
        logoMediaId: mediaIdValue,
      },
      data: {
        logoMediaId: null,
      },
    });
    const productCategoryImages = await tx.productCategory.updateMany({
      where: {
        imageMediaId: mediaIdValue,
      },
      data: {
        imageMediaId: null,
      },
    });
    const staffAvatars = await tx.staffProfile.updateMany({
      where: {
        avatarMediaId: mediaIdValue,
      },
      data: {
        avatarMediaId: null,
      },
    });
    const articleAttachments = await tx.articleMediaLink.deleteMany({
      where: {
        mediaId: mediaIdValue,
      },
    });
    const articleCovers = await tx.article.updateMany({
      where: {
        coverMediaId: mediaIdValue,
      },
      data: {
        coverMediaId: null,
      },
    });
    const articleOgImages = await tx.article.updateMany({
      where: {
        ogImageMediaId: mediaIdValue,
      },
      data: {
        ogImageMediaId: null,
      },
    });
    const deletedMedia = await tx.media.delete({
      where: { id: mediaIdValue },
      select: mediaSelect,
    });

    const detachedReferences: DetachedMediaReferenceCounts = {
      productModelLinks: productModelLinks.count,
      productLinks: productLinks.count,
      brandLogos: brandLogos.count,
      productCategoryImages: productCategoryImages.count,
      staffAvatars: staffAvatars.count,
      articleAttachments: articleAttachments.count,
      articleCovers: articleCovers.count,
      articleOgImages: articleOgImages.count,
      total:
        productModelLinks.count +
        productLinks.count +
        brandLogos.count +
        productCategoryImages.count +
        staffAvatars.count +
        articleAttachments.count +
        articleCovers.count +
        articleOgImages.count,
    };

    return {
      deletedMedia,
      detachedReferences,
    };
  });
}

function toAuditJson(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function createMediaAuditLog(data: {
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
      entityType: "Media",
      entityId: data.entityId,
      targetLabel: data.targetLabel,
      summary: data.summary,
      beforeSnapshotJson: toAuditJson(data.beforeSnapshotJson),
      afterSnapshotJson: toAuditJson(data.afterSnapshotJson),
    },
  });
}
