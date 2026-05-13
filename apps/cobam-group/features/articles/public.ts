import { ArticleStatus, Prisma } from "@prisma/client";
import {
  extractArticleMediaIds,
  getArticleFirstParagraphText,
  replaceArticleImageSources,
} from "./document";
import { makeMediaPublicMany } from "@/features/media/repository";
import { prisma } from "@/lib/server/db/prisma";

export type PublicArticleSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  authors: string[];
  coverImageUrl: string | null;
  coverImageThumbnailUrl: string | null;
  coverImageAlt: string | null;
  coverImageWidth: number | null;
  coverImageHeight: number | null;
  categories: Array<{
    id: number;
    name: string;
    color: string;
    score: number;
  }>;
};

export type PublicArticleDetail = PublicArticleSummary & {
  content: string;
  descriptionSeo: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  suggestions: PublicArticleSummary[];
};

type PublicArticleRecord = {
  id: bigint;
  slug: string;
  title: string;
  displayTitle: string | null;
  excerpt: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  coverMediaId: bigint | null;
  coverMedia: {
    id: bigint;
    altText: string | null;
    title: string | null;
    widthPx: number | null;
    heightPx: number | null;
    isActive: boolean;
    deletedAt: Date | null;
  } | null;
  author: {
    email: string;
    profile: { firstName: string | null; lastName: string | null } | null;
  };
  authorLinks: Array<{
    user: {
      email: string;
      profile: { firstName: string | null; lastName: string | null } | null;
    };
  }>;
  categoryLinks: Array<{
    categoryId: bigint;
    score: number;
    category: {
      id: bigint;
      name: string;
      color: string;
    };
  }>;
};

const AUTHOR_LINK_ORDER_BY = [
  { createdAt: "asc" },
  { userId: "asc" },
] satisfies Prisma.ArticleAuthorLinkOrderByWithRelationInput[];

