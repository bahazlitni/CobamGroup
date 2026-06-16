import { ArticleStatus, Prisma, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import type {
  ArticleAuthorOptionsQuery,
  ArticleCTABannerInput,
  ArticleListQuery,
} from "./types";

const AUTHOR_LINK_ORDER_BY = [
  { createdAt: "asc" },
  { userId: "asc" },
] satisfies Prisma.ArticleAuthorLinkOrderByWithRelationInput[];

const CATEGORY_LINK_ORDER_BY = [
  { createdAt: "asc" },
  { categoryId: "asc" },
] satisfies Prisma.ArticleCategoryLinkOrderByWithRelationInput[];

type ResolvedArticleInput = {
  title: string;
  displayTitle: string | null;
  slug: string;
  excerpt: string | null;
  content: string;
  descriptionSeo: string | null;
  tags: string;
  categoryAssignments: Array<{
    categoryId: number;
    score: number;
  }>;
  coverMediaId: number | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageMediaId: number | null;
  noIndex: boolean;
  noFollow: boolean;
  schemaType: string | null;
  authorIds: string[];
  ctaBanners: ArticleCTABannerInput[];
};

const ARTICLE_AUTHOR_ROLE_SELECT = Prisma.validator<Prisma.UserRoleAssignmentSelect>()({
  role: {
    select: {
      id: true,
      key: true,
      name: true,
      color: true,
      priorityIndex: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      permissionLinks: {
        where: { allowed: true },
        select: {
          allowed: true,
          permission: {
            select: { key: true },
          },
        },
      },
    },
  },
});

const ARTICLE_AUTHOR_USER_SELECT = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  powerType: true,
  status: true,
  profile: {
    select: {
      firstName: true,
      lastName: true,
    },
  },
  receivedRoleAssignments: {
    where: { revokedAt: null },
    select: ARTICLE_AUTHOR_ROLE_SELECT,
  },
});

const ARTICLE_SELECT = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  authorId: true,
  title: true,
  displayTitle: true,
  slug: true,
  excerpt: true,
  content: true,
  descriptionSeo: true,
  tags: true,
  status: true,
  publishedByUserId: true,
  publishedAt: true,
  scheduledPublishAt: true,
  scheduledByUserId: true,
  coverMediaId: true,
  createdAt: true,
  updatedAt: true,
  ogTitle: true,
  ogDescription: true,
  ogImageMediaId: true,
  noIndex: true,
  noFollow: true,
  schemaType: true,
  author: {
    select: ARTICLE_AUTHOR_USER_SELECT,
  },
  authorLinks: {
    orderBy: AUTHOR_LINK_ORDER_BY,
    select: {
      createdAt: true,
      userId: true,
      user: {
        select: ARTICLE_AUTHOR_USER_SELECT,
      },
    },
  },
  categoryLinks: {
    orderBy: CATEGORY_LINK_ORDER_BY,
    select: {
      categoryId: true,
      score: true,
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  },
  ctaBanners: {
    orderBy: [
      { approxPositionPercentage: "asc" },
      { title: "asc" },
      { id: "asc" },
    ],
    select: {
      id: true,
      title: true,
      description: true,
      imageId: true,
      backgroundColor: true,
      horizontalAspectRatio: true,
      anchor: true,
      approxPositionPercentage: true,
      href: true,
      buttons: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: {
          id: true,
          text: true,
          iconCode: true,
          sortOrder: true,
          href: true,
        },
      },
    },
  },
});

function buildArticleWhere(query: ArticleListQuery): Prisma.ArticleWhereInput {
  const where: Prisma.ArticleWhereInput = {
    deletedAt: null,
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: "insensitive" } },
      { slug: { contains: query.q, mode: "insensitive" } },
      { tags: { contains: query.q, mode: "insensitive" } },
    ];
  }

  return where;
}

function normalizeAdditionalAuthorIds(
  originalAuthorId: string,
  authorIds: readonly string[],
) {
  return [...new Set(authorIds.map((authorId) => authorId.trim()).filter(Boolean))].filter(
    (authorId) => authorId !== originalAuthorId,
  );
}

