import {
  ProductCommercialMode,
  ProductLifecycle,
  ProductStockUnit,
} from "@prisma/client";
import {
  buildDuplicateAttributeKindMessage,
  findDuplicateAttributeKind,
} from "@/features/products/attribute-kinds";
import {
  normalizeProductAttributeKind,
} from "@/lib/static_tables/attributes";
import { normalizeProductBrandValue as normalizeProductBrandString } from "@/lib/static_tables/brands";
import type { SingleProductUpsertInput } from "./types";

export class SingleProductsValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function parseOptionalString(value: unknown) {
  if (value == null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

function parseRequiredString(value: unknown, fieldName: string) {
  const normalized = parseOptionalString(value);
  if (!normalized) {
    throw new SingleProductsValidationError(`Champ requis: ${fieldName}.`);
  }
  return normalized;
}

function parseEnumValue<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string,
): T {
  const normalized = parseRequiredString(value, fieldName) as T;
  if (!allowedValues.includes(normalized)) {
    throw new SingleProductsValidationError(`Valeur invalide pour ${fieldName}.`);
  }
  return normalized;
}

function parseBoolean(value: unknown, fieldName: string) {
  if (typeof value === "boolean") {
    return value;
  }

  throw new SingleProductsValidationError(`Valeur booléenne invalide pour ${fieldName}.`);
}

function parseOptionalNumber(value: unknown, fieldName: string) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new SingleProductsValidationError(`Valeur numérique invalide pour ${fieldName}.`);
  }

  return parsed;
}

function parseOptionalIntegerArray(value: unknown, fieldName: string) {
  if (!Array.isArray(value)) {
    throw new SingleProductsValidationError(`Liste invalide pour ${fieldName}.`);
  }

  return value.map((entry) => {
    const parsed = Number(entry);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new SingleProductsValidationError(`Identifiant invalide dans ${fieldName}.`);
    }
    return parsed;
  });
}

export function parseSingleProductIdParam(value: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new SingleProductsValidationError("Identifiant de produit invalide.");
  }
  return parsed;
}

