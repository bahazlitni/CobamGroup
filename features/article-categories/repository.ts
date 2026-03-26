import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import type {
  ArticleCategoryListQuery,
  ArticleCategoryMutationInput,
} from "./types";

const CREATOR_ROLE_SELECT = Prisma.validator<Prisma.UserRoleAssignmentSelect>()({
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

const CREATOR_SELECT = Prisma.validator<Prisma.UserSelect>()({
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
    select: CREATOR_ROLE_SELECT,
  },
});

const articleCategorySelect = Prisma.validator<Prisma.ArticleCategorySelect>()({
  id: true,
  name: true,
  slug: true,
  color: true,
  createdByUserId: true,
  updatedByUserId: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      articleLinks: true,
    },
  },
  createdByUser: {
    select: CREATOR_SELECT,
  },
});

function buildArticleCategoryWhere(
  query: ArticleCategoryListQuery,
): Prisma.ArticleCategoryWhereInput {
  if (!query.q) {
    return {};
  }

  return {
    OR: [
      { name: { contains: query.q, mode: "insensitive" } },
      { slug: { contains: query.q, mode: "insensitive" } },
    ],
  };
}

export async function listArticleCategories(query: ArticleCategoryListQuery) {
  return prisma.articleCategory.findMany({
    where: buildArticleCategoryWhere(query),
    orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    select: articleCategorySelect,
  });
}

export async function findArticleCategoryById(categoryId: number) {
  return prisma.articleCategory.findUnique({
    where: { id: BigInt(categoryId) },
    select: articleCategorySelect,
  });
}

export async function findArticleCategoryBySlug(slug: string) {
  return prisma.articleCategory.findUnique({
    where: { slug },
    select: { id: true },
  });
}

export async function findArticleCategoryByName(name: string) {
  return prisma.articleCategory.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });
}

export async function listArticleCategoryOptions() {
  return prisma.articleCategory.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      color: true,
    },
  });
}

export async function createArticleCategory(
  actorUserId: string,
  input: ArticleCategoryMutationInput,
) {
  return prisma.articleCategory.create({
    data: {
      name: input.name,
      slug: input.slug,
      color: input.color,
      createdByUserId: actorUserId,
      updatedByUserId: actorUserId,
    },
    select: articleCategorySelect,
  });
}

export async function updateArticleCategory(
  categoryId: number,
  actorUserId: string,
  input: ArticleCategoryMutationInput,
) {
  return prisma.articleCategory.update({
    where: { id: BigInt(categoryId) },
    data: {
      name: input.name,
      slug: input.slug,
      color: input.color,
      updatedByUserId: actorUserId,
    },
    select: articleCategorySelect,
  });
}

export async function deleteArticleCategory(categoryId: number) {
  return prisma.articleCategory.delete({
    where: { id: BigInt(categoryId) },
    select: articleCategorySelect,
  });
}

export async function detachArticlesAndDeleteArticleCategory(categoryId: number) {
  const categoryIdValue = BigInt(categoryId);

  return prisma.$transaction(async (tx) => {
    const detachedArticles = await tx.articleCategoryLink.deleteMany({
      where: {
        categoryId: categoryIdValue,
      },
    });

    const deletedCategory = await tx.articleCategory.delete({
      where: { id: categoryIdValue },
      select: articleCategorySelect,
    });

    return {
      deletedCategory,
      detachedArticlesCount: detachedArticles.count,
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

export async function createArticleCategoryAuditLog(data: {
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
      entityType: "ArticleCategory",
      entityId: data.entityId,
      targetLabel: data.targetLabel,
      summary: data.summary,
      beforeSnapshotJson: toAuditJson(data.beforeSnapshotJson),
      afterSnapshotJson: toAuditJson(data.afterSnapshotJson),
    },
  });
}
