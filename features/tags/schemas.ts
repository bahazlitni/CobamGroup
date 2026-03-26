import {
  TAG_PAGE_SIZE_OPTIONS,
  type TagCreateInput,
  type TagListQuery,
  type TagPageSize,
  type TagSuggestionQuery,
  type TagUpdateInput,
} from "./types";

export class TagValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new TagValidationError(`Missing or invalid field "${fieldName}"`);
  }

  return value.trim();
}

export function parseTagIdParam(idParam: string): number {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw new TagValidationError("Invalid id");
  }

  return id;
}

export function parseTagListQuery(searchParams: URLSearchParams): TagListQuery {
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const pageSizeRaw = Number(searchParams.get("pageSize") ?? "20");
  const pageSize = (
    TAG_PAGE_SIZE_OPTIONS.includes(pageSizeRaw as TagPageSize) ? pageSizeRaw : 20
  ) as TagPageSize;

  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() ? qRaw.trim() : undefined;

  return { page, pageSize, q };
}

export function parseTagSuggestionQuery(
  searchParams: URLSearchParams,
): TagSuggestionQuery {
  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() ? qRaw.trim() : undefined;

  const limitRaw = Number(searchParams.get("limit") ?? "8");
  const limit =
    Number.isInteger(limitRaw) && limitRaw > 0
      ? Math.min(limitRaw, 12)
      : 8;

  return { q, limit };
}

function parseTagInputBase(raw: unknown): TagCreateInput {
  if (!isRecord(raw)) {
    throw new TagValidationError("Invalid request body");
  }

  return {
    name: parseRequiredString(raw.name, "name"),
    slug: parseRequiredString(raw.slug, "slug"),
  };
}

export function parseTagCreateInput(raw: unknown): TagCreateInput {
  return parseTagInputBase(raw);
}

export function parseTagUpdateInput(raw: unknown): TagUpdateInput {
  return parseTagInputBase(raw);
}