function buildPublicMediaUrl(
  mediaId: bigint | number,
  variant: "original" | "thumbnail" = "original",
) {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

function getAuthorLabel(author: {
  email: string;
  profile: { firstName: string | null; lastName: string | null } | null;
}) {
  const parts = [
    author.profile?.firstName?.trim() ?? "",
    author.profile?.lastName?.trim() ?? "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : author.email;
}

function getAuthorLabels(article: PublicArticleRecord) {
  const labels = [
    getAuthorLabel(article.author),
    ...article.authorLinks.map((link) => getAuthorLabel(link.user)),
  ];

  return [...new Set(labels)];
}

function getPublicArticleCategories(article: PublicArticleRecord) {
  return article.categoryLinks.map((link) => ({
    id: Number(link.category.id),
    name: link.category.name,
    color: link.category.color,
    score: link.score,
  }));
}

async function ensurePublishedArticleMediaPublic(input: {
  coverMediaId: bigint | null;
  ogImageMediaId: bigint | null;
  content: string;
}) {
  const mediaIds = [
    ...(input.coverMediaId != null ? [Number(input.coverMediaId)] : []),
    ...(input.ogImageMediaId != null ? [Number(input.ogImageMediaId)] : []),
    ...extractArticleMediaIds(input.content),
  ];

  await makeMediaPublicMany(mediaIds);
}

function mapPublicArticleSummary(article: PublicArticleRecord): PublicArticleSummary {
  const hasCover =
    article.coverMedia != null &&
    article.coverMedia.isActive &&
    article.coverMedia.deletedAt == null &&
    article.coverMediaId != null;
  const excerpt =
    article.excerpt?.trim() ||
    getArticleFirstParagraphText(article.content) ||
    "Découvrez l'article complet sur COBAM GROUP.";

  return {
    id: Number(article.id),
    slug: article.slug,
    title: article.displayTitle?.trim() || article.title,
    excerpt,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    publishedAt: article.publishedAt?.toISOString() ?? null,
    authors: getAuthorLabels(article),
    coverImageUrl:
      hasCover && article.coverMediaId != null
        ? buildPublicMediaUrl(article.coverMediaId, "original")
        : null,
    coverImageThumbnailUrl:
      hasCover && article.coverMediaId != null
        ? buildPublicMediaUrl(article.coverMediaId, "thumbnail")
        : null,
    coverImageAlt:
      article.coverMedia?.altText ?? article.coverMedia?.title ?? article.title,
    coverImageWidth: article.coverMedia?.widthPx ?? null,
    coverImageHeight: article.coverMedia?.heightPx ?? null,
    categories: getPublicArticleCategories(article),
  };
}

function getPublicArticleSelect() {
  return Prisma.validator<Prisma.ArticleSelect>()({
    id: true,
    slug: true,
    title: true,
    displayTitle: true,
    excerpt: true,
    content: true,
    createdAt: true,
    updatedAt: true,
    publishedAt: true,
    coverMediaId: true,
    coverMedia: {
      select: {
        id: true,
        altText: true,
        title: true,
        widthPx: true,
        heightPx: true,
        isActive: true,
        deletedAt: true,
      },
    },
    author: {
      select: {
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    },
    authorLinks: {
      orderBy: AUTHOR_LINK_ORDER_BY,
      select: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    },
    categoryLinks: {
      orderBy: [{ score: "desc" }, { createdAt: "asc" }, { categoryId: "asc" }],
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
}

export async function listPublicArticles(): Promise<PublicArticleSummary[]> {
  const articleSelect = getPublicArticleSelect();
  const articles = await prisma.article.findMany({
    where: {
      deletedAt: null,
      status: ArticleStatus.PUBLISHED,
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { id: "desc" }],
    select: {
      ...articleSelect,
      ogImageMediaId: true,
    },
  });

  if (articles.length === 0) {
    return [];
  }

  await Promise.all(
    articles.map((article) =>
      ensurePublishedArticleMediaPublic({
        coverMediaId: article.coverMediaId,
        ogImageMediaId: article.ogImageMediaId,
        content: article.content,
      }),
    ),
  );

  return articles.map((article) => mapPublicArticleSummary(article));
}

async function listPublicArticleSuggestions(input: {
  articleId: bigint;
  categoryIds: bigint[];
  excludeSlug: string;
  take?: number;
}) {
  const take = input.take ?? 3;
  const articleSelect = getPublicArticleSelect();
  const seenIds = new Set<string>([input.articleId.toString()]);
  const suggestionPool: PublicArticleRecord[] = [];

  if (input.categoryIds.length > 0) {
    const sameCategory = await prisma.article.findMany({
      where: {
        deletedAt: null,
        status: ArticleStatus.PUBLISHED,
        id: { not: input.articleId },
        slug: { not: input.excludeSlug },
        categoryLinks: {
          some: {
            categoryId: {
              in: input.categoryIds,
            },
          },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { id: "desc" }],
      take,
      select: articleSelect,
    });

    sameCategory.forEach((article) => {
      if (!seenIds.has(article.id.toString())) {
        seenIds.add(article.id.toString());
        suggestionPool.push(article);
      }
    });
  }

  if (suggestionPool.length < take) {
    const latestArticles = await prisma.article.findMany({
      where: {
        deletedAt: null,
        status: ArticleStatus.PUBLISHED,
        id: { not: input.articleId },
        slug: { not: input.excludeSlug },
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { id: "desc" }],
      take: take + 3,
      select: articleSelect,
    });

    latestArticles.forEach((article) => {
      if (!seenIds.has(article.id.toString()) && suggestionPool.length < take) {
        seenIds.add(article.id.toString());
        suggestionPool.push(article);
      }
    });
  }

  await Promise.all(
    suggestionPool.map((article) =>
      ensurePublishedArticleMediaPublic({
        coverMediaId: article.coverMediaId,
        ogImageMediaId: null,
        content: article.content,
      }),
    ),
  );

  return suggestionPool.slice(0, take).map(mapPublicArticleSummary);
}

export async function findPublicArticleBySlug(
  slug: string,
): Promise<PublicArticleDetail | null> {
  const articleSelect = getPublicArticleSelect();
  const article = await prisma.article.findFirst({
    where: {
      deletedAt: null,
      status: ArticleStatus.PUBLISHED,
      slug,
    },
    select: {
      ...articleSelect,
      descriptionSeo: true,
      ogTitle: true,
      ogDescription: true,
      ogImageMediaId: true,
    },
  });

  if (!article) {
    return null;
  }

  await ensurePublishedArticleMediaPublic({
    coverMediaId: article.coverMediaId,
    ogImageMediaId: article.ogImageMediaId,
    content: article.content,
  });

  const summary = mapPublicArticleSummary(article);
  const suggestions = await listPublicArticleSuggestions({
    articleId: article.id,
    categoryIds: article.categoryLinks.map((link) => link.categoryId),
    excludeSlug: article.slug,
  });

  return {
    ...summary,
    content: replaceArticleImageSources(article.content, (mediaId) =>
      buildPublicMediaUrl(mediaId, "original"),
    ),
    descriptionSeo: article.descriptionSeo,
    ogTitle: article.ogTitle,
    ogDescription: article.ogDescription,
    suggestions,
  };
}
