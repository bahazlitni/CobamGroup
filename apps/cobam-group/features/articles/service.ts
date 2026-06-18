import { ArticleStatus } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { canAccessArticles, canCreateArticles } from "@/features/articles/access";
import { extractArticleMediaIds } from "@/features/articles/document";
import {
  analyzeArticleSeo,
  type ArticleSeoAnalyzerResult,
} from "@/features/articles/seo-analyzer";
import {
  mapArticleToDetailDto,
  mapArticleToListItemDto,
  mapAuthorRecordToAssignableDto,
} from "@/features/articles/mappers";
import { findImageMediaById, makeMediaPublicMany } from "@/features/media/repository";
import { hasPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { canAffectTargetUser } from "@/features/rbac/roles";
import { resolveAccessFromAssignments } from "@/features/rbac/user-access";
import {
  normalizeOwnedTagNames,
  parseOwnedTagString,
  serializeOwnedTagNames,
} from "@/features/tags/owned";
import { resolveOrCreateTagsByNames } from "@/features/tags/repository";
import { isScheduledPublishAtAligned } from "./scheduling";
import type {
  ArticleAuthorOptionsQuery,
  ArticleAuthorOptionsResult,
  ArticleCreateInput,
  ArticleDetailDto,
  ArticleListQuery,
  ArticleListResult,
  ArticleUpdateInput,
} from "./types";
import {
  createArticle,
  deleteArticle,
  findArticleById,
  findExistingArticleCategoryIds,
  listArticleAuthorOptions,
  listArticleSeoComparisonRecords,
  listArticles,
  listDueScheduledArticles,
  markScheduledArticlePublished,
  updateArticle,
  updateArticleSchedule,
  updateArticleStatus,
} from "./repository";

export class ArticleServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type ArticleRecord = NonNullable<Awaited<ReturnType<typeof findArticleById>>>;

type ScopedPermissionSet = {
  all: string;
  belowRole: string;
  own: string;
};

const UPDATE_PERMISSIONS: ScopedPermissionSet = {
  all: PERMISSIONS.ARTICLES_UPDATE_ALL,
  belowRole: PERMISSIONS.ARTICLES_UPDATE_BELOW_ROLE,
  own: PERMISSIONS.ARTICLES_UPDATE_OWN,
};

const AUTHORS_UPDATE_PERMISSIONS: ScopedPermissionSet = {
  all: PERMISSIONS.ARTICLES_AUTHORS_UPDATE_ALL,
  belowRole: PERMISSIONS.ARTICLES_AUTHORS_UPDATE_BELOW_ROLE,
  own: PERMISSIONS.ARTICLES_AUTHORS_UPDATE_OWN,
};

const DELETE_PERMISSIONS: ScopedPermissionSet = {
  all: PERMISSIONS.ARTICLES_DELETE_ALL,
  belowRole: PERMISSIONS.ARTICLES_DELETE_BELOW_ROLE,
  own: PERMISSIONS.ARTICLES_DELETE_OWN,
};

const PUBLISH_PERMISSIONS: ScopedPermissionSet = {
  all: PERMISSIONS.ARTICLES_PUBLISH_ALL,
  belowRole: PERMISSIONS.ARTICLES_PUBLISH_BELOW_ROLE,
  own: PERMISSIONS.ARTICLES_PUBLISH_OWN,
};

const UNPUBLISH_PERMISSIONS: ScopedPermissionSet = {
  all: PERMISSIONS.ARTICLES_UNPUBLISH_ALL,
  belowRole: PERMISSIONS.ARTICLES_UNPUBLISH_BELOW_ROLE,
  own: PERMISSIONS.ARTICLES_UNPUBLISH_OWN,
};

function isArticleOwner(article: ArticleRecord, userId: string) {
  return article.createdByUserId === userId;
}

function getOwnerAccess(article: ArticleRecord) {
  if (!article.createdByUser) {
    return null;
  }

  return resolveAccessFromAssignments({
    powerType: article.createdByUser.powerType,
    status: article.createdByUser.status,
    assignments: article.createdByUser.receivedRoleAssignments,
  });
}

function isOwnerBelowActor(session: StaffSession, article: ArticleRecord) {
  const ownerAccess = getOwnerAccess(article);

  if (!ownerAccess || !article.createdByUser) {
    return false;
  }

  return canAffectTargetUser(session, {
    id: article.createdByUser.id,
    powerType: article.createdByUser.powerType,
    effectiveRole: ownerAccess.effectiveRole,
  });
}

function canActOnArticle(
  session: StaffSession,
  article: ArticleRecord,
  permissions: ScopedPermissionSet,
) {
  if (hasPermission(session, permissions.all)) {
    return true;
  }

  if (hasPermission(session, permissions.belowRole) && isOwnerBelowActor(session, article)) {
    return true;
  }

  return hasPermission(session, permissions.own) && isArticleOwner(article, session.id);
}

function canViewArticle(session: StaffSession, article: ArticleRecord) {
  return (
    hasPermission(session, PERMISSIONS.ARTICLES_VIEW_ALL) ||
    (hasPermission(session, PERMISSIONS.ARTICLES_VIEW_OWN) &&
      isArticleOwner(article, session.id)) ||
    canActOnArticle(session, article, UPDATE_PERMISSIONS) ||
    canActOnArticle(session, article, DELETE_PERMISSIONS) ||
    canActOnArticle(session, article, PUBLISH_PERMISSIONS) ||
    canActOnArticle(session, article, UNPUBLISH_PERMISSIONS)
  );
}

function getArticleAbilities(session: StaffSession, article: ArticleRecord) {
  return {
    canEdit: canActOnArticle(session, article, UPDATE_PERMISSIONS),
    canManageAuthors: false,
    canPublish:
      article.status === ArticleStatus.PUBLISHED
        ? canActOnArticle(session, article, UNPUBLISH_PERMISSIONS)
        : canActOnArticle(session, article, PUBLISH_PERMISSIONS),
    canDelete: canActOnArticle(session, article, DELETE_PERMISSIONS),
  };
}

function mapArticleCtaBannersForComparison(article: ArticleRecord) {
  return article.ctaBanners.map((banner) => ({
    title: banner.title,
    description: banner.description,
    imageId: banner.imageId != null ? Number(banner.imageId) : null,
    backgroundColor: banner.backgroundColor,
    horizontalAspectRatio: banner.horizontalAspectRatio,
    anchor: banner.anchor,
    approxPositionPercentage: banner.approxPositionPercentage,
    href: banner.href,
    buttons: banner.buttons.map((button) => ({
      text: button.text,
      iconCode: button.iconCode,
      sortOrder: button.sortOrder,
      href: button.href,
    })),
  }));
}

function mapArticleFaqQuestionsForComparison(article: ArticleRecord) {
  return article.faqQuestions.map((item) => ({
    question: item.question,
    content: item.content,
    sortOrder: item.sortOrder,
  }));
}

function getArticleDocumentContents(article: {
  introductionContent: string;
  bodyContent: string;
  conclusionContent: string;
  faqQuestions?: Array<{ content: string }>;
}) {
  return [
    article.introductionContent,
    article.bodyContent,
    article.conclusionContent,
    ...(article.faqQuestions ?? []).map((item) => item.content),
  ];
}

function hasArticleContentChanges(article: ArticleRecord, input: ArticleUpdateInput) {
  const currentTagNames = parseOwnedTagString(article.tags);
  const nextTagNames = normalizeOwnedTagNames(input.tagNames);
  const currentCtaBanners = mapArticleCtaBannersForComparison(article);
  const currentFaqQuestions = mapArticleFaqQuestionsForComparison(article);

  return !(
    article.title === input.title &&
    article.slug === input.slug &&
    article.excerpt === input.excerpt &&
    article.introductionContent === input.introductionContent &&
    article.bodyContent === input.bodyContent &&
    article.conclusionContent === input.conclusionContent &&
    article.titleSeo === input.titleSeo &&
    article.descriptionSeo === input.descriptionSeo &&
    article.focusKeyword === input.focusKeyword &&
    (article.categoryId != null ? Number(article.categoryId) : null) === input.categoryId &&
    JSON.stringify(currentTagNames) === JSON.stringify(nextTagNames) &&
    (article.coverMediaId != null ? Number(article.coverMediaId) : null) === input.coverMediaId &&
    article.ogTitle === input.ogTitle &&
    article.ogDescription === input.ogDescription &&
    (article.ogImageMediaId != null ? Number(article.ogImageMediaId) : null) ===
      input.ogImageMediaId &&
    article.noIndex === input.noIndex &&
    JSON.stringify(currentCtaBanners) === JSON.stringify(input.ctaBanners) &&
    JSON.stringify(currentFaqQuestions) === JSON.stringify(input.faqQuestions)
  );
}

async function assertValidRelations(input: {
  categoryId: number | null;
  coverMediaId: number | null;
  ogImageMediaId: number | null;
  ctaBanners: ArticleCreateInput["ctaBanners"];
}) {
  if (input.categoryId != null) {
    const existingCategoryIds = new Set(await findExistingArticleCategoryIds([input.categoryId]));

    if (!existingCategoryIds.has(input.categoryId)) {
      throw new ArticleServiceError("La catégorie d'article est introuvable.", 400);
    }
  }

  if (input.coverMediaId != null) {
    const exists = await findImageMediaById(input.coverMediaId);
    if (!exists) {
      throw new ArticleServiceError("Invalid coverMediaId", 400);
    }
  }

  if (input.ogImageMediaId != null) {
    const exists = await findImageMediaById(input.ogImageMediaId);
    if (!exists) {
      throw new ArticleServiceError("Invalid ogImageMediaId", 400);
    }
  }

  const bannerImageIds = [
    ...new Set(
      input.ctaBanners
        .map((banner) => banner.imageId)
        .filter((imageId): imageId is number => imageId != null),
    ),
  ];

  await Promise.all(
    bannerImageIds.map(async (imageId) => {
      const exists = await findImageMediaById(imageId);
      if (!exists) {
        throw new ArticleServiceError(`Invalid CTA banner imageId ${imageId}`, 400);
      }
    }),
  );
}

async function ensureArticleMediaIsPublic(input: {
  coverMediaId: number | null;
  ogImageMediaId: number | null;
  contents: readonly string[];
  ctaImageIds?: readonly number[];
}) {
  const mediaIds = [
    ...(input.coverMediaId != null ? [input.coverMediaId] : []),
    ...(input.ogImageMediaId != null ? [input.ogImageMediaId] : []),
    ...input.contents.flatMap((content) => extractArticleMediaIds(content)),
    ...(input.ctaImageIds ?? []),
  ];

  await makeMediaPublicMany(mediaIds);
}

function assertValidScheduledPublishAt(scheduledPublishAt: Date) {
  if (Number.isNaN(scheduledPublishAt.getTime())) {
    throw new ArticleServiceError("Date de publication planifiée invalide.", 400);
  }

  if (!isScheduledPublishAtAligned(scheduledPublishAt)) {
    throw new ArticleServiceError(
      "La date de publication planifiée doit être alignée sur un multiple de 5 minutes.",
      400,
    );
  }

  if (scheduledPublishAt.getTime() <= Date.now()) {
    throw new ArticleServiceError(
      "La date de publication planifiée doit être dans le futur.",
      400,
    );
  }
}

async function analyzePersistedArticleSeo(
  article: ArticleRecord,
): Promise<ArticleSeoAnalyzerResult> {
  const existingArticles = await listArticleSeoComparisonRecords(Number(article.id));

  return analyzeArticleSeo({
    id: Number(article.id),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    introductionContent: article.introductionContent,
    bodyContent: article.bodyContent,
    conclusionContent: article.conclusionContent,
    faqQuestions: article.faqQuestions.map((item) => ({
      question: item.question,
      content: item.content,
    })),
    titleSeo: article.titleSeo,
    descriptionSeo: article.descriptionSeo,
    focusKeyword: article.focusKeyword,
    status: article.status,
    noIndex: article.noIndex,
    categoryName: article.category?.name ?? null,
    coverMediaId: article.coverMediaId != null ? Number(article.coverMediaId) : null,
    ogTitle: article.ogTitle,
    ogDescription: article.ogDescription,
    ogImageMediaId: article.ogImageMediaId != null ? Number(article.ogImageMediaId) : null,
    publicUrl: `/actualites/${article.slug}`,
    mode: "publish",
    existingArticles: existingArticles.map((candidate) => ({
      id: Number(candidate.id),
      slug: candidate.slug,
      title: candidate.title,
      titleSeo: candidate.titleSeo,
      descriptionSeo: candidate.descriptionSeo,
      focusKeyword: candidate.focusKeyword,
      introductionContent: candidate.introductionContent,
      bodyContent: candidate.bodyContent,
      conclusionContent: candidate.conclusionContent,
    })),
  });
}

async function assertArticleSeoReadyForPublishing(article: ArticleRecord) {
  const analysis = await analyzePersistedArticleSeo(article);

  if (analysis.status !== "SEO_READY") {
    const issue =
      analysis.criticalIssues[0]?.message ??
      analysis.warnings[0]?.message ??
      "L'article doit être amélioré avant publication.";

    throw new ArticleServiceError(`SEO_NOT_READY: ${issue}`, 422);
  }

  return analysis;
}

export async function listArticlesService(
  session: StaffSession,
  query: ArticleListQuery,
): Promise<ArticleListResult> {
  if (!canAccessArticles(session)) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  const records = await listArticles(query);
  const accessibleItems = records.filter((article) => canViewArticle(session, article));
  const total = accessibleItems.length;
  const startIndex = (query.page - 1) * query.pageSize;
  const items = accessibleItems
    .slice(startIndex, startIndex + query.pageSize)
    .map(mapArticleToListItemDto);

  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getArticleByIdService(
  session: StaffSession,
  articleId: number,
): Promise<ArticleDetailDto> {
  if (!canAccessArticles(session)) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  const article = await findArticleById(articleId);

  if (!article) {
    throw new ArticleServiceError("Article not found", 404);
  }

  if (!canViewArticle(session, article)) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  return mapArticleToDetailDto(article, getArticleAbilities(session, article));
}

export async function getArticleSeoAnalysisService(
  session: StaffSession,
  articleId: number,
): Promise<ArticleSeoAnalyzerResult> {
  const article = await findArticleById(articleId);

  if (!article) {
    throw new ArticleServiceError("Article not found", 404);
  }

  if (!canViewArticle(session, article)) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  return analyzePersistedArticleSeo(article);
}

export async function listArticleAuthorOptionsService(
  session: StaffSession,
  query: ArticleAuthorOptionsQuery,
): Promise<ArticleAuthorOptionsResult> {
  if (query.articleId != null) {
    const article = await findArticleById(query.articleId);

    if (!article) {
      throw new ArticleServiceError("Article not found", 404);
    }

    if (!canActOnArticle(session, article, AUTHORS_UPDATE_PERMISSIONS)) {
      throw new ArticleServiceError("Forbidden", 403);
    }
  } else if (!canCreateArticles(session)) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  const items = await listArticleAuthorOptions(query);

  return {
    items: items.map(mapAuthorRecordToAssignableDto),
  };
}

export async function createArticleService(
  session: StaffSession,
  input: ArticleCreateInput,
) {
  if (!canCreateArticles(session)) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  await Promise.all([
    resolveOrCreateTagsByNames(input.tagNames),
    assertValidRelations({
      categoryId: input.categoryId,
      coverMediaId: input.coverMediaId,
      ogImageMediaId: input.ogImageMediaId,
      ctaBanners: input.ctaBanners,
    }),
  ]);

  const article = await createArticle(session.id, {
    ...input,
    tags: serializeOwnedTagNames(input.tagNames),
  });

  return mapArticleToDetailDto(article, getArticleAbilities(session, article));
}

export async function updateArticleService(
  session: StaffSession,
  articleId: number,
  input: ArticleUpdateInput,
) {
  const before = await findArticleById(articleId);

  if (!before) {
    throw new ArticleServiceError("Article not found", 404);
  }

  const abilities = getArticleAbilities(session, before);
  const hasContentChanges = hasArticleContentChanges(before, input);

  if (hasContentChanges && !abilities.canEdit) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  if (!hasContentChanges && !abilities.canEdit) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  await Promise.all([
    resolveOrCreateTagsByNames(input.tagNames),
    assertValidRelations({
      categoryId: input.categoryId,
      coverMediaId: input.coverMediaId,
      ogImageMediaId: input.ogImageMediaId,
      ctaBanners: input.ctaBanners,
    }),
  ]);

  const article = await updateArticle(articleId, session.id, {
    ...input,
    tags: serializeOwnedTagNames(input.tagNames),
  });

  if (article.status === ArticleStatus.PUBLISHED) {
    await ensureArticleMediaIsPublic({
      coverMediaId: article.coverMediaId != null ? Number(article.coverMediaId) : null,
      ogImageMediaId:
        article.ogImageMediaId != null ? Number(article.ogImageMediaId) : null,
      contents: getArticleDocumentContents(article),
      ctaImageIds: article.ctaBanners
        .map((banner) => (banner.imageId != null ? Number(banner.imageId) : null))
        .filter((imageId): imageId is number => imageId != null),
    });
  }

  return mapArticleToDetailDto(article, getArticleAbilities(session, article));
}

export async function publishArticleService(
  session: StaffSession,
  articleId: number,
) {
  const before = await findArticleById(articleId);

  if (!before) {
    throw new ArticleServiceError("Article not found", 404);
  }

  if (!canActOnArticle(session, before, PUBLISH_PERMISSIONS)) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  await assertArticleSeoReadyForPublishing(before);

  const article = await updateArticleStatus(
    articleId,
    ArticleStatus.PUBLISHED,
    before.publishedAt ?? new Date(),
    {
      publishedByUserId: session.id,
      scheduledPublishAt: null,
    },
  );

  await ensureArticleMediaIsPublic({
    coverMediaId: article.coverMediaId != null ? Number(article.coverMediaId) : null,
    ogImageMediaId:
      article.ogImageMediaId != null ? Number(article.ogImageMediaId) : null,
    contents: getArticleDocumentContents(article),
    ctaImageIds: article.ctaBanners
      .map((banner) => (banner.imageId != null ? Number(banner.imageId) : null))
      .filter((imageId): imageId is number => imageId != null),
  });

  return mapArticleToDetailDto(article, getArticleAbilities(session, article));
}

export async function unpublishArticleService(
  session: StaffSession,
  articleId: number,
) {
  const before = await findArticleById(articleId);

  if (!before) {
    throw new ArticleServiceError("Article not found", 404);
  }

  if (!canActOnArticle(session, before, UNPUBLISH_PERMISSIONS)) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  const article = await updateArticleStatus(
    articleId,
    ArticleStatus.DRAFT,
    undefined,
    {
      scheduledPublishAt: null,
    },
  );

  return mapArticleToDetailDto(article, getArticleAbilities(session, article));
}

export async function scheduleArticlePublicationService(
  session: StaffSession,
  articleId: number,
  scheduledPublishAt: Date,
) {
  const before = await findArticleById(articleId);

  if (!before) {
    throw new ArticleServiceError("Article not found", 404);
  }

  if (before.status !== ArticleStatus.DRAFT) {
    throw new ArticleServiceError("Seuls les articles en brouillon peuvent être planifiés.", 400);
  }

  if (!canActOnArticle(session, before, PUBLISH_PERMISSIONS)) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  assertValidScheduledPublishAt(scheduledPublishAt);
  await assertArticleSeoReadyForPublishing(before);

  const article = await updateArticleSchedule(articleId, scheduledPublishAt);

  return mapArticleToDetailDto(article, getArticleAbilities(session, article));
}

export async function cancelArticlePublicationScheduleService(
  session: StaffSession,
  articleId: number,
) {
  const before = await findArticleById(articleId);

  if (!before) {
    throw new ArticleServiceError("Article not found", 404);
  }

  if (!canActOnArticle(session, before, PUBLISH_PERMISSIONS)) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  const article = await updateArticleSchedule(articleId, null);

  return mapArticleToDetailDto(article, getArticleAbilities(session, article));
}

export async function publishDueScheduledArticlesService(now = new Date()) {
  const dueArticles = await listDueScheduledArticles(now);
  const publishedArticles: Array<{
    id: number;
    title: string;
    slug: string;
    scheduledPublishAt: string | null;
  }> = [];

  for (const article of dueArticles) {
    const fullArticle = await findArticleById(Number(article.id));

    if (!fullArticle) {
      continue;
    }

    const analysis = await analyzePersistedArticleSeo(fullArticle);
    if (analysis.status !== "SEO_READY") {
      continue;
    }

    const wasPublished = await markScheduledArticlePublished(
      article.id,
      article.scheduledPublishAt,
      now,
    );

    if (!wasPublished) {
      continue;
    }

    await ensureArticleMediaIsPublic({
      coverMediaId:
        article.coverMediaId != null ? Number(article.coverMediaId) : null,
      ogImageMediaId:
        article.ogImageMediaId != null ? Number(article.ogImageMediaId) : null,
      contents: getArticleDocumentContents(article),
      ctaImageIds: article.ctaBanners
        .map((banner) => (banner.imageId != null ? Number(banner.imageId) : null))
        .filter((imageId): imageId is number => imageId != null),
    });

    publishedArticles.push({
      id: Number(article.id),
      title: article.title,
      slug: article.slug,
      scheduledPublishAt: article.scheduledPublishAt?.toISOString() ?? null,
    });
  }

  return {
    checked: dueArticles.length,
    published: publishedArticles.length,
    skipped: dueArticles.length - publishedArticles.length,
    articles: publishedArticles,
  };
}

export async function deleteArticleService(
  session: StaffSession,
  articleId: number,
) {
  const before = await findArticleById(articleId);

  if (!before) {
    throw new ArticleServiceError("Article not found", 404);
  }

  if (!canActOnArticle(session, before, DELETE_PERMISSIONS)) {
    throw new ArticleServiceError("Forbidden", 403);
  }

  await deleteArticle(articleId);
}
