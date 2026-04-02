import { ArticleStatus, Prisma, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import type {
  ArticleAuthorOptionsQuery,
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
  publishedAt: true,
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

function toAuditJson(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
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
    },
    select: ARTICLE_SELECT,
  });
}

export async function updateArticleStatus(
  articleId: number,
  status: ArticleStatus,
  publishedAt?: Date | null,
) {
  return prisma.article.update({
    where: { id: BigInt(articleId) },
    data: {
      status,
      ...(publishedAt !== undefined ? { publishedAt } : {}),
    },
    select: ARTICLE_SELECT,
  });
}

export async function deleteArticle(articleId: number) {
  return prisma.article.delete({
    where: { id: BigInt(articleId) },
    select: ARTICLE_SELECT,
  });
}

export async function createArticleAuditLog(data: {
  actorUserId: string;
  actionType: "CREATE" | "UPDATE" | "PUBLISH" | "UNPUBLISH" | "DELETE";
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
      entityType: "Article",
      entityId: data.entityId,
      targetLabel: data.targetLabel,
      summary: data.summary,
      beforeSnapshotJson: toAuditJson(data.beforeSnapshotJson),
      afterSnapshotJson: toAuditJson(data.afterSnapshotJson),
    },
  });
}
