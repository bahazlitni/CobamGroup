// @/features/media/repository.ts

import { Prisma } from "@prisma/client";
import { extractArticleMediaIds } from "@/features/articles/document";
import { prisma } from "@/lib/server/db/prisma";
import {
  MEDIA_KIND,
  MEDIA_VISIBILITY,
  type MediaBrowseMode,
  type MediaFilterStatus,
  type MediaKind,
  type MediaListQuery,
  type MediaUpdateInput,
  type MediaVisibility,
} from "./types";

function buildMediaWhere(input: {
  query: MediaListQuery;
  ownerUserId: string | null;
  folderIds?: readonly bigint[] | null;
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

  if (input.folderIds && input.folderIds.length > 0) {
    where.folderId =
      input.folderIds.length === 1
        ? input.folderIds[0]
        : {
            in: [...input.folderIds],
          };
  } else if (input.query.browseMode === "folders") {
    where.folderId = input.query.folderId != null ? BigInt(input.query.folderId) : null;
  } else if (input.query.folderId != null) {
    where.folderId = BigInt(input.query.folderId);
  }

  return where;
}

function buildMediaFolderWhere(input: {
  parentId: number | null;
  ownerUserId: string | null;
  q?: string;
}): Prisma.MediaFolderWhereInput {
  const where: Prisma.MediaFolderWhereInput = {
    parentId: input.parentId != null ? BigInt(input.parentId) : null,
  };

  if (input.ownerUserId) {
    where.createdByUserId = input.ownerUserId;
  }

  if (input.q?.trim()) {
    where.name = {
      contains: input.q.trim(),
      mode: "insensitive",
    };
  }

  return where;
}

function buildMediaOrderBy(query: MediaListQuery): Prisma.MediaOrderByWithRelationInput[] {
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
      return [{ sizeBytes: direction }, { createdAt: "desc" }, { id: "desc" }];

    case "date":
    default:
      return [{ createdAt: direction }, { id: direction }];
  }
}

