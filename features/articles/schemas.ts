import { ArticleStatus } from "@prisma/client";
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
  };
}

export function parseArticleCreateInput(raw: unknown): ArticleCreateInput {
  return parseArticleInputBase(raw);
}

export function parseArticleUpdateInput(raw: unknown): ArticleUpdateInput {
  return parseArticleInputBase(raw);
}

export function parseArticleAuthorOptionsQuery(searchParams: URLSearchParams) {
  const articleIdRaw = searchParams.get("articleId");
  const qRaw = searchParams.get("q");

  return {
    articleId: articleIdRaw?.trim() ? parseArticleIdParam(articleIdRaw) : null,
    q: qRaw?.trim() ? qRaw.trim() : undefined,
  };
}
