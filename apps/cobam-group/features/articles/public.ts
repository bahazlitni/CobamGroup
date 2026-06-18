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

const PUBLIC_ARTICLE_AUTHOR = "COBAM Group";

export type PublicArticleSummary = {
  id: number;
  slug: string;
  title: string;
  titleSeo: string | null;
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
  introductionContent: string;
  bodyContent: string;
  conclusionContent: string;
  ctaBanners: ArticleCTABannerDto[];
  faqQuestions: Array<{
    id: number;
    question: string;
    content: string;
    sortOrder: number;
  }>;
  descriptionSeo: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  noIndex: boolean;
  isDraft: boolean;
  suggestions: PublicArticleSummary[];
};

type PublicArticleRecord = {
  id: bigint;
  createdByUserId: string | null;
  slug: string;
  title: string;
  titleSeo: string | null;
  excerpt: string | null;
  introductionContent: string;
  bodyContent: string;
  conclusionContent: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  status: ArticleStatus;
  noIndex: boolean;
  categoryId: bigint | null;
  category: {
    id: bigint;
    name: string;
    color: string;
  } | null;
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
  ctaBanners?: Array<{
    id: bigint;
    title: string;
    description: string | null;
    imageId: bigint | null;
    backgroundColor: string;
    horizontalAspectRatio: ArticleCTABannerDto["horizontalAspectRatio"];
    anchor: ArticleCTABannerDto["anchor"];
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
  faqQuestions?: Array<{
    id: bigint;
    question: string;
    content: string;
    sortOrder: number;
  }>;
};

function buildPublicMediaUrl(
  mediaId: bigint | number,
  variant: "original" | "thumbnail" = "original",
) {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${mediaId.toString()}/file${query}`;
}

function getPublicArticleCategories(article: PublicArticleRecord) {
  return article.category
    ? [
        {
          id: Number(article.category.id),
          name: article.category.name,
          color: article.category.color,
          score: 100,
        },
      ]
    : [];
}

async function ensurePublishedArticleMediaPublic(input: {
  coverMediaId: bigint | null;
  ogImageMediaId: bigint | null;
  contents: readonly string[];
  ctaImageIds?: readonly bigint[];
}) {
  const mediaIds = [
    ...(input.coverMediaId != null ? [Number(input.coverMediaId)] : []),
    ...(input.ogImageMediaId != null ? [Number(input.ogImageMediaId)] : []),
    ...input.contents.flatMap((content) => extractArticleMediaIds(content)),
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
    getArticleFirstParagraphText(article.introductionContent) ||
    getArticleFirstParagraphText(article.bodyContent) ||
    "Découvrez l'article complet sur COBAM Group.";

  return {
    id: Number(article.id),
    slug: article.slug,
    title: article.title,
    titleSeo: article.titleSeo,
    excerpt,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    publishedAt: article.publishedAt?.toISOString() ?? null,
    authors: [PUBLIC_ARTICLE_AUTHOR],
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
      anchor: banner.anchor,
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
    createdByUserId: true,
    slug: true,
    title: true,
    titleSeo: true,
    excerpt: true,
    introductionContent: true,
    bodyContent: true,
    conclusionContent: true,
    createdAt: true,
    updatedAt: true,
    publishedAt: true,
    status: true,
    noIndex: true,
    categoryId: true,
    category: {
      select: {
        id: true,
        name: true,
        color: true,
      },
    },
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
  });
}

async function listPublicArticleSummaries(
  options: { take?: number } = {},
): Promise<PublicArticleSummary[]> {
  const articleSelect = getPublicArticleSelect();
  const articles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      noIndex: false,
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
        contents: [
          article.introductionContent,
          article.bodyContent,
          article.conclusionContent,
        ],
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
  categoryId: bigint | null;
  excludeSlug: string;
  take?: number;
}) {
  const take = input.take ?? 3;
  const articleSelect = getPublicArticleSelect();
  const seenIds = new Set<string>([input.articleId.toString()]);
  const suggestionPool: PublicArticleRecord[] = [];

  if (input.categoryId != null) {
    const sameCategory = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        noIndex: false,
        id: { not: input.articleId },
        slug: { not: input.excludeSlug },
        categoryId: input.categoryId,
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
        status: ArticleStatus.PUBLISHED,
        noIndex: false,
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
        contents: [
          article.introductionContent,
          article.bodyContent,
          article.conclusionContent,
        ],
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
          anchor: true,
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
      faqQuestions: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: {
          id: true,
          question: true,
          content: true,
          sortOrder: true,
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
      contents: [
        article.introductionContent,
        article.bodyContent,
        article.conclusionContent,
        ...article.faqQuestions.map((item) => item.content),
      ],
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
    categoryId: article.categoryId,
    excludeSlug: article.slug,
  });

  return {
    ...summary,
    introductionContent: replaceArticleImageSources(article.introductionContent, (mediaId) =>
      buildPublicMediaUrl(mediaId, "original"),
    ),
    bodyContent: replaceArticleImageSources(article.bodyContent, (mediaId) =>
      buildPublicMediaUrl(mediaId, "original"),
    ),
    conclusionContent: replaceArticleImageSources(article.conclusionContent, (mediaId) =>
      buildPublicMediaUrl(mediaId, "original"),
    ),
    ctaBanners: mapPublicArticleCtaBanners(article),
    faqQuestions: article.faqQuestions.map((item) => ({
      id: Number(item.id),
      question: item.question,
      content: replaceArticleImageSources(item.content, (mediaId) =>
        buildPublicMediaUrl(mediaId, "original"),
      ),
      sortOrder: item.sortOrder,
    })),
    descriptionSeo: article.descriptionSeo,
    ogTitle: article.ogTitle,
    ogDescription: article.ogDescription,
    ogImageUrl:
      article.ogImageMediaId != null
        ? buildPublicMediaUrl(article.ogImageMediaId, "original")
        : null,
    noIndex: article.noIndex,
    isDraft: article.status === ArticleStatus.DRAFT,
    suggestions,
  };
}
