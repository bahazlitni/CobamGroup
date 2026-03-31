import {
  PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS,
  type ProductAttributeDataType,
} from "@/features/products/types";
import type { ProductAttributeMetadataInput } from "./types";

export class ProductAttributeMetadataValidationError extends Error {
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
    throw new ProductAttributeMetadataValidationError(
      `Champ invalide : ${fieldName}`,
    );
  }

  return value.replace(/\s+/g, " ").trim();
}

function parseOptionalString(value: unknown) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new ProductAttributeMetadataValidationError("Champ invalide : unit");
  }

  const normalizedValue = value.replace(/\s+/g, " ").trim();
  return normalizedValue || null;
}

function parseDataType(value: unknown) {
  if (
    typeof value !== "string" ||
    !PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS.includes(
      value as ProductAttributeDataType,
    )
  ) {
    throw new ProductAttributeMetadataValidationError(
      "Champ invalide : dataType",
    );
  }

  return value as ProductAttributeDataType;
}

export function parseProductAttributeMetadataIdParam(idParam: string) {
  const parsed = Number(idParam);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ProductAttributeMetadataValidationError("Identifiant invalide.");
  }

  return parsed;
}

export function parseProductAttributeMetadataInput(
  raw: unknown,
): ProductAttributeMetadataInput {
  if (!isRecord(raw)) {
    throw new ProductAttributeMetadataValidationError("Corps de requête invalide.");
  }

  const dataType = parseDataType(raw.dataType);

  return {
    name: parseRequiredString(raw.name, "name"),
    dataType,
    unit: dataType === "NUMBER" ? parseOptionalString(raw.unit) : null,
  };
}

export function parseProductAttributeMetadataSuggestQuery(
  searchParams: URLSearchParams,
) {
  const q = parseRequiredString(searchParams.get("q"), "q");
  const limitRaw = Number(searchParams.get("limit") ?? "8");
  const limit =
    Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 20) : 8;

  return { q, limit };
}
