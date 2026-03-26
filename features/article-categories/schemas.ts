import {
  ARTICLE_CATEGORY_PAGE_SIZE_OPTIONS,
  type ArticleCategoryListQuery,
  type ArticleCategoryMutationInput,
  type ArticleCategoryPageSize,
} from "./types";

export class ArticleCategoryValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ArticleCategoryValidationError(
      `Champ "${fieldName}" manquant ou invalide.`,
      400,
    );
  }

  return value.trim();
}

function parseColor(value: unknown) {
  const color = parseRequiredString(value, "color");

  if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) {
    throw new ArticleCategoryValidationError("Couleur invalide.", 400);
  }

  return color.toLowerCase();
}

export function parseArticleCategoryIdParam(idParam: string) {
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ArticleCategoryValidationError("Identifiant invalide.", 400);
  }

  return id;
}

export function parseArticleCategoryListQuery(
  searchParams: URLSearchParams,
): ArticleCategoryListQuery {
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const pageSizeRaw = Number(searchParams.get("pageSize") ?? "20");
  const pageSize = (ARTICLE_CATEGORY_PAGE_SIZE_OPTIONS.includes(
    pageSizeRaw as ArticleCategoryPageSize,
  )
    ? pageSizeRaw
    : 20) as ArticleCategoryPageSize;

  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() ? qRaw.trim() : undefined;

  return {
    page,
    pageSize,
    q,
  };
}

export function parseArticleCategoryMutationInput(
  raw: unknown,
): ArticleCategoryMutationInput {
  if (!isRecord(raw)) {
    throw new ArticleCategoryValidationError("Corps de requete invalide.", 400);
  }

  return {
    name: parseRequiredString(raw.name, "name"),
    slug: parseRequiredString(raw.slug, "slug"),
    color: parseColor(raw.color),
  };
}

export function parseArticleCategoryDeleteOptions(searchParams: URLSearchParams) {
  return {
    force: searchParams.get("force") === "true",
  };
}