function mapCtaBannersForCreate(input: ArticleCTABannerInput[]) {
  return input.map((banner) => ({
    title: banner.title,
    description: banner.description,
    imageId: banner.imageId != null ? BigInt(banner.imageId) : null,
    backgroundColor: banner.backgroundColor,
    horizontalAspectRatio: banner.horizontalAspectRatio,
    anchor: banner.anchor,
    approxPositionPercentage: banner.approxPositionPercentage,
    href: banner.href,
    buttons: banner.buttons.length
      ? {
          create: banner.buttons.map((button) => ({
            text: button.text,
            iconCode: button.iconCode,
            sortOrder: button.sortOrder,
            href: button.href,
          })),
        }
      : undefined,
  }));
}

function buildAuthorSearchWhere(q?: string): Prisma.UserWhereInput | undefined {
  if (!q?.trim()) {
    return undefined;
  }

  return {
    OR: [
      { email: { contains: q, mode: "insensitive" } },
      {
        profile: {
          is: {
            firstName: { contains: q, mode: "insensitive" },
          },
        },
      },
      {
        profile: {
          is: {
            lastName: { contains: q, mode: "insensitive" },
          },
        },
      },
    ],
  };
}

export async function findArticleById(articleId: number) {
  return prisma.article.findUnique({
    where: { id: BigInt(articleId) },
    select: ARTICLE_SELECT,
  });
}

export async function listArticles(query: ArticleListQuery) {
  return prisma.article.findMany({
    where: buildArticleWhere(query),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: ARTICLE_SELECT,
  });
}

export async function findExistingArticleCategoryIds(
  categoryIds: readonly number[],
) {
  const normalizedIds = [...new Set(categoryIds)].filter(
    (categoryId) => Number.isInteger(categoryId) && categoryId > 0,
  );

  if (normalizedIds.length === 0) {
    return [];
  }

  const categories = await prisma.articleCategory.findMany({
    where: {
      id: {
        in: normalizedIds.map((categoryId) => BigInt(categoryId)),
      },
    },
    select: {
      id: true,
    },
  });

  return categories.map((category) => Number(category.id));
}

export async function findArticleAuthorCandidatesByIds(userIds: readonly string[]) {
  const normalizedIds = [...new Set(userIds.map((userId) => userId.trim()).filter(Boolean))];

  if (normalizedIds.length === 0) {
    return [];
  }

  return prisma.user.findMany({
    where: {
      id: { in: normalizedIds },
      portal: "STAFF",
    },
    select: ARTICLE_AUTHOR_USER_SELECT,
  });
}

export async function listArticleAuthorOptions(query: ArticleAuthorOptionsQuery) {
  return prisma.user.findMany({
    where: {
      portal: "STAFF",
      status: {
        notIn: [UserStatus.BANNED, UserStatus.CLOSED],
      },
      ...buildAuthorSearchWhere(query.q),
    },
    orderBy: [{ email: "asc" }],
    select: ARTICLE_AUTHOR_USER_SELECT,
    take: 50,
  });
}


export async function createArticle(
  authorId: string,
  input: ResolvedArticleInput,
) {
  const authorIds = normalizeAdditionalAuthorIds(authorId, input.authorIds);

  return prisma.article.create({
    data: {
      title: input.title,
      displayTitle: input.displayTitle,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      descriptionSeo: input.descriptionSeo,
      tags: input.tags,
      status: ArticleStatus.DRAFT,
      coverMediaId:
        input.coverMediaId != null ? BigInt(input.coverMediaId) : null,
      authorId,
      ogTitle: input.ogTitle,
      ogDescription: input.ogDescription,
      ogImageMediaId:
        input.ogImageMediaId != null ? BigInt(input.ogImageMediaId) : null,
      noIndex: input.noIndex,
      noFollow: input.noFollow,
      schemaType: input.schemaType,
      authorLinks: authorIds.length
        ? {
            create: authorIds.map((userId) => ({ userId })),
          }
        : undefined,
      categoryLinks: input.categoryAssignments.length
        ? {
            create: input.categoryAssignments.map((assignment) => ({
              categoryId: BigInt(assignment.categoryId),
              score: assignment.score,
            })),
          }
        : undefined,
      ctaBanners: input.ctaBanners.length
        ? {
            create: mapCtaBannersForCreate(input.ctaBanners),
          }
        : undefined,
    },
    select: ARTICLE_SELECT,
  });
}

