import { ArticleStatus, Prisma, UserStatus, type ArticleSeoStatus } from "@prisma/client";
import { prisma } from "@/lib/server/db/prisma";
import type {
  ArticleAuthorOptionsQuery,
  ArticleCTABannerInput,
  ArticleFaqQuestionInput,
  ArticleListQuery,
} from "./types";

type ResolvedArticleInput = {
  title: string;
  slug: string;
  excerpt: string | null;
  introductionContent: string;
  bodyContent: string;
  conclusionContent: string;
  titleSeo: string | null;
  descriptionSeo: string | null;
  focusKeyword: string | null;
  tags: string;
  categoryId: number | null;
  coverMediaId: number | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageMediaId: number | null;
  noIndex: boolean;
  ctaBanners: ArticleCTABannerInput[];
  faqQuestions: ArticleFaqQuestionInput[];
};

const ARTICLE_STAFF_ROLE_SELECT = Prisma.validator<Prisma.UserRoleAssignmentSelect>()({
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

const ARTICLE_STAFF_USER_SELECT = Prisma.validator<Prisma.UserSelect>()({
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
    select: ARTICLE_STAFF_ROLE_SELECT,
  },
});

const ARTICLE_SELECT = Prisma.validator<Prisma.ArticleSelect>()({
  id: true,
  createdByUserId: true,
  updatedByUserId: true,
  publishedByUserId: true,
  title: true,
  slug: true,
  excerpt: true,
  introductionContent: true,
  bodyContent: true,
  conclusionContent: true,
  titleSeo: true,
  descriptionSeo: true,
  focusKeyword: true,
  tags: true,
  status: true,
  seoStatus: true,
  seoScore: true,
  publishedAt: true,
  scheduledPublishAt: true,
  categoryId: true,
  coverMediaId: true,
  createdAt: true,
  updatedAt: true,
  ogTitle: true,
  ogDescription: true,
  ogImageMediaId: true,
  noIndex: true,
  createdByUser: {
    select: ARTICLE_STAFF_USER_SELECT,
  },
  category: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
  ctaBanners: {
    orderBy: [{ approxPositionPercentage: "asc" }, { title: "asc" }, { id: "asc" }],
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
  faqQuestions: {
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      question: true,
      content: true,
      sortOrder: true,
    },
  },
});

function buildArticleWhere(query: ArticleListQuery): Prisma.ArticleWhereInput {
  const where: Prisma.ArticleWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: "insensitive" } },
      { titleSeo: { contains: query.q, mode: "insensitive" } },
      { slug: { contains: query.q, mode: "insensitive" } },
      { tags: { contains: query.q, mode: "insensitive" } },
    ];
  }

  return where;
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

