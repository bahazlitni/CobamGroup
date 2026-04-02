import {
  PRODUCT_COMMERCIAL_MODE_OPTIONS,
  PRODUCT_LIFECYCLE_STATUS_OPTIONS,
  PRODUCT_PRICE_VISIBILITY_OPTIONS,
  PRODUCT_VISIBILITY_OPTIONS,
} from "@/features/products/types";
import {
  PRODUCT_PACK_OVERRIDE_MODE_OPTIONS,
  PRODUCT_PACK_PAGE_SIZE_OPTIONS,
  type ProductPackCreateInput,
  type ProductPackLineInput,
  type ProductPackListQuery,
  type ProductPackOverrideMode,
  type ProductPackPageSize,
  type ProductPackUpdateInput,
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

function parseRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ProductPackValidationError(`Missing or invalid field "${fieldName}"`);
  }

  return value.trim();
}

function parseOptionalString(value: unknown) {
  if (value == null) return null;
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

function parsePositiveIntegerArray(value: unknown, fieldName: string): number[] {
  if (!Array.isArray(value)) {
    throw new ProductPackValidationError(`Invalid ${fieldName}`);
  }

  const parsed = Array.from(
    new Set(value.map((item, index) => parsePositiveInteger(item, `${fieldName}[${index}]`))),
  );

  if (parsed.length === 0) {
    throw new ProductPackValidationError(`Missing ${fieldName}`);
  }

  return parsed;
}

function parseOptionalPositiveIntegerCollection(
  value: unknown,
  arrayFieldName: string,
  singleFieldName = arrayFieldName,
): number[] {
  if (value == null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [];
    }

    return parsePositiveIntegerArray(value, arrayFieldName);
  }

  return [parsePositiveInteger(value, singleFieldName)];
}

function parseOptionalId(value: unknown, fieldName: string) {
  if (value == null || value === "") {
    return null;
  }

  return parsePositiveInteger(value, fieldName);
}

function parseEnumValue<T extends readonly string[]>(
  value: unknown,
  options: T,
  fieldName: string,
): T[number] {
  if (typeof value !== "string" || !options.includes(value)) {
    throw new ProductPackValidationError(`Invalid ${fieldName}`);
  }

  return value as T[number];
}

function parseOptionalEnumValue<T extends readonly string[]>(
  value: unknown,
  options: T,
  fieldName: string,
): T[number] | null {
  if (value == null || value === "") {
    return null;
  }

  return parseEnumValue(value, options, fieldName);
}

function parsePackLine(raw: unknown, index: number): ProductPackLineInput {
  if (!isRecord(raw)) {
    throw new ProductPackValidationError(`Invalid lines[${index}]`);
  }

  return {
    variantId: parsePositiveInteger(raw.variantId, `lines[${index}].variantId`),
    quantity: parsePositiveInteger(raw.quantity ?? 1, `lines[${index}].quantity`),
    sortOrder: parseNonNegativeInteger(raw.sortOrder ?? index, `lines[${index}].sortOrder`),
  };
}

function parsePackLines(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ProductPackValidationError("Missing lines");
  }

  return value.map((item, index) => parsePackLine(item, index));
}

function parseProductPackInputBase(raw: unknown): ProductPackCreateInput {
  if (!isRecord(raw)) {
    throw new ProductPackValidationError("Invalid request body");
  }

  return {
    name: parseRequiredString(raw.name, "name"),
    sku: parseRequiredString(raw.sku, "sku"),
    description: parseOptionalString(raw.description),
    descriptionSeo: parseOptionalString(raw.descriptionSeo),
    productSubcategoryIds: parsePositiveIntegerArray(
      raw.productSubcategoryIds,
      "productSubcategoryIds",
    ),
    commercialMode: parseEnumValue(
      raw.commercialMode,
      PRODUCT_COMMERCIAL_MODE_OPTIONS,
      "commercialMode",
    ),
    lifecycleStatusMode: parseEnumValue(
      raw.lifecycleStatusMode ?? "AUTO",
      PRODUCT_PACK_OVERRIDE_MODE_OPTIONS,
      "lifecycleStatusMode",
    ) as ProductPackOverrideMode,
    manualLifecycleStatus: parseOptionalEnumValue(
      raw.manualLifecycleStatus,
      PRODUCT_LIFECYCLE_STATUS_OPTIONS,
      "manualLifecycleStatus",
    ),
    visibilityMode: parseEnumValue(
      raw.visibilityMode ?? "AUTO",
      PRODUCT_PACK_OVERRIDE_MODE_OPTIONS,
      "visibilityMode",
    ) as ProductPackOverrideMode,
    manualVisibility: parseOptionalEnumValue(
      raw.manualVisibility,
      PRODUCT_VISIBILITY_OPTIONS,
      "manualVisibility",
    ),
    priceVisibilityMode: parseEnumValue(
      raw.priceVisibilityMode ?? "AUTO",
      PRODUCT_PACK_OVERRIDE_MODE_OPTIONS,
      "priceVisibilityMode",
    ) as ProductPackOverrideMode,
    manualPriceVisibility: parseOptionalEnumValue(
      raw.manualPriceVisibility,
      PRODUCT_PRICE_VISIBILITY_OPTIONS,
      "manualPriceVisibility",
    ),
    mainImageMediaId: parseOptionalId(raw.mainImageMediaId, "mainImageMediaId"),
    mediaIds: parseOptionalPositiveIntegerCollection(raw.mediaIds, "mediaIds"),
    lines: parsePackLines(raw.lines),
  };
}

export function parseProductPackCreateInput(raw: unknown): ProductPackCreateInput {
  return parseProductPackInputBase(raw);
}

export function parseProductPackUpdateInput(raw: unknown): ProductPackUpdateInput {
  return parseProductPackInputBase(raw);
}

export function parseProductPackIdParam(idParam: string) {
  return parsePositiveInteger(idParam, "id");
}

export function parseProductPackListQuery(searchParams: URLSearchParams): ProductPackListQuery {
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const pageSizeRaw = Number(searchParams.get("pageSize") ?? "20");
  const pageSize = (
    PRODUCT_PACK_PAGE_SIZE_OPTIONS.includes(pageSizeRaw as ProductPackPageSize)
      ? pageSizeRaw
      : 20
  ) as ProductPackPageSize;

  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() ? qRaw.trim() : undefined;

  return {
    page,
    pageSize,
    q,
  };
}
