import {
  PRODUCT_PAGE_SIZE_OPTIONS,
  type ProductCreateInput,
  type ProductListQuery,
  type ProductPageSize,
  type ProductUpdateInput,
} from "./types";

export class ProductValidationError extends Error {
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
    throw new ProductValidationError(
      `Missing or invalid field "${fieldName}"`,
    );
  }

  return value.trim();
}

function parseOptionalString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") {
    throw new ProductValidationError("Invalid optional string field");
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parsePositiveInteger(value: unknown, fieldName: string): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ProductValidationError(`Invalid ${fieldName}`);
  }

  return parsed;
}

function parseBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;

  throw new ProductValidationError(`Invalid ${fieldName}`);
}

function parseStringArray(value: unknown, fieldName: string): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new ProductValidationError(`Invalid ${fieldName}`);
  }

  return Array.from(
    new Set(
      value.map((item) => {
        if (typeof item !== "string") {
          throw new ProductValidationError(`Invalid ${fieldName}`);
        }

        const normalized = item.replace(/\s+/g, " ").trim();

        if (!normalized) {
          throw new ProductValidationError(`Invalid ${fieldName}`);
        }

        return normalized;
      }),
    ),
  );
}

function parseOptionalQueryInteger(value: string | null, fieldName: string) {
  if (!value?.trim()) return undefined;
  return parsePositiveInteger(value, fieldName);
}

export function parseProductIdParam(idParam: string): number {
  return parsePositiveInteger(idParam, "id");
}

export function parseProductListQuery(
  searchParams: URLSearchParams,
): ProductListQuery {
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const pageSizeRaw = Number(searchParams.get("pageSize") ?? "20");
  const pageSize = (
    PRODUCT_PAGE_SIZE_OPTIONS.includes(pageSizeRaw as ProductPageSize)
      ? pageSizeRaw
      : 20
  ) as ProductPageSize;

  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() ? qRaw.trim() : undefined;

  return {
    page,
    pageSize,
    q,
    brandId: parseOptionalQueryInteger(searchParams.get("brandId"), "brandId"),
    productCategoryId: parseOptionalQueryInteger(
      searchParams.get("productCategoryId"),
      "productCategoryId",
    ),
  };
}

function parseProductInputBase(raw: unknown): ProductCreateInput {
  if (!isRecord(raw)) {
    throw new ProductValidationError("Invalid request body");
  }

  return {
    brandId: parsePositiveInteger(raw.brandId, "brandId"),
    productCategoryId: parsePositiveInteger(
      raw.productCategoryId,
      "productCategoryId",
    ),
    baseName: parseRequiredString(raw.baseName, "baseName"),
    baseSlug: parseRequiredString(raw.baseSlug, "baseSlug"),
    description: parseOptionalString(raw.description),
    descriptionSeo: parseOptionalString(raw.descriptionSeo),
    isActive: parseBoolean(raw.isActive, "isActive"),
    tagNames: parseStringArray(raw.tagNames, "tagNames"),
  };
}

export function parseProductCreateInput(raw: unknown): ProductCreateInput {
  return parseProductInputBase(raw);
}

export function parseProductUpdateInput(raw: unknown): ProductUpdateInput {
  return parseProductInputBase(raw);
}
