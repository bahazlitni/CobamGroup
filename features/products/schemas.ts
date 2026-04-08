import {
  ProductCommercialMode,
  ProductLifecycle,
  ProductStockUnit,
} from "@prisma/client";
import {
  buildDuplicateAttributeKindMessage,
  findDuplicateAttributeKind,
} from "./attribute-kinds";
import {
  normalizeProductAttributeKind,
} from "@/lib/static_tables/attributes";
import { normalizeProductBrandValue as normalizeProductBrandString } from "@/lib/static_tables/brands";
import type { ProductFamilyUpsertInput, ProductVariantInputDto } from "./types";

export class ProductValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function parsePositiveInteger(value: string | null | undefined, fallback: number) {
  const parsed = value == null ? fallback : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
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
    throw new ProductValidationError(`Champ requis: ${fieldName}.`);
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
    throw new ProductValidationError(`Valeur invalide pour ${fieldName}.`);
  }
  return normalized;
}

function parseBoolean(value: unknown, fieldName: string) {
  if (typeof value === "boolean") {
    return value;
  }

  throw new ProductValidationError(`Valeur booléenne invalide pour ${fieldName}.`);
}

function parseOptionalNumber(value: unknown, fieldName: string) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ProductValidationError(`Valeur numérique invalide pour ${fieldName}.`);
  }

  return parsed;
}

function parseOptionalIntegerArray(value: unknown, fieldName: string) {
  if (!Array.isArray(value)) {
    throw new ProductValidationError(`Liste invalide pour ${fieldName}.`);
  }

  return value.map((entry) => {
    const parsed = Number(entry);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new ProductValidationError(`Identifiant invalide dans ${fieldName}.`);
    }
    return parsed;
  });
}

