import {
  BRAND_PAGE_SIZE_OPTIONS,
  type BrandShowcasePlacement,
  type BrandCreateInput,
  type BrandListQuery,
  type BrandPageSize,
  type BrandUpdateInput,
} from "./types";

export class BrandValidationError extends Error {
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
    throw new BrandValidationError(`Missing or invalid field "${fieldName}"`);
  }

  return value.trim();
}

function parseOptionalNullableString(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") {
    throw new BrandValidationError("Invalid string field");
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseOptionalNullableInteger(
  value: unknown,
  fieldName: string,
): number | null {
  if (value == null || value === "") {
    return null;
  }

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BrandValidationError(`Invalid field "${fieldName}"`);
  }

  return parsed;
}

function parseBooleanField(value: unknown, fieldName: string): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;

  throw new BrandValidationError(`Invalid field "${fieldName}"`);
}

function parseBrandShowcasePlacement(
  value: unknown,
): BrandShowcasePlacement {
  if (value === "NONE" || value === "REFERENCE" || value === "PARTNER") {
    return value;
  }

  throw new BrandValidationError('Invalid field "showcasePlacement"');
}

export function parseBrandIdParam(idParam: string): number {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BrandValidationError("Invalid id");
  }

  return id;
}

export function parseBrandListQuery(searchParams: URLSearchParams): BrandListQuery {
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const pageSizeRaw = Number(searchParams.get("pageSize") ?? "20");
  const pageSize = (
    BRAND_PAGE_SIZE_OPTIONS.includes(pageSizeRaw as BrandPageSize)
      ? pageSizeRaw
      : 20
  ) as BrandPageSize;

  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() ? qRaw.trim() : undefined;

  return {
    page,
    pageSize,
    q,
  };
}

function parseBrandInputBase(raw: unknown): BrandCreateInput {
  if (!isRecord(raw)) {
    throw new BrandValidationError("Invalid request body");
  }

  return {
    name: parseRequiredString(raw.name, "name"),
    slug: parseRequiredString(raw.slug, "slug"),
    description: parseOptionalNullableString(raw.description),
    logoMediaId: parseOptionalNullableInteger(raw.logoMediaId, "logoMediaId"),
    showcasePlacement: parseBrandShowcasePlacement(raw.showcasePlacement),
    isProductBrand: parseBooleanField(raw.isProductBrand, "isProductBrand"),
  };
}

export function parseBrandCreateInput(raw: unknown): BrandCreateInput {
  return parseBrandInputBase(raw);
}

export function parseBrandUpdateInput(raw: unknown): BrandUpdateInput {
  return parseBrandInputBase(raw);
}
