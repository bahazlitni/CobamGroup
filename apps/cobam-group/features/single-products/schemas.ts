import { ProductTypeAttributeInputType } from "@prisma/client";
import {
  buildDuplicateAttributeKindMessage,
  findDuplicateAttributeKind,
} from "@/features/products/attribute-kinds";
import { normalizeProductAttributeKind } from "@/features/products/attribute-definitions";
import { DESCRIPTION_SEO_MAX_LENGTH } from "@/lib/seo-description";
import { PRODUCT_LIFECYCLE_VALUES } from "@/features/products/lifecycle";
import {
  PRODUCT_AVAILABILITY_VALUES,
  PRODUCT_INVENTORY_VISIBILITY_VALUES,
  PRODUCT_PRICING_VISIBILITY_VALUES,
  STOCK_UNIT_VALUES,
} from "@/features/products/product-edit-fields";
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

function parseOptionalDescriptionSeo(value: unknown, fieldName: string) {
  const normalized = parseOptionalString(value);
  if (normalized && normalized.length > DESCRIPTION_SEO_MAX_LENGTH) {
    throw new SingleProductsValidationError(
      `${fieldName} ne doit pas depasser ${DESCRIPTION_SEO_MAX_LENGTH} caracteres.`,
    );
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

function parseOptionalLimitedString(value: unknown, fieldName: string, maxLength: number) {
  const normalized = parseOptionalString(value);
  if (normalized && normalized.length > maxLength) {
    throw new SingleProductsValidationError(
      `${fieldName} ne doit pas depasser ${maxLength} caracteres.`,
    );
  }
  return normalized;
}

function parseRequiredLimitedString(value: unknown, fieldName: string, maxLength: number) {
  const normalized = parseRequiredString(value, fieldName);
  if (normalized.length > maxLength) {
    throw new SingleProductsValidationError(
      `${fieldName} ne doit pas depasser ${maxLength} caracteres.`,
    );
  }
  return normalized;
}

function parseNonNegativeInteger(value: unknown, fieldName: string, fallback = 0) {
  if (value == null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new SingleProductsValidationError(`Valeur invalide pour ${fieldName}.`);
  }
  return parsed;
}

function parseDecimalString(value: unknown, fieldName: string, fallback: string | null) {
  if (value == null || value === "") {
    return fallback;
  }

  const normalized = String(value).trim().replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new SingleProductsValidationError(`Valeur invalide pour ${fieldName}.`);
  }
  return normalized;
}

function parseOptionalPositiveInteger(value: unknown, fieldName: string) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new SingleProductsValidationError(`Identifiant invalide pour ${fieldName}.`);
  }
  return parsed;
}

function parseOptionalInteger(value: unknown, fieldName: string, fallback = 0) {
  if (value == null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new SingleProductsValidationError(`Valeur invalide pour ${fieldName}.`);
  }
  return parsed;
}

function parseOptionalBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  if (value == null || value === "") {
    return fallback;
  }
  return String(value).toLowerCase() === "true";
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
  const certificate =
    record.certificate != null && typeof record.certificate === "object"
      ? (record.certificate as Record<string, unknown>)
      : null;
  if (
    datasheet != null &&
    certificate != null &&
    Number(datasheet.id) === Number(certificate.id)
  ) {
    throw new SingleProductsValidationError(
      "La fiche technique et le certificat doivent utiliser deux fichiers differents.",
    );
  }

  const parsedAttributes = attributes.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new SingleProductsValidationError("Attribut invalide.");
    }

    const attributeRecord = entry as Record<string, unknown>;
    const name = normalizeProductAttributeKind(
      parseRequiredString(attributeRecord.name ?? attributeRecord.kind, "attribute.name"),
    );
    const inputType =
      attributeRecord.inputType == null || attributeRecord.inputType === ""
        ? undefined
        : parseEnumValue(
            attributeRecord.inputType,
            Object.values(ProductTypeAttributeInputType),
            "attribute.inputType",
          );

    return {
      id: parseOptionalPositiveInteger(attributeRecord.id, "attribute.id") ?? undefined,
      attributeDefId: parseOptionalPositiveInteger(
        attributeRecord.attributeDefId,
        "attribute.attributeDefId",
      ),
      attributeGroupId: parseOptionalPositiveInteger(
        attributeRecord.attributeGroupId,
        "attribute.attributeGroupId",
      ),
      kind: name,
      name,
      label: parseOptionalString(attributeRecord.label) ?? name,
      value: parseOptionalString(attributeRecord.value) ?? "",
      unit: parseOptionalString(attributeRecord.unit),
      inputType,
      isRequired: parseOptionalBoolean(attributeRecord.isRequired),
      isFilterable: parseOptionalBoolean(attributeRecord.isFilterable),
      groupName: parseOptionalString(attributeRecord.groupName),
      groupSortOrder: parseOptionalInteger(
        attributeRecord.groupSortOrder,
        "attribute.groupSortOrder",
      ),
      sortOrder: parseOptionalInteger(attributeRecord.sortOrder, "attribute.sortOrder", index),
    };
  });

  const duplicateAttributeKind = findDuplicateAttributeKind(parsedAttributes);

  if (duplicateAttributeKind) {
    throw new SingleProductsValidationError(
      buildDuplicateAttributeKindMessage(duplicateAttributeKind, "Un produit"),
    );
  }

  const name = parseRequiredString(record.name, "name");
  const lifecycle = parseEnumValue(
    record.lifecycle ?? "DRAFT",
    PRODUCT_LIFECYCLE_VALUES,
    "lifecycle",
  );
  const defaultVisible = lifecycle !== "DRAFT";

  return {
    productTypeId: parseOptionalPositiveInteger(record.productTypeId, "productTypeId"),
    sku: parseRequiredString(record.sku, "sku"),
    slug: parseRequiredString(record.slug, "slug"),
    name,
    displayName: parseRequiredLimitedString(record.displayName ?? name, "displayName", 255),
    description: parseOptionalString(record.description),
    shortDescription: parseOptionalLimitedString(record.shortDescription, "shortDescription", 500),
    titleSeo: parseOptionalLimitedString(record.titleSeo, "titleSeo", 60),
    descriptionSeo: parseOptionalDescriptionSeo(record.descriptionSeo, "descriptionSeo"),
    guaranteeMonths: parseNonNegativeInteger(record.guaranteeMonths, "guaranteeMonths"),
    brand: parseOptionalString(record.brand),
    lifecycle,
    visibleEcommerce: parseOptionalBoolean(record.visibleEcommerce, defaultVisible),
    visibleVitrine: parseOptionalBoolean(record.visibleVitrine, defaultVisible),
    isFeatured: parseOptionalBoolean(record.isFeatured),
    isPromoted: parseOptionalBoolean(record.isPromoted),
    isNew: parseOptionalBoolean(record.isNew),
    stockAvailable: parseDecimalString(record.stockAvailable, "stockAvailable", "0") ?? "0",
    stockAlertThreshold:
      parseDecimalString(record.stockAlertThreshold, "stockAlertThreshold", "0") ?? "0",
    stockUnit: parseEnumValue(record.stockUnit ?? "PIECE", STOCK_UNIT_VALUES, "stockUnit"),
    stockAvailability: parseEnumValue(
      record.stockAvailability ?? "IN_STOCK",
      PRODUCT_AVAILABILITY_VALUES,
      "stockAvailability",
    ),
    stockVisibility: parseEnumValue(
      record.stockVisibility ?? "AUTO",
      PRODUCT_INVENTORY_VISIBILITY_VALUES,
      "stockVisibility",
    ),
    basePriceTtcTnd: parseDecimalString(record.basePriceTtcTnd, "basePriceTtcTnd", null),
    currentPriceTtcTnd: parseDecimalString(record.currentPriceTtcTnd, "currentPriceTtcTnd", null),
    vatRate: parseDecimalString(record.vatRate, "vatRate", "19.000") ?? "19.000",
    priceVisibility: parseEnumValue(
      record.priceVisibility ?? "AUTO",
      PRODUCT_PRICING_VISIBILITY_VALUES,
      "priceVisibility",
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
              throw new SingleProductsValidationError("Identifiant de fiche technique invalide.");
            }

            return {
              id: parsedId,
              role: "TECHNICAL",
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
    certificate:
      certificate == null
        ? null
        : (() => {
            const parsedId = Number(certificate.id);
            if (!Number.isInteger(parsedId) || parsedId <= 0) {
              throw new SingleProductsValidationError("Identifiant de certificat invalide.");
            }

            return {
              id: parsedId,
              role: "CERTIFICATE",
              kind:
                "kind" in certificate
                  ? (String(certificate.kind) as SingleProductUpsertInput["media"][number]["kind"])
                  : "DOCUMENT",
              title: parseOptionalString(certificate.title),
              originalFilename: parseOptionalString(certificate.originalFilename),
              mimeType: parseOptionalString(certificate.mimeType),
              altText: parseOptionalString(certificate.altText),
              widthPx: certificate.widthPx == null ? null : Number(certificate.widthPx),
              heightPx: certificate.heightPx == null ? null : Number(certificate.heightPx),
              durationSeconds:
                certificate.durationSeconds == null ? null : String(certificate.durationSeconds),
              sizeBytes: certificate.sizeBytes == null ? null : String(certificate.sizeBytes),
              url: typeof certificate.url === "string" ? certificate.url : "",
              thumbnailUrl:
                typeof certificate.thumbnailUrl === "string" ? certificate.thumbnailUrl : null,
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
        role: "GALLERY",
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
          typeof mediaRecord.thumbnailUrl === "string" ? mediaRecord.thumbnailUrl : null,
      };
    }),
    attributes: parsedAttributes,
  };
}

export const parseSingleProductUpdateInput = parseSingleProductCreateInput;