export async function updateArticle(
  articleId: number,
  originalAuthorId: string,
  input: ResolvedArticleInput,
) {
  const authorIds = normalizeAdditionalAuthorIds(originalAuthorId, input.authorIds);

  return prisma.article.update({
    where: { id: BigInt(articleId) },
    data: {
      title: input.title,
      displayTitle: input.displayTitle,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      descriptionSeo: input.descriptionSeo,
      tags: input.tags,
      coverMediaId:
        input.coverMediaId != null ? BigInt(input.coverMediaId) : null,
      ogTitle: input.ogTitle,
      ogDescription: input.ogDescription,
      ogImageMediaId:
        input.ogImageMediaId != null ? BigInt(input.ogImageMediaId) : null,
      noIndex: input.noIndex,
      noFollow: input.noFollow,
      schemaType: input.schemaType,
      authorLinks: {
        deleteMany: {},
        ...(authorIds.length
          ? {
              create: authorIds.map((userId) => ({ userId })),
            }
          : {}),
      },
      categoryLinks: {
        deleteMany: {},
        ...(input.categoryAssignments.length
          ? {
              create: input.categoryAssignments.map((assignment) => ({
                categoryId: BigInt(assignment.categoryId),
                score: assignment.score,
              })),
            }
          : {}),
      },
      ctaBanners: {
        deleteMany: {},
        ...(input.ctaBanners.length
          ? {
              create: mapCtaBannersForCreate(input.ctaBanners),
            }
          : {}),
      },
    },
    select: ARTICLE_SELECT,
  });
}

export async function updateArticleStatus(
  articleId: number,
  status: ArticleStatus,
  publishedAt?: Date | null,
  extraData: {
    publishedByUserId?: string | null;
    scheduledPublishAt?: Date | null;
    scheduledByUserId?: string | null;
  } = {},
) {
  return prisma.article.update({
    where: { id: BigInt(articleId) },
    data: {
      status,
      ...(publishedAt !== undefined ? { publishedAt } : {}),
      ...(extraData.publishedByUserId !== undefined
        ? { publishedByUserId: extraData.publishedByUserId }
        : {}),
      ...(extraData.scheduledPublishAt !== undefined
        ? { scheduledPublishAt: extraData.scheduledPublishAt }
        : {}),
      ...(extraData.scheduledByUserId !== undefined
        ? { scheduledByUserId: extraData.scheduledByUserId }
        : {}),
    },
    select: ARTICLE_SELECT,
  });
}

export async function updateArticleSchedule(
  articleId: number,
  scheduledPublishAt: Date | null,
  scheduledByUserId: string | null,
) {
  return prisma.article.update({
    where: { id: BigInt(articleId) },
    data: {
      scheduledPublishAt,
      scheduledByUserId,
    },
    select: ARTICLE_SELECT,
  });
}

export async function listDueScheduledArticles(now: Date) {
  return prisma.article.findMany({
    where: {
      deletedAt: null,
      status: ArticleStatus.DRAFT,
      scheduledPublishAt: {
        lte: now,
      },
    },
    orderBy: [{ scheduledPublishAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      scheduledPublishAt: true,
      scheduledByUserId: true,
      coverMediaId: true,
      ogImageMediaId: true,
      content: true,
      ctaBanners: {
        select: {
          imageId: true,
        },
      },
    },
  });
}

export async function markScheduledArticlePublished(
  articleId: bigint,
  scheduledPublishAt: Date | null,
  scheduledByUserId: string | null,
  now: Date,
) {
  const result = await prisma.article.updateMany({
    where: {
      id: articleId,
      deletedAt: null,
      status: ArticleStatus.DRAFT,
      scheduledPublishAt: {
        lte: now,
      },
    },
    data: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: scheduledPublishAt ?? now,
      publishedByUserId: scheduledByUserId,
      scheduledPublishAt: null,
      scheduledByUserId: null,
    },
  });

  return result.count === 1;
}

export async function deleteArticle(articleId: number) {
  return prisma.article.delete({
    where: { id: BigInt(articleId) },
    select: ARTICLE_SELECT,
  });
}

