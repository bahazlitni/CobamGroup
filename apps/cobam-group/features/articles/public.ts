import { ArticleStatus, Prisma } from "@prisma/client";
import {
  extractArticleMediaIds,
  getArticleFirstParagraphText,
  replaceArticleImageSources,
} from "./document";
import { canPreviewDraftArticleOnPublicPage } from "@/features/articles/access";
import type { StaffSession } from "@/features/auth/types";
import { makeMediaPublicMany } from "@/features/media/repository";
import { prisma } from "@/lib/server/db/prisma";
import type { ArticleCTABannerDto } from "./types";

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
  ctaBanners: ArticleCTABannerDto[];
  descriptionSeo: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  isDraft: boolean;
  suggestions: PublicArticleSummary[];
};

type PublicArticleRecord = {
  id: bigint;
  authorId: string;
  slug: string;
  title: string;
  displayTitle: string | null;
  excerpt: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  status: ArticleStatus;
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
    userId: string;
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
  ctaBanners?: Array<{
    id: bigint;
    title: string;
    description: string | null;
    imageId: bigint | null;
    backgroundColor: string;
    horizontalAspectRatio: ArticleCTABannerDto["horizontalAspectRatio"];
    approxPositionPercentage: number;
    href: string | null;
    image: {
      id: bigint;
      altText: string | null;
      title: string | null;
      widthPx: number | null;
      heightPx: number | null;
      isActive: boolean;
      deletedAt: Date | null;
    } | null;
    buttons: Array<{
      id: bigint;
      text: string | null;
      iconCode: string | null;
      sortOrder: number;
      href: string | null;
    }>;
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
  ctaImageIds?: readonly bigint[];
}) {
  const mediaIds = [
    ...(input.coverMediaId != null ? [Number(input.coverMediaId)] : []),
    ...(input.ogImageMediaId != null ? [Number(input.ogImageMediaId)] : []),
    ...extractArticleMediaIds(input.content),
    ...(input.ctaImageIds ?? []).map((mediaId) => Number(mediaId)),
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

function mapPublicArticleCtaBanners(article: PublicArticleRecord): ArticleCTABannerDto[] {
  return (article.ctaBanners ?? []).map((banner) => {
    const imageId = banner.imageId;
    const hasImage =
      banner.image != null &&
      banner.image.isActive &&
      banner.image.deletedAt == null &&
      imageId != null;

    return {
      id: Number(banner.id),
      title: banner.title,
      description: banner.description,
      imageId: imageId != null ? Number(imageId) : null,
      imageUrl: hasImage && imageId != null ? buildPublicMediaUrl(imageId, "original") : null,
      imageThumbnailUrl:
        hasImage && imageId != null ? buildPublicMediaUrl(imageId, "thumbnail") : null,
      imageAlt: banner.image?.altText ?? banner.image?.title ?? banner.title,
      imageWidth: banner.image?.widthPx ?? null,
      imageHeight: banner.image?.heightPx ?? null,
      backgroundColor: banner.backgroundColor,
      horizontalAspectRatio: banner.horizontalAspectRatio,
      approxPositionPercentage: banner.approxPositionPercentage,
      href: banner.href,
      buttons: banner.buttons.map((button) => ({
        id: Number(button.id),
        text: button.text,
        iconCode: button.iconCode,
        sortOrder: button.sortOrder,
        href: button.href,
      })),
    };
  });
}

function getPublicArticleSelect() {
  return Prisma.validator<Prisma.ArticleSelect>()({
    id: true,
    authorId: true,
    slug: true,
    title: true,
    displayTitle: true,
    excerpt: true,
    content: true,
    createdAt: true,
    updatedAt: true,
    publishedAt: true,
    status: true,
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
        userId: true,
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

async function listPublicArticleSummaries(options: { take?: number } = {}): Promise<PublicArticleSummary[]> {
  const articleSelect = getPublicArticleSelect();
  const articles = await prisma.article.findMany({
    where: {
      deletedAt: null,
      status: ArticleStatus.PUBLISHED,
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { id: "desc" }],
    take: options.take,
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

export async function listPublicArticles(): Promise<PublicArticleSummary[]> {
  return listPublicArticleSummaries();
}

export async function listLatestPublicArticles(take = 3): Promise<PublicArticleSummary[]> {
  return listPublicArticleSummaries({ take });
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
  options: { staffSession?: StaffSession | null } = {},
): Promise<PublicArticleDetail | null> {
  const articleSelect = getPublicArticleSelect();
  const article = await prisma.article.findFirst({
    where: {
      deletedAt: null,
      slug,
    },
    select: {
      ...articleSelect,
      descriptionSeo: true,
      ogTitle: true,
      ogDescription: true,
      ogImageMediaId: true,
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
          approxPositionPercentage: true,
          href: true,
          image: {
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
    },
  });

  if (!article) {
    return null;
  }

  if (article.status === ArticleStatus.PUBLISHED) {
    await ensurePublishedArticleMediaPublic({
      coverMediaId: article.coverMediaId,
      ogImageMediaId: article.ogImageMediaId,
      content: article.content,
      ctaImageIds: article.ctaBanners
        .map((banner) => banner.imageId)
        .filter((imageId): imageId is bigint => imageId != null),
    });
  } else if (
    article.status !== ArticleStatus.DRAFT ||
    !options.staffSession ||
    !canPreviewDraftArticleOnPublicPage(options.staffSession, article)
  ) {
    return null;
  }

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
    ctaBanners: mapPublicArticleCtaBanners(article),
    descriptionSeo: article.descriptionSeo,
    ogTitle: article.ogTitle,
    ogDescription: article.ogDescription,
    ogImageUrl:
      article.ogImageMediaId != null
        ? buildPublicMediaUrl(article.ogImageMediaId, "original")
        : null,
    isDraft: article.status === ArticleStatus.DRAFT,
    suggestions,
  };
}