export function parseSingleProductCreateInput(input: unknown): SingleProductUpsertInput {
  if (!input || typeof input !== "object") {
    throw new SingleProductsValidationError("Corps de requête invalide.");
  }

  const record = input as Record<string, unknown>;
  const media = Array.isArray(record.media) ? record.media : [];
  const attributes = Array.isArray(record.attributes) ? record.attributes : [];
  const datasheet =
    record.datasheet != null && typeof record.datasheet === "object"
      ? (record.datasheet as Record<string, unknown>)
      : null;

  const parsedAttributes = attributes.map((entry) => {
    if (!entry || typeof entry !== "object") {
      throw new SingleProductsValidationError("Attribut invalide.");
    }

    const attributeRecord = entry as Record<string, unknown>;
    return {
      kind: normalizeProductAttributeKind(
        parseRequiredString(attributeRecord.kind, "attribute.kind"),
      ),
      value: parseRequiredString(attributeRecord.value, "attribute.value"),
    };
  });

  const duplicateAttributeKind = findDuplicateAttributeKind(parsedAttributes);

  if (duplicateAttributeKind) {
    throw new SingleProductsValidationError(
      buildDuplicateAttributeKindMessage(duplicateAttributeKind, "Un produit"),
    );
  }

  return {
    sku: parseRequiredString(record.sku, "sku"),
    slug: parseRequiredString(record.slug, "slug"),
    name: parseRequiredString(record.name, "name"),
    description: parseOptionalString(record.description),
    descriptionSeo: parseOptionalString(record.descriptionSeo),
    brand:
      record.brand == null || record.brand === ""
        ? null
        : normalizeProductBrandString(String(record.brand)),
    basePriceAmount:
      record.basePriceAmount == null || record.basePriceAmount === ""
        ? null
        : String(record.basePriceAmount),
    vatRate: parseOptionalNumber(record.vatRate, "vatRate"),
    stock: record.stock == null || record.stock === "" ? null : String(record.stock),
    stockUnit:
      record.stockUnit == null || record.stockUnit === ""
        ? null
        : parseEnumValue(record.stockUnit, Object.values(ProductStockUnit), "stockUnit"),
    visibility: parseBoolean(record.visibility, "visibility"),
    priceVisibility: parseBoolean(record.priceVisibility, "priceVisibility"),
    stockVisibility: parseBoolean(record.stockVisibility, "stockVisibility"),
    lifecycle: parseEnumValue(record.lifecycle, Object.values(ProductLifecycle), "lifecycle"),
    commercialMode: parseEnumValue(
      record.commercialMode,
      Object.values(ProductCommercialMode),
      "commercialMode",
    ),
    tags: parseOptionalString(record.tags) ?? "",
    subcategoryIds: parseOptionalIntegerArray(
      Array.isArray(record.subcategoryIds) ? record.subcategoryIds : [],
      "subcategoryIds",
    ),
    datasheet:
      datasheet == null
        ? null
        : (() => {
            const parsedId = Number(datasheet.id);
            if (!Number.isInteger(parsedId) || parsedId <= 0) {
              throw new SingleProductsValidationError(
                "Identifiant de fiche technique invalide.",
              );
            }

            return {
              id: parsedId,
              kind:
                "kind" in datasheet
                  ? (String(datasheet.kind) as SingleProductUpsertInput["media"][number]["kind"])
                  : "DOCUMENT",
              title: parseOptionalString(datasheet.title),
              originalFilename: parseOptionalString(datasheet.originalFilename),
              mimeType: parseOptionalString(datasheet.mimeType),
              altText: parseOptionalString(datasheet.altText),
              widthPx: datasheet.widthPx == null ? null : Number(datasheet.widthPx),
              heightPx: datasheet.heightPx == null ? null : Number(datasheet.heightPx),
              durationSeconds:
                datasheet.durationSeconds == null ? null : String(datasheet.durationSeconds),
              sizeBytes: datasheet.sizeBytes == null ? null : String(datasheet.sizeBytes),
              url: typeof datasheet.url === "string" ? datasheet.url : "",
              thumbnailUrl:
                typeof datasheet.thumbnailUrl === "string" ? datasheet.thumbnailUrl : null,
            };
          })(),
    media: media.map((entry) => {
      if (!entry || typeof entry !== "object") {
        throw new SingleProductsValidationError("Média invalide.");
      }

      const mediaRecord = entry as Record<string, unknown>;
      const parsedId = Number(mediaRecord.id);
      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw new SingleProductsValidationError("Identifiant de média invalide.");
      }

      return {
        id: parsedId,
        kind:
          "kind" in mediaRecord
            ? (String(mediaRecord.kind) as SingleProductUpsertInput["media"][number]["kind"])
            : "IMAGE",
        title: parseOptionalString(mediaRecord.title),
        originalFilename: parseOptionalString(mediaRecord.originalFilename),
        mimeType: parseOptionalString(mediaRecord.mimeType),
        altText: parseOptionalString(mediaRecord.altText),
        widthPx: mediaRecord.widthPx == null ? null : Number(mediaRecord.widthPx),
        heightPx: mediaRecord.heightPx == null ? null : Number(mediaRecord.heightPx),
        durationSeconds:
          mediaRecord.durationSeconds == null ? null : String(mediaRecord.durationSeconds),
        sizeBytes: mediaRecord.sizeBytes == null ? null : String(mediaRecord.sizeBytes),
        url: typeof mediaRecord.url === "string" ? mediaRecord.url : "",
        thumbnailUrl:
          typeof mediaRecord.thumbnailUrl === "string"
            ? mediaRecord.thumbnailUrl
            : null,
      };
    }),
    attributes: parsedAttributes,
  };
}

export const parseSingleProductUpdateInput = parseSingleProductCreateInput;
