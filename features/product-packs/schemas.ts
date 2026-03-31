import { PRODUCT_PAGE_SIZE_OPTIONS, type ProductPageSize } from "@/features/products/types";
import type {
  ProductPackCreateInput,
  ProductPackLineInput,
  ProductPackListQuery,
  ProductPackUpdateInput,
  ProductPackVariantSearchQuery,
} from "./types";

export class ProductPackValidationError extends Error {
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
    throw new ProductPackValidationError(`Missing or invalid field "${fieldName}"`);
  }

  return value.trim();
}

function parseOptionalString(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ProductPackValidationError("Invalid optional string field");
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parsePositiveInteger(value: unknown, fieldName: string): number {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ProductPackValidationError(`Invalid ${fieldName}`);
  }

  return parsed;
}

function parseNonNegativeInteger(value: unknown, fieldName: string): number {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new ProductPackValidationError(`Invalid ${fieldName}`);
  }

  return parsed;
}

function parseOptionalId(value: unknown, fieldName: string) {
  if (value == null || value === "") {
    return null;
  }

  return parsePositiveInteger(value, fieldName);
}

function parseOptionalPositiveIntegerCollection(value: unknown, fieldName: string): number[] {
  if (value == null || value === "") {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ProductPackValidationError(`Invalid ${fieldName}`);
  }

  return Array.from(
    new Set(value.map((item, index) => parsePositiveInteger(item, `${fieldName}[${index}]`))),
  );
}

function parseProductPackLineInput(raw: unknown, index: number): ProductPackLineInput {
  if (!isRecord(raw)) {
    throw new ProductPackValidationError(`Invalid lines[${index}]`);
  }

  return {
    productVariantId: parsePositiveInteger(
      raw.productVariantId,
      `lines[${index}].productVariantId`,
    ),
    quantity: parsePositiveInteger(raw.quantity ?? 1, `lines[${index}].quantity`),
    sortOrder:
      raw.sortOrder == null ? index : parseNonNegativeInteger(raw.sortOrder, `lines[${index}].sortOrder`),
  };
}

function parseLines(value: unknown): ProductPackLineInput[] {
  if (!Array.isArray(value)) {
    throw new ProductPackValidationError("Invalid lines");
  }

  return value.map((item, index) => parseProductPackLineInput(item, index));
}

function parseProductPackInputBase(raw: unknown): ProductPackCreateInput {
  if (!isRecord(raw)) {
    throw new ProductPackValidationError("Invalid request body");
  }

  return {
    name: parseRequiredString(raw.name, "name"),
    subtitle: parseOptionalString(raw.subtitle),
    description: parseOptionalString(raw.description),
    descriptionSeo: parseOptionalString(raw.descriptionSeo),
    mainImageMediaId: parseOptionalId(raw.mainImageMediaId, "mainImageMediaId"),
    mediaIds: parseOptionalPositiveIntegerCollection(raw.mediaIds, "mediaIds"),
    lines: parseLines(raw.lines),
  };
}

export function parseProductPackIdParam(idParam: string): number {
  return parsePositiveInteger(idParam, "id");
}

export function parseProductPackListQuery(searchParams: URLSearchParams): ProductPackListQuery {
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const pageSizeRaw = Number(searchParams.get("pageSize") ?? "20");
  const pageSize = (
    PRODUCT_PAGE_SIZE_OPTIONS.includes(pageSizeRaw as ProductPageSize) ? pageSizeRaw : 20
  ) as ProductPageSize;

  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() ? qRaw.trim() : undefined;

  return {
    page,
    pageSize,
    q,
  };
}

export function parseProductPackVariantSearchQuery(
  searchParams: URLSearchParams,
): ProductPackVariantSearchQuery {
  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() ? qRaw.trim() : undefined;
  const limitRaw = Number(searchParams.get("limit") ?? "50");
  const limit = Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 50;

  return {
    q,
    limit,
  };
}

export function parseProductPackCreateInput(raw: unknown): ProductPackCreateInput {
  return parseProductPackInputBase(raw);
}

export function parseProductPackUpdateInput(raw: unknown): ProductPackUpdateInput {
  return parseProductPackInputBase(raw);
}