function parseVariant(input: unknown): ProductVariantInputDto {
  if (!input || typeof input !== "object") {
    throw new ProductValidationError("Variante invalide.");
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
      throw new ProductValidationError("Attribut de variante invalide.");
    }

    const attributeRecord = entry as Record<string, unknown>;
    return {
      kind: normalizeProductAttributeKind(
        parseRequiredString(attributeRecord.kind, "variant.attribute.kind"),
      ),
      value: parseRequiredString(attributeRecord.value, "variant.attribute.value"),
    };
  });

  const duplicateAttributeKind = findDuplicateAttributeKind(parsedAttributes);

  if (duplicateAttributeKind) {
    throw new ProductValidationError(
      buildDuplicateAttributeKindMessage(duplicateAttributeKind, "Une variante"),
    );
  }

  return {
    id:
      record.id == null
        ? undefined
        : (() => {
            const parsed = Number(record.id);
            if (!Number.isInteger(parsed) || parsed <= 0) {
              throw new ProductValidationError("Identifiant de variante invalide.");
            }
            return parsed;
          })(),
    sku: parseRequiredString(record.sku, "variant.sku"),
    slug: parseRequiredString(record.slug, "variant.slug"),
    name: parseRequiredString(record.name, "variant.name"),
    description: parseOptionalString(record.description),
    descriptionSeo: parseOptionalString(record.descriptionSeo),
    brandCode:
      record.brandCode == null || record.brandCode === ""
        ? null
        : normalizeProductBrandString(String(record.brandCode)),
    basePriceAmount:
      record.basePriceAmount == null || record.basePriceAmount === ""
        ? null
        : String(record.basePriceAmount),
    vatRate: parseOptionalNumber(record.vatRate, "variant.vatRate"),
    stock:
      record.stock == null || record.stock === "" ? null : String(record.stock),
    stockUnit:
      record.stockUnit == null || record.stockUnit === ""
        ? null
        : parseEnumValue(
            record.stockUnit,
            Object.values(ProductStockUnit),
            "variant.stockUnit",
          ),
    visibility: parseBoolean(record.visibility, "variant.visibility"),
    priceVisibility: parseBoolean(record.priceVisibility, "variant.priceVisibility"),
    stockVisibility: parseBoolean(record.stockVisibility, "variant.stockVisibility"),
    lifecycle: parseEnumValue(
      record.lifecycle,
      Object.values(ProductLifecycle),
      "variant.lifecycle",
    ),
    commercialMode: parseEnumValue(
      record.commercialMode,
      Object.values(ProductCommercialMode),
      "variant.commercialMode",
    ),
    tags: parseOptionalString(record.tags) ?? "",
    subcategoryIds: parseOptionalIntegerArray(
      Array.isArray(record.subcategoryIds) ? record.subcategoryIds : [],
      "variant.subcategoryIds",
    ),
    datasheet:
      datasheet == null
        ? null
        : (() => {
            const parsedId = Number(datasheet.id);
            if (!Number.isInteger(parsedId) || parsedId <= 0) {
              throw new ProductValidationError(
                "Identifiant de fiche technique invalide.",
              );
            }

            return {
              id: parsedId,
              kind:
                "kind" in datasheet
                  ? (String(datasheet.kind) as ProductVariantInputDto["media"][number]["kind"])
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
    media: media
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          throw new ProductValidationError("Media de variante invalide.");
        }

        const mediaRecord = entry as Record<string, unknown>;
        const parsedId = Number(mediaRecord.id);
        if (!Number.isInteger(parsedId) || parsedId <= 0) {
          throw new ProductValidationError("Identifiant de média invalide.");
        }

        return {
          id: parsedId,
          kind: "kind" in mediaRecord ? String(mediaRecord.kind) as ProductVariantInputDto["media"][number]["kind"] : "IMAGE",
          title: parseOptionalString(mediaRecord.title),
          originalFilename: parseOptionalString(mediaRecord.originalFilename),
          mimeType: parseOptionalString(mediaRecord.mimeType),
          altText: parseOptionalString(mediaRecord.altText),
          widthPx: mediaRecord.widthPx == null ? null : Number(mediaRecord.widthPx),
          heightPx: mediaRecord.heightPx == null ? null : Number(mediaRecord.heightPx),
          durationSeconds: mediaRecord.durationSeconds == null ? null : String(mediaRecord.durationSeconds),
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

export function parseProductListQuery(searchParams: URLSearchParams) {
  return {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    pageSize: parsePositiveInteger(searchParams.get("pageSize"), 20),
    q: parseOptionalString(searchParams.get("q")),
  };
}

export function parseProductIdParam(value: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ProductValidationError("Identifiant de famille invalide.");
  }
  return parsed;
}

export function parseProductCreateInput(input: unknown): ProductFamilyUpsertInput {
  if (!input || typeof input !== "object") {
    throw new ProductValidationError("Corps de requête invalide.");
  }

  const record = input as Record<string, unknown>;
  const variantsInput = Array.isArray(record.variants) ? record.variants : [];

  if (variantsInput.length === 0) {
    throw new ProductValidationError("Une famille doit contenir au moins une variante.");
  }

  const defaultVariantIndex = Number(record.defaultVariantIndex ?? 0);
  if (
    !Number.isInteger(defaultVariantIndex) ||
    defaultVariantIndex < 0 ||
    defaultVariantIndex >= variantsInput.length
  ) {
    throw new ProductValidationError("Variante par défaut invalide.");
  }

  return {
    name: parseRequiredString(record.name, "name"),
    slug: parseRequiredString(record.slug, "slug"),
    subtitle: parseOptionalString(record.subtitle),
    description: parseOptionalString(record.description),
    descriptionSeo: parseOptionalString(record.descriptionSeo),
    mainImageMediaId:
      record.mainImageMediaId == null || record.mainImageMediaId === ""
        ? null
        : parseProductIdParam(String(record.mainImageMediaId)),
    defaultVariantIndex,
    variants: variantsInput.map(parseVariant),
  };
}

export const parseProductUpdateInput = parseProductCreateInput;