function mapFaqQuestionsForCreate(input: ArticleFaqQuestionInput[]) {
  return input.map((item, index) => ({
    question: item.question,
    content: item.content,
    sortOrder: index,
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

export async function findExistingArticleCategoryIds(categoryIds: readonly number[]) {
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
    select: ARTICLE_STAFF_USER_SELECT,
    take: 50,
  });
}

export async function createArticle(actorUserId: string, input: ResolvedArticleInput) {
  return prisma.article.create({
    data: {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      introductionContent: input.introductionContent,
      bodyContent: input.bodyContent,
      conclusionContent: input.conclusionContent,
      titleSeo: input.titleSeo,
      descriptionSeo: input.descriptionSeo,
      focusKeyword: input.focusKeyword,
      tags: input.tags,
      status: ArticleStatus.DRAFT,
      categoryId: input.categoryId != null ? BigInt(input.categoryId) : null,
      coverMediaId: input.coverMediaId != null ? BigInt(input.coverMediaId) : null,
      createdByUserId: actorUserId,
      updatedByUserId: actorUserId,
      ogTitle: input.ogTitle,
      ogDescription: input.ogDescription,
      ogImageMediaId: input.ogImageMediaId != null ? BigInt(input.ogImageMediaId) : null,
      noIndex: input.noIndex,
      ctaBanners: input.ctaBanners.length
        ? {
            create: mapCtaBannersForCreate(input.ctaBanners),
          }
        : undefined,
      faqQuestions: input.faqQuestions.length
        ? {
            create: mapFaqQuestionsForCreate(input.faqQuestions),
          }
        : undefined,
    },
    select: ARTICLE_SELECT,
  });
}

export async function updateArticle(
  articleId: number,
  actorUserId: string,
  input: ResolvedArticleInput,
) {
  return prisma.article.update({
    where: { id: BigInt(articleId) },
    data: {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      introductionContent: input.introductionContent,
      bodyContent: input.bodyContent,
      conclusionContent: input.conclusionContent,
      titleSeo: input.titleSeo,
      descriptionSeo: input.descriptionSeo,
      focusKeyword: input.focusKeyword,
      tags: input.tags,
      categoryId: input.categoryId != null ? BigInt(input.categoryId) : null,
      coverMediaId: input.coverMediaId != null ? BigInt(input.coverMediaId) : null,
      updatedByUserId: actorUserId,
      ogTitle: input.ogTitle,
      ogDescription: input.ogDescription,
      ogImageMediaId: input.ogImageMediaId != null ? BigInt(input.ogImageMediaId) : null,
      noIndex: input.noIndex,
      ctaBanners: {
        deleteMany: {},
        ...(input.ctaBanners.length
          ? {
              create: mapCtaBannersForCreate(input.ctaBanners),
            }
          : {}),
      },
      faqQuestions: {
        deleteMany: {},
        ...(input.faqQuestions.length
          ? {
              create: mapFaqQuestionsForCreate(input.faqQuestions),
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
    },
    select: ARTICLE_SELECT,
  });
}

export async function updateArticleSchedule(articleId: number, scheduledPublishAt: Date | null) {
  return prisma.article.update({
    where: { id: BigInt(articleId) },
    data: {
      scheduledPublishAt,
    },
    select: ARTICLE_SELECT,
  });
}

export async function updateArticleSeoMetadata(
  articleId: bigint | number,
  seoStatus: ArticleSeoStatus,
  seoScore: number,
) {
  return prisma.article.update({
    where: { id: typeof articleId === "bigint" ? articleId : BigInt(articleId) },
    data: {
      seoStatus,
      seoScore,
    },
    select: ARTICLE_SELECT,
  });
}

export async function listDueScheduledArticles(now: Date) {
  return prisma.article.findMany({
    where: {
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
      excerpt: true,
      scheduledPublishAt: true,
      titleSeo: true,
      descriptionSeo: true,
      focusKeyword: true,
      status: true,
      noIndex: true,
      coverMediaId: true,
      ogTitle: true,
      ogDescription: true,
      ogImageMediaId: true,
      introductionContent: true,
      bodyContent: true,
      conclusionContent: true,
      category: {
        select: {
          name: true,
        },
      },
      ctaBanners: {
        select: {
          imageId: true,
        },
      },
      faqQuestions: {
        select: {
          content: true,
        },
      },
    },
  });
}

export async function markScheduledArticlePublished(
  articleId: bigint,
  scheduledPublishAt: Date | null,
  now: Date,
) {
  const result = await prisma.article.updateMany({
    where: {
      id: articleId,
      status: ArticleStatus.DRAFT,
      scheduledPublishAt: {
        lte: now,
      },
    },
    data: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: scheduledPublishAt ?? now,
      scheduledPublishAt: null,
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

export async function listArticleSeoComparisonRecords(excludeArticleId?: number | null) {
  return prisma.article.findMany({
    where: excludeArticleId
      ? {
          id: {
            not: BigInt(excludeArticleId),
          },
        }
      : undefined,
    select: {
      id: true,
      slug: true,
      title: true,
      titleSeo: true,
      descriptionSeo: true,
      focusKeyword: true,
      introductionContent: true,
      bodyContent: true,
      conclusionContent: true,
    },
  });
}

export async function findArticleSlugConflict(slug: string, excludeArticleId?: number | null) {
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return null;
  }

  return prisma.article.findFirst({
    where: {
      slug: normalizedSlug,
      ...(excludeArticleId
        ? {
            id: {
              not: BigInt(excludeArticleId),
            },
          }
        : {}),
    },
    select: {
      id: true,
      slug: true,
    },
  });
}
