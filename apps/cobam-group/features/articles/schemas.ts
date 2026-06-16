import {
  ArticleCTABannerAnchor,
  ArticleCTABannerHorizontalAspectRatio,
  ArticleStatus,
} from "@prisma/client";
import {
  ARTICLE_PAGE_SIZE_OPTIONS,
  type ArticleCreateInput,
  type ArticleListQuery,
  type ArticlePageSize,
  type ArticleUpdateInput,
} from "./types";
import { DESCRIPTION_SEO_MAX_LENGTH } from "@/lib/seo-description";

export class ArticleValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseRequiredString(
  value: unknown,
  fieldName: string,
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ArticleValidationError(`Missing or invalid field "${fieldName}"`);
  }

  return value.trim();
}

function parseOptionalNullableString(
  value: unknown,
): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") {
    throw new ArticleValidationError("Invalid string field");
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseOptionalNullableHref(value: unknown): string | null {
  const href = parseOptionalNullableString(value);

  if (!href) {
    return null;
  }

  if (href.length > 500 || /^\s*javascript:/i.test(href)) {
    throw new ArticleValidationError("Invalid link field");
  }

  return href;
}

function parseOptionalDescriptionSeo(value: unknown) {
  const normalized = parseOptionalNullableString(value);
  if (normalized && normalized.length > DESCRIPTION_SEO_MAX_LENGTH) {
    throw new ArticleValidationError(
      `descriptionSeo must be ${DESCRIPTION_SEO_MAX_LENGTH} characters or fewer`,
    );
  }
  return normalized;
}

function parseOptionalNullableBoolean(
  value: unknown,
): boolean {
  if (typeof value === "boolean") return value;
  if (value == null) return false;
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  throw new ArticleValidationError("Invalid boolean field");
}

function parseOptionalNullableInteger(
  value: unknown,
  fieldName: string,
): number | null {
  if (value == null || value === "") return null;

  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new ArticleValidationError(`Invalid "${fieldName}"`);
    }
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
      throw new ArticleValidationError(`Invalid "${fieldName}"`);
    }
    return parsed;
  }

  throw new ArticleValidationError(`Invalid "${fieldName}"`);
}

function parseArticleCtaBackgroundColor(value: unknown): string {
  const color = parseOptionalNullableString(value) ?? "#14202e";

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new ArticleValidationError('Invalid "ctaBanners.backgroundColor"');
  }

  return color;
}

function parseArticleCtaAspectRatio(value: unknown) {
  if (value == null || value === "") {
    return ArticleCTABannerHorizontalAspectRatio.RATIO_21_10;
  }

  if (
    typeof value !== "string" ||
    !(Object.values(ArticleCTABannerHorizontalAspectRatio) as string[]).includes(value)
  ) {
    throw new ArticleValidationError('Invalid "ctaBanners.horizontalAspectRatio"');
  }

  return value as ArticleCTABannerHorizontalAspectRatio;
}

function parseArticleCtaAnchor(value: unknown) {
  if (value == null || value === "") {
    return ArticleCTABannerAnchor.CENTER_CENTER;
  }

  if (
    typeof value !== "string" ||
    !(Object.values(ArticleCTABannerAnchor) as string[]).includes(value)
  ) {
    throw new ArticleValidationError('Invalid "ctaBanners.anchor"');
  }

  return value as ArticleCTABannerAnchor;
}

function parseArticleCtaPosition(value: unknown): number {
  const position = parseOptionalNullableInteger(value, "ctaBanners.approxPositionPercentage") ?? 50;

  if (position < 0 || position > 100) {
    throw new ArticleValidationError(
      '"ctaBanners.approxPositionPercentage" must be between 0 and 100',
    );
  }

  return position;
}

function parseArticleCtaBanners(value: unknown): ArticleCreateInput["ctaBanners"] {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ArticleValidationError('Invalid "ctaBanners"');
  }

  return value.map((banner, bannerIndex) => {
    if (!isRecord(banner)) {
      throw new ArticleValidationError('Invalid "ctaBanners"');
    }

    const rawButtons = banner.buttons;
    const buttons = rawButtons == null ? [] : rawButtons;

    if (!Array.isArray(buttons)) {
      throw new ArticleValidationError('Invalid "ctaBanners.buttons"');
    }

    if (buttons.length > 2) {
      throw new ArticleValidationError("Une bannière CTA ne peut pas avoir plus de deux boutons.");
    }

    const normalizedButtons = buttons
      .map((button, buttonIndex) => {
        if (!isRecord(button)) {
          throw new ArticleValidationError('Invalid "ctaBanners.buttons"');
        }

        const rawSortOrder = parseOptionalNullableInteger(
          button.sortOrder,
          `ctaBanners[${bannerIndex}].buttons[${buttonIndex}].sortOrder`,
        );

        return {
          text: parseOptionalNullableString(button.text),
          iconCode: parseOptionalNullableString(button.iconCode),
          sortOrder: rawSortOrder ?? buttonIndex,
          href: parseOptionalNullableHref(button.href),
        };
      })
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((button, buttonIndex) => ({
        ...button,
        sortOrder: buttonIndex,
      }));

    return {
      title: parseRequiredString(banner.title, `ctaBanners[${bannerIndex}].title`),
      description: parseOptionalNullableString(banner.description),
      imageId: parseOptionalNullableInteger(
        banner.imageId,
        `ctaBanners[${bannerIndex}].imageId`,
      ),
      backgroundColor: parseArticleCtaBackgroundColor(banner.backgroundColor),
      horizontalAspectRatio: parseArticleCtaAspectRatio(banner.horizontalAspectRatio),
      anchor: parseArticleCtaAnchor(banner.anchor),
      approxPositionPercentage: parseArticleCtaPosition(banner.approxPositionPercentage),
      href: parseOptionalNullableHref(banner.href),
      buttons: normalizedButtons,
    };
  });
}