const mediaSelect = {
  id: true,
  folderId: true,
  kind: true,
  visibility: true,
  storagePath: true,
  originalFilename: true,
  mimeType: true,
  extension: true,
  altText: true,
  title: true,
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

const mediaFolderSelect = {
  id: true,
  parentId: true,
  name: true,
  isProtected: true,
  createdByUserId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MediaFolderSelect;

type MediaUsageCounts = {
  productFamilyLinks: number;
  productVariantLinks: number;
  brandLogoFor: number;
  productCategoryImageFor: number;
  productTypeMediaImageFor: number;
  productCertificateImageFor: number;
  productFinishImageFor: number;
  productSubcategoryImageFor: number;
  staffProfileAvatarFor: number;
  commerceInvoicePdfFor: number;
  commercePromotionBannerFor: number;
  articleMediaLinks: number;
  articleCoverFor: number;
  articleOgImageFor: number;
};

export type DetachedMediaReferenceCounts = {
  productFamilyLinks: number;
  productVariantLinks: number;
  brandLogos: number;
  productCategoryImages: number;
  productTypeImages: number;
  productCertificateImages: number;
  productFinishImages: number;
  productSubcategoryImages: number;
  staffAvatars: number;
  commerceInvoicePdfs: number;
  commercePromotionBanners: number;
  articleAttachments: number;
  articleCovers: number;
  articleOgImages: number;
  total: number;
};

type MediaRecord = Prisma.MediaGetPayload<{
  select: typeof mediaSelect;
}>;

export type MediaFolderRecord = Prisma.MediaFolderGetPayload<{
  select: typeof mediaFolderSelect;
}>;

export type MediaFolderListRecord = MediaFolderRecord & {
  mediaCount: number;
  childFolderCount: number;
};

function buildRecursiveMediaCountByFolderId(
  folders: Array<{
    id: bigint;
    parentId: bigint | null;
  }>,
  directMediaCountByFolderId: Map<string, number>,
) {
  const childFolderIdsByParentId = new Map<string, string[]>();

  for (const folder of folders) {
    const parentKey = folder.parentId?.toString() ?? "__root__";
    const currentChildren = childFolderIdsByParentId.get(parentKey) ?? [];
    currentChildren.push(folder.id.toString());
    childFolderIdsByParentId.set(parentKey, currentChildren);
  }

  const recursiveMediaCountByFolderId = new Map<string, number>();

  const countFolderMedia = (folderId: string): number => {
    const cachedCount = recursiveMediaCountByFolderId.get(folderId);

    if (cachedCount !== undefined) {
      return cachedCount;
    }

    let total = directMediaCountByFolderId.get(folderId) ?? 0;

    for (const childFolderId of childFolderIdsByParentId.get(folderId) ?? []) {
      total += countFolderMedia(childFolderId);
    }

    recursiveMediaCountByFolderId.set(folderId, total);
    return total;
  };

  for (const folder of folders) {
    countFolderMedia(folder.id.toString());
  }

  return recursiveMediaCountByFolderId;
}

function createEmptyMediaUsageCounts(): MediaUsageCounts {
  return {
    productFamilyLinks: 0,
    productVariantLinks: 0,
    brandLogoFor: 0,
    productCategoryImageFor: 0,
    productTypeMediaImageFor: 0,
    productCertificateImageFor: 0,
    productFinishImageFor: 0,
    productSubcategoryImageFor: 0,
    staffProfileAvatarFor: 0,
    commerceInvoicePdfFor: 0,
    commercePromotionBannerFor: 0,
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
    productFamilyLinks,
    productVariantLinks,
    productCategoryImages,
    productSubcategoryImages,
    productTypeImages,
    productCertificateImages,
    productFinishImages,
    organizationLogos,
    staffAvatars,
    commerceInvoicePdfs,
    commercePromotionBanners,
    articleAttachments,
    articleCovers,
    articleOgImages,
  ] = await Promise.all([
    prisma.productFamily.findMany({
      where: {
        mainImageMediaId: {
          in: mediaIds,
        },
      },
      select: {
        mainImageMediaId: true,
      },
    }),
    prisma.productMedia.findMany({
      where: {
        mediaId: {
          in: mediaIds,
        },
      },
      select: {
        mediaId: true,
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
    prisma.productSubcategory.findMany({
      where: {
        imageMediaId: {
          in: mediaIds,
        },
      },
      select: {
        imageMediaId: true,
      },
    }),
    prisma.productType.findMany({
      where: {
        mediaImageId: {
          in: mediaIds,
        },
      },
      select: {
        mediaImageId: true,
      },
    }),
    prisma.productCertificate.findMany({
      where: {
        imageMediaId: {
          in: mediaIds,
        },
      },
      select: {
        imageMediaId: true,
      },
    }),
    prisma.productFinish.findMany({
      where: {
        imageMediaId: {
          in: mediaIds,
        },
      },
      select: {
        imageMediaId: true,
      },
    }),
    prisma.organization.findMany({
      where: {
        logoMediaId: {
          in: mediaIds,
        },
      },
      select: {
        logoMediaId: true,
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
    prisma.commerceInvoice.findMany({
      where: {
        pdfMediaId: {
          in: mediaIds,
        },
      },
      select: {
        pdfMediaId: true,
      },
    }),
    prisma.commercePromotion.findMany({
      where: {
        bannerMediaId: {
          in: mediaIds,
        },
      },
      select: {
        bannerMediaId: true,
      },
    }),
    prisma.article.findMany({
      where: {
        OR: mediaIds.flatMap((mediaId) => [
          { introductionContent: { contains: mediaId.toString() } },
          { bodyContent: { contains: mediaId.toString() } },
          { conclusionContent: { contains: mediaId.toString() } },
        ]),
      },
      select: {
        introductionContent: true,
        bodyContent: true,
        conclusionContent: true,
      },
    }),
    prisma.article.findMany({
      where: {
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
        ogImageMediaId: {
          in: mediaIds,
        },
      },
      select: {
        ogImageMediaId: true,
      },
    }),
  ]);

  for (const link of productFamilyLinks) {
    incrementUsageCount(countsByMediaId, link.mainImageMediaId, "productFamilyLinks");
  }

  for (const link of productVariantLinks) {
    incrementUsageCount(countsByMediaId, link.mediaId, "productVariantLinks");
  }

  for (const category of productCategoryImages) {
    incrementUsageCount(countsByMediaId, category.imageMediaId, "productCategoryImageFor");
  }

  for (const subcategory of productSubcategoryImages) {
    incrementUsageCount(countsByMediaId, subcategory.imageMediaId, "productSubcategoryImageFor");
  }

  for (const productType of productTypeImages) {
    incrementUsageCount(countsByMediaId, productType.mediaImageId, "productTypeMediaImageFor");
  }

  for (const certificate of productCertificateImages) {
    incrementUsageCount(countsByMediaId, certificate.imageMediaId, "productCertificateImageFor");
  }

  for (const finish of productFinishImages) {
    incrementUsageCount(countsByMediaId, finish.imageMediaId, "productFinishImageFor");
  }

  for (const organization of organizationLogos) {
    incrementUsageCount(countsByMediaId, organization.logoMediaId, "brandLogoFor");
  }

  for (const profile of staffAvatars) {
    incrementUsageCount(countsByMediaId, profile.avatarMediaId, "staffProfileAvatarFor");
  }

  for (const invoice of commerceInvoicePdfs) {
    incrementUsageCount(countsByMediaId, invoice.pdfMediaId, "commerceInvoicePdfFor");
  }

  for (const promotion of commercePromotionBanners) {
    incrementUsageCount(countsByMediaId, promotion.bannerMediaId, "commercePromotionBannerFor");
  }

  for (const article of articleAttachments) {
    for (const mediaId of [
      ...extractArticleMediaIds(article.introductionContent),
      ...extractArticleMediaIds(article.bodyContent),
      ...extractArticleMediaIds(article.conclusionContent),
    ]) {
      incrementUsageCount(countsByMediaId, BigInt(mediaId), "articleMediaLinks");
    }
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
  folderIds?: readonly bigint[] | null;
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

export async function listMediaFoldersAtLevel(input: {
  parentId: number | null;
  ownerUserId: string | null;
  q?: string;
}) {
  const folderWhere = input.ownerUserId
    ? {
        createdByUserId: input.ownerUserId,
      }
    : undefined;

  const folders = await prisma.mediaFolder.findMany({
    where: buildMediaFolderWhere(input),
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: mediaFolderSelect,
  });

  if (folders.length === 0) {
    return [] as MediaFolderListRecord[];
  }

  const [allFolders, childFolderCounts] = await Promise.all([
    prisma.mediaFolder.findMany({
      where: folderWhere,
      select: {
        id: true,
        parentId: true,
      },
    }),
    prisma.mediaFolder.groupBy({
      by: ["parentId"],
      where: {
        parentId: {
          in: folders.map((folder) => folder.id),
        },
        ...folderWhere,
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const allFolderIds = allFolders.map((folder) => folder.id);
  const mediaCounts =
    allFolderIds.length === 0
      ? []
      : await prisma.media.groupBy({
          by: ["folderId"],
          where: {
            deletedAt: null,
            folderId: {
              in: allFolderIds,
            },
            ...(input.ownerUserId
              ? {
                  uploadedByUserId: input.ownerUserId,
                }
              : {}),
          },
          _count: {
            _all: true,
          },
        });

  const recursiveMediaCountByFolderId = buildRecursiveMediaCountByFolderId(
    allFolders,
    new Map(mediaCounts.map((entry) => [entry.folderId?.toString() ?? "", entry._count._all])),
  );
  const childFolderCountByFolderId = new Map(
    childFolderCounts.map((entry) => [entry.parentId?.toString() ?? "", entry._count._all]),
  );

  return folders.map((folder) => ({
    ...folder,
    mediaCount: recursiveMediaCountByFolderId.get(folder.id.toString()) ?? 0,
    childFolderCount: childFolderCountByFolderId.get(folder.id.toString()) ?? 0,
  }));
}

export async function listAllMediaFolders(ownerUserId: string | null) {
  return prisma.mediaFolder.findMany({
    where: ownerUserId
      ? {
          createdByUserId: ownerUserId,
        }
      : undefined,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: mediaFolderSelect,
  });
}

export async function findMediaFolderById(folderId: number, ownerUserId: string | null) {
  return prisma.mediaFolder.findFirst({
    where: {
      id: BigInt(folderId),
      ...(ownerUserId
        ? {
            createdByUserId: ownerUserId,
          }
        : {}),
    },
    select: mediaFolderSelect,
  });
}

export async function countMedia(input: {
  query: MediaListQuery;
  ownerUserId: string | null;
  folderIds?: readonly bigint[] | null;
}) {
  return prisma.media.count({
    where: buildMediaWhere(input),
  });
}

export async function aggregateMediaStats(input: {
  browseMode: MediaBrowseMode;
  folderId: number | null;
  includeDescendantFolders?: boolean;
  q?: string;
  status?: MediaFilterStatus;
  ownerUserId: string | null;
  folderIds?: readonly bigint[] | null;
}) {
  const baseWhere = buildMediaWhere({
    query: {
      browseMode: input.browseMode,
      page: 1,
      pageSize: 1,
      folderId: input.folderId,
      includeDescendantFolders: input.includeDescendantFolders,
      q: input.q,
      kind: "ALL",
      status: input.status,
    },
    ownerUserId: input.ownerUserId,
    folderIds: input.folderIds,
  });

  const [total, images, videos, documents, totalSize] = await Promise.all([
    prisma.media.count({ where: baseWhere }),
    prisma.media.count({ where: { ...baseWhere, kind: MEDIA_KIND.IMAGE } }),
    prisma.media.count({ where: { ...baseWhere, kind: MEDIA_KIND.VIDEO } }),
    prisma.media.count({ where: { ...baseWhere, kind: MEDIA_KIND.DOCUMENT } }),
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

export async function findMediaByFolderAndOriginalFilename(input: {
  folderId: number | null;
  originalFilename: string;
  excludeMediaId?: number;
}) {
  const record = await prisma.media.findFirst({
    where: {
      deletedAt: null,
      folderId: input.folderId != null ? BigInt(input.folderId) : null,
      originalFilename: input.originalFilename,
      ...(input.excludeMediaId != null
        ? {
            id: {
              not: BigInt(input.excludeMediaId),
            },
          }
        : {}),
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
      kind: MEDIA_KIND.IMAGE,
      deletedAt: null,
      isActive: true,
    },
    select: {
      id: true,
      widthPx: true,
      heightPx: true,
    },
  });
}

export async function findActiveMediaByIds(mediaIds: readonly number[]) {
  if (mediaIds.length === 0) {
    return [];
  }

  return prisma.media.findMany({
    where: {
      id: {
        in: [...new Set(mediaIds)].map((mediaId) => BigInt(mediaId)),
      },
      deletedAt: null,
      isActive: true,
    },
    select: {
      id: true,
      kind: true,
    },
  });
}

export async function findPublicMediaById(mediaId: number) {
  return prisma.media.findFirst({
    where: {
      id: BigInt(mediaId),
      deletedAt: null,
      isActive: true,
      visibility: MEDIA_VISIBILITY.PUBLIC,
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
  folderId: number | null;
  kind: MediaKind;
  visibility: MediaVisibility;
  storagePath: string;
  originalFilename: string | null;
  mimeType: string | null;
  extension: string | null;
  title: string | null;
  altText: string | null;
  widthPx?: number | null;
  heightPx?: number | null;
  sizeBytes: bigint;
  sha256Hash: string;
  uploadedByUserId: string;
}) {
  const record = await prisma.media.create({
    data: {
      folderId: input.folderId != null ? BigInt(input.folderId) : null,
      kind: input.kind,
      visibility: input.visibility,
      storagePath: input.storagePath,
      originalFilename: input.originalFilename,
      mimeType: input.mimeType,
      extension: input.extension,
      title: input.title,
      altText: input.altText,
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

export async function updateMediaFileRecord(
  mediaId: number,
  input: {
    kind: MediaKind;
    visibility: MediaVisibility;
    storagePath: string;
    originalFilename: string | null;
    mimeType: string | null;
    extension: string | null;
    title: string | null;
    altText: string | null;
    widthPx?: number | null;
    heightPx?: number | null;
    sizeBytes: bigint;
    sha256Hash: string;
    updatedByUserId: string;
  },
) {
  const record = await prisma.media.update({
    where: { id: BigInt(mediaId) },
    data: {
      kind: input.kind,
      visibility: input.visibility,
      storagePath: input.storagePath,
      originalFilename: input.originalFilename,
      mimeType: input.mimeType,
      extension: input.extension,
      title: input.title,
      altText: input.altText,
      widthPx: input.widthPx ?? null,
      heightPx: input.heightPx ?? null,
      durationSeconds: null,
      sizeBytes: input.sizeBytes,
      sha256Hash: input.sha256Hash,
      isActive: true,
      updatedByUserId: input.updatedByUserId,
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
      ...(input.visibility != null
        ? {
            visibility: input.visibility,
          }
        : {}),
      ...(input.folderId !== undefined
        ? {
            folderId: input.folderId != null ? BigInt(input.folderId) : null,
          }
        : {}),
      ...(input.title !== undefined
        ? {
            title: input.title,
          }
        : {}),
      ...(input.altText !== undefined
        ? {
            altText: input.altText,
          }
        : {}),
      updatedByUserId: input.updatedByUserId,
    },
    select: mediaSelect,
  });

  const [media] = await attachMediaUsageCounts([record]);
  return media;
}

export async function createMediaFolderRecord(input: {
  name: string;
  parentId: number | null;
  createdByUserId: string;
}) {
  return prisma.mediaFolder.create({
    data: {
      name: input.name,
      parentId: input.parentId != null ? BigInt(input.parentId) : null,
      createdByUserId: input.createdByUserId,
    },
    select: mediaFolderSelect,
  });
}

export async function updateMediaFolderRecord(input: {
  folderId: number;
  parentId: number | null;
}) {
  return prisma.mediaFolder.update({
    where: {
      id: BigInt(input.folderId),
    },
    data: {
      parentId: input.parentId != null ? BigInt(input.parentId) : null,
    },
    select: mediaFolderSelect,
  });
}

export async function countMediaFolderContents(folderId: number, ownerUserId: string | null) {
  const folderIdValue = BigInt(folderId);
  const [mediaCount, childFolderCount] = await Promise.all([
    prisma.media.count({
      where: {
        deletedAt: null,
        folderId: folderIdValue,
        ...(ownerUserId
          ? {
              uploadedByUserId: ownerUserId,
            }
          : {}),
      },
    }),
    prisma.mediaFolder.count({
      where: {
        parentId: folderIdValue,
        ...(ownerUserId
          ? {
              createdByUserId: ownerUserId,
            }
          : {}),
      },
    }),
  ]);

  return {
    mediaCount,
    childFolderCount,
  };
}

export async function deleteMediaFolderRecord(folderId: number) {
  return prisma.mediaFolder.delete({
    where: {
      id: BigInt(folderId),
    },
    select: mediaFolderSelect,
  });
}

export async function detachMediaFolderRelationsAndDeleteFolderRecord(input: {
  folderId: number;
  parentId: number | null;
  ownerUserId: string | null;
}) {
  const folderIdValue = BigInt(input.folderId);
  const parentIdValue = input.parentId != null ? BigInt(input.parentId) : null;

  return prisma.$transaction(async (tx) => {
    const movedMedia = await tx.media.updateMany({
      where: {
        deletedAt: null,
        folderId: folderIdValue,
        ...(input.ownerUserId
          ? {
              uploadedByUserId: input.ownerUserId,
            }
          : {}),
      },
      data: {
        folderId: parentIdValue,
      },
    });

    const movedChildFolders = await tx.mediaFolder.updateMany({
      where: {
        parentId: folderIdValue,
        ...(input.ownerUserId
          ? {
              createdByUserId: input.ownerUserId,
            }
          : {}),
      },
      data: {
        parentId: parentIdValue,
      },
    });

    const deletedFolder = await tx.mediaFolder.delete({
      where: {
        id: folderIdValue,
      },
      select: mediaFolderSelect,
    });

    return {
      deletedFolder,
      detachedReferences: {
        mediaCount: movedMedia.count,
        childFolderCount: movedChildFolders.count,
        total: movedMedia.count + movedChildFolders.count,
      },
    };
  });
}

export async function makeMediaPublic(mediaId: number) {
  return prisma.media.updateMany({
    where: {
      id: BigInt(mediaId),
      deletedAt: null,
      isActive: true,
    },
    data: {
      visibility: MEDIA_VISIBILITY.PUBLIC,
    },
  });
}

export async function makeMediaPublicMany(mediaIds: readonly number[]) {
  const normalizedIds = [
    ...new Set(mediaIds.filter((mediaId) => Number.isInteger(mediaId) && mediaId > 0)),
  ];

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
      visibility: MEDIA_VISIBILITY.PUBLIC,
    },
  });
}

async function replaceMediaReferences(
  tx: Prisma.TransactionClient,
  input: {
    fromMediaId: bigint;
    toMediaId: bigint;
  },
): Promise<DetachedMediaReferenceCounts> {
  const { fromMediaId, toMediaId } = input;
  const productVariantLinksToMove = await tx.productMedia.findMany({
    where: {
      mediaId: fromMediaId,
    },
    select: {
      productId: true,
    },
  });
  const productIds = [
    ...new Set(productVariantLinksToMove.map((link) => link.productId.toString())),
  ].map((id) => BigInt(id));
  const collidingProductIds =
    productIds.length === 0
      ? []
      : (
          await tx.productMedia.findMany({
            where: {
              mediaId: toMediaId,
              productId: {
                in: productIds,
              },
            },
            select: {
              productId: true,
            },
          })
        ).map((link) => link.productId);
  const deletedCollidingProductLinks =
    collidingProductIds.length === 0
      ? { count: 0 }
      : await tx.productMedia.deleteMany({
          where: {
            mediaId: fromMediaId,
            productId: {
              in: collidingProductIds,
            },
          },
        });
  const movedProductVariantLinks = await tx.productMedia.updateMany({
    where: {
      mediaId: fromMediaId,
    },
    data: {
      mediaId: toMediaId,
    },
  });

  const [
    productFamilyLinks,
    productCategoryImages,
    productSubcategoryImages,
    productTypeImages,
    productCertificateImages,
    productFinishImages,
    brandLogos,
    staffAvatars,
    commerceInvoicePdfs,
    commercePromotionBanners,
    articleCovers,
    articleOgImages,
  ] = await Promise.all([
    tx.productFamily.updateMany({
      where: {
        mainImageMediaId: fromMediaId,
      },
      data: {
        mainImageMediaId: toMediaId,
      },
    }),
    tx.productCategory.updateMany({
      where: {
        imageMediaId: fromMediaId,
      },
      data: {
        imageMediaId: toMediaId,
      },
    }),
    tx.productSubcategory.updateMany({
      where: {
        imageMediaId: fromMediaId,
      },
      data: {
        imageMediaId: toMediaId,
      },
    }),
    tx.productType.updateMany({
      where: {
        mediaImageId: fromMediaId,
      },
      data: {
        mediaImageId: toMediaId,
      },
    }),
    tx.productCertificate.updateMany({
      where: {
        imageMediaId: fromMediaId,
      },
      data: {
        imageMediaId: toMediaId,
      },
    }),
    tx.productFinish.updateMany({
      where: {
        imageMediaId: fromMediaId,
      },
      data: {
        imageMediaId: toMediaId,
      },
    }),
    tx.organization.updateMany({
      where: {
        logoMediaId: fromMediaId,
      },
      data: {
        logoMediaId: toMediaId,
      },
    }),
    tx.staffProfile.updateMany({
      where: {
        avatarMediaId: fromMediaId,
      },
      data: {
        avatarMediaId: toMediaId,
      },
    }),
    tx.commerceInvoice.updateMany({
      where: {
        pdfMediaId: fromMediaId,
      },
      data: {
        pdfMediaId: toMediaId,
      },
    }),
    tx.commercePromotion.updateMany({
      where: {
        bannerMediaId: fromMediaId,
      },
      data: {
        bannerMediaId: toMediaId,
      },
    }),
    tx.article.updateMany({
      where: {
        coverMediaId: fromMediaId,
      },
      data: {
        coverMediaId: toMediaId,
      },
    }),
    tx.article.updateMany({
      where: {
        ogImageMediaId: fromMediaId,
      },
      data: {
        ogImageMediaId: toMediaId,
      },
    }),
  ]);

  const productVariantLinks = deletedCollidingProductLinks.count + movedProductVariantLinks.count;
  const articleAttachments = 0;

  return {
    productFamilyLinks: productFamilyLinks.count,
    productVariantLinks,
    brandLogos: brandLogos.count,
    productCategoryImages: productCategoryImages.count,
    productTypeImages: productTypeImages.count,
    productCertificateImages: productCertificateImages.count,
    productFinishImages: productFinishImages.count,
    productSubcategoryImages: productSubcategoryImages.count,
    staffAvatars: staffAvatars.count,
    commerceInvoicePdfs: commerceInvoicePdfs.count,
    commercePromotionBanners: commercePromotionBanners.count,
    articleAttachments,
    articleCovers: articleCovers.count,
    articleOgImages: articleOgImages.count,
    total:
      productFamilyLinks.count +
      productVariantLinks +
      brandLogos.count +
      productCategoryImages.count +
      productTypeImages.count +
      productCertificateImages.count +
      productFinishImages.count +
      productSubcategoryImages.count +
      staffAvatars.count +
      commerceInvoicePdfs.count +
      commercePromotionBanners.count +
      articleAttachments +
      articleCovers.count +
      articleOgImages.count,
  };
}

export async function moveMediaRecordAndOverwriteConflict(input: {
  mediaId: number;
  conflictMediaId: number;
  folderId: number | null;
  updatedByUserId: string;
}) {
  const result = await prisma.$transaction(async (tx) => {
    const replacementMediaId = BigInt(input.mediaId);
    const overwrittenMediaId = BigInt(input.conflictMediaId);
    const folderId = input.folderId != null ? BigInt(input.folderId) : null;
    const detachedReferences = await replaceMediaReferences(tx, {
      fromMediaId: overwrittenMediaId,
      toMediaId: replacementMediaId,
    });
    const overwrittenMedia = await tx.media.delete({
      where: {
        id: overwrittenMediaId,
      },
      select: mediaSelect,
    });
    const updatedRecord = await tx.media.update({
      where: {
        id: replacementMediaId,
      },
      data: {
        folderId,
        updatedByUserId: input.updatedByUserId,
      },
      select: mediaSelect,
    });

    return {
      media: updatedRecord,
      overwrittenMedia,
      detachedReferences,
    };
  });
  const [media] = await attachMediaUsageCounts([result.media]);

  return {
    ...result,
    media,
  };
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
    const productFamilyLinks = await tx.productFamily.updateMany({
      where: {
        mainImageMediaId: mediaIdValue,
      },
      data: {
        mainImageMediaId: null,
      },
    });
    const productVariantLinks = await tx.productMedia.deleteMany({
      where: {
        mediaId: mediaIdValue,
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
    const productSubcategoryImages = await tx.productSubcategory.updateMany({
      where: {
        imageMediaId: mediaIdValue,
      },
      data: {
        imageMediaId: null,
      },
    });
    const productTypeImages = await tx.productType.updateMany({
      where: {
        mediaImageId: mediaIdValue,
      },
      data: {
        mediaImageId: null,
      },
    });
    const productFinishImages = await tx.productFinish.updateMany({
      where: {
        imageMediaId: mediaIdValue,
      },
      data: {
        imageMediaId: null,
      },
    });
    const brandLogos = await tx.organization.updateMany({
      where: {
        logoMediaId: mediaIdValue,
      },
      data: {
        logoMediaId: null,
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
    const commerceInvoicePdfs = await tx.commerceInvoice.updateMany({
      where: {
        pdfMediaId: mediaIdValue,
      },
      data: {
        pdfMediaId: null,
      },
    });
    const commercePromotionBanners = await tx.commercePromotion.updateMany({
      where: {
        bannerMediaId: mediaIdValue,
      },
      data: {
        bannerMediaId: null,
      },
    });
    const articleAttachments = 0;
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
      productFamilyLinks: productFamilyLinks.count,
      productVariantLinks: productVariantLinks.count,
      brandLogos: brandLogos.count,
      productCategoryImages: productCategoryImages.count,
      productTypeImages: productTypeImages.count,
      productCertificateImages: 0,
      productFinishImages: productFinishImages.count,
      productSubcategoryImages: productSubcategoryImages.count,
      staffAvatars: staffAvatars.count,
      commerceInvoicePdfs: commerceInvoicePdfs.count,
      commercePromotionBanners: commercePromotionBanners.count,
      articleAttachments,
      articleCovers: articleCovers.count,
      articleOgImages: articleOgImages.count,
      total:
        productFamilyLinks.count +
        productVariantLinks.count +
        brandLogos.count +
        productCategoryImages.count +
        productTypeImages.count +
        productFinishImages.count +
        productSubcategoryImages.count +
        staffAvatars.count +
        commerceInvoicePdfs.count +
        commercePromotionBanners.count +
        articleAttachments +
        articleCovers.count +
        articleOgImages.count,
    };

    return {
      deletedMedia,
      detachedReferences,
    };
  });
}