function parseCategoryAssignments(
  value: unknown,
  fallbackCategoryId: number | null,
) {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      if (!isRecord(item)) {
        throw new ArticleValidationError("Invalid \"categoryAssignments\"");
      }

      const categoryId = parseOptionalNullableInteger(
        item.categoryId,
        `categoryAssignments[${index}].categoryId`,
      );
      const score = parseOptionalNullableInteger(
        item.score,
        `categoryAssignments[${index}].score`,
      );

      if (categoryId == null || score == null) {
        throw new ArticleValidationError("Invalid \"categoryAssignments\"");
      }

      return {
        categoryId,
        score,
      };
    });
  }

  return fallbackCategoryId != null
    ? [
        {
          categoryId: fallbackCategoryId,
          score: 100,
        },
      ]
    : [];
}

function parseAuthorIds(value: unknown): string[] {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ArticleValidationError('Invalid "authorIds"');
  }

  return [...new Set(
    value.map((item) => {
      if (typeof item !== "string" || !item.trim()) {
        throw new ArticleValidationError('Invalid "authorIds"');
      }

      return item.trim();
    }),
  )];
}

function parseTagNames(value: unknown): string[] {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ArticleValidationError('Invalid "tagNames"');
  }

  return [...new Set(
    value.map((item) => {
      if (typeof item !== "string") {
        throw new ArticleValidationError('Invalid "tagNames"');
      }

      const normalized = item.replace(/\s+/g, " ").trim();

      if (!normalized) {
        throw new ArticleValidationError('Invalid "tagNames"');
      }

      return normalized;
    }),
  )];
}

export function parseArticleIdParam(idParam: string): number {
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ArticleValidationError("Invalid id");
  }

  return id;
}

export function parseArticleListQuery(
  searchParams: URLSearchParams,
): ArticleListQuery {
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const pageSizeRaw = Number(searchParams.get("pageSize") ?? "12");
  const pageSize = (ARTICLE_PAGE_SIZE_OPTIONS.includes(
    pageSizeRaw as ArticlePageSize,
  )
    ? pageSizeRaw
    : 12) as ArticlePageSize;

  const statusRaw = searchParams.get("status");
  let status: ArticleStatus | undefined;

  if (statusRaw) {
    if (!(Object.values(ArticleStatus) as string[]).includes(statusRaw)) {
      throw new ArticleValidationError("Invalid status");
    }
    status = statusRaw as ArticleStatus;
  }

  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() ? qRaw.trim() : undefined;

  return {
    page,
    pageSize,
    status,
    q,
  };
}

function parseArticleInputBase(raw: unknown): ArticleCreateInput {
  if (!isRecord(raw)) {
    throw new ArticleValidationError("Invalid request body");
  }

  const fallbackCategoryId = parseOptionalNullableInteger(raw.categoryId, "categoryId");

  return {
    title: parseRequiredString(raw.title, "title"),
    displayTitle: parseOptionalNullableString(raw.displayTitle),
    slug: parseRequiredString(raw.slug, "slug"),
    excerpt: parseOptionalNullableString(raw.excerpt),
    content: parseRequiredString(raw.content, "content"),
    descriptionSeo: parseOptionalDescriptionSeo(raw.descriptionSeo),
    categoryAssignments: parseCategoryAssignments(
      raw.categoryAssignments,
      fallbackCategoryId,
    ),
    tagNames: parseTagNames(raw.tagNames),
    coverMediaId: parseOptionalNullableInteger(
      raw.coverMediaId,
      "coverMediaId",
    ),
    ogTitle: parseOptionalNullableString(raw.ogTitle),
    ogDescription: parseOptionalNullableString(raw.ogDescription),
    ogImageMediaId: parseOptionalNullableInteger(
      raw.ogImageMediaId,
      "ogImageMediaId",
    ),
    noIndex: parseOptionalNullableBoolean(raw.noIndex),
    noFollow: parseOptionalNullableBoolean(raw.noFollow),
    schemaType: parseOptionalNullableString(raw.schemaType),
    authorIds: parseAuthorIds(raw.authorIds),
    ctaBanners: parseArticleCtaBanners(raw.ctaBanners),
  };
}

export function parseArticleCreateInput(raw: unknown): ArticleCreateInput {
  return parseArticleInputBase(raw);
}

export function parseArticleUpdateInput(raw: unknown): ArticleUpdateInput {
  return parseArticleInputBase(raw);
}

export function parseArticleScheduleInput(raw: unknown): {
  scheduledPublishAt: Date;
} {
  if (!isRecord(raw)) {
    throw new ArticleValidationError("Invalid request body");
  }

  if (typeof raw.scheduledPublishAt !== "string" || !raw.scheduledPublishAt.trim()) {
    throw new ArticleValidationError('Missing or invalid field "scheduledPublishAt"');
  }

  const scheduledPublishAt = new Date(raw.scheduledPublishAt);

  if (Number.isNaN(scheduledPublishAt.getTime())) {
    throw new ArticleValidationError('Invalid field "scheduledPublishAt"');
  }

  return { scheduledPublishAt };
}

export function parseArticleAuthorOptionsQuery(searchParams: URLSearchParams) {
  const articleIdRaw = searchParams.get("articleId");
  const qRaw = searchParams.get("q");

  return {
    articleId: articleIdRaw?.trim() ? parseArticleIdParam(articleIdRaw) : null,
    q: qRaw?.trim() ? qRaw.trim() : undefined,
  };
}
