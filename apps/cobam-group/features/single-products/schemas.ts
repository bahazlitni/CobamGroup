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

function parseRequiredPositiveInteger(value: unknown, fieldName: string) {
  const parsed = parseOptionalPositiveInteger(value, fieldName);
  if (parsed == null) {
    throw new SingleProductsValidationError(`Champ requis: ${fieldName}.`);
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

function parseMediaEntry(
  entry: unknown,
  role: SingleProductUpsertInput["media"][number]["role"],
  fieldName: string,
  fallbackKind: SingleProductUpsertInput["media"][number]["kind"],
  sortOrder: number,
) {
  if (!entry || typeof entry !== "object") {
    throw new SingleProductsValidationError(`${fieldName} invalide.`);
  }

  const mediaRecord = entry as Record<string, unknown>;
  const parsedId = Number(mediaRecord.id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new SingleProductsValidationError(`Identifiant de ${fieldName.toLowerCase()} invalide.`);
  }

  return {
    id: parsedId,
    role,
    kind:
      "kind" in mediaRecord
        ? (String(mediaRecord.kind) as SingleProductUpsertInput["media"][number]["kind"])
        : fallbackKind,
    title: parseOptionalString(mediaRecord.title),
    originalFilename: parseOptionalString(mediaRecord.originalFilename),
    mimeType: parseOptionalString(mediaRecord.mimeType),
    altText: parseOptionalString(mediaRecord.altText),
    sortOrder,
    widthPx: mediaRecord.widthPx == null ? null : Number(mediaRecord.widthPx),
    heightPx: mediaRecord.heightPx == null ? null : Number(mediaRecord.heightPx),
    durationSeconds:
      mediaRecord.durationSeconds == null ? null : String(mediaRecord.durationSeconds),
    sizeBytes: mediaRecord.sizeBytes == null ? null : String(mediaRecord.sizeBytes),
    url: typeof mediaRecord.url === "string" ? mediaRecord.url : "",
    thumbnailUrl: typeof mediaRecord.thumbnailUrl === "string" ? mediaRecord.thumbnailUrl : null,
  };
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
    throw new SingleProductsValidationError("Corps de requete invalide.");
  }

  const record = input as Record<string, unknown>;
  const media = Array.isArray(record.media) ? record.media : [];
  const attributes = Array.isArray(record.attributes) ? record.attributes : [];
  const datasheets = Array.isArray(record.datasheets)
    ? record.datasheets
    : record.datasheet != null
      ? [record.datasheet]
      : [];
  const certificates = Array.isArray(record.certificates)
    ? record.certificates
    : record.certificate != null
      ? [record.certificate]
      : [];

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
  const defaultVisible = lifecycle === "ACTIVE";
  const visibleEcommerce = parseOptionalBoolean(record.visibleEcommerce, defaultVisible);
  const visibleVitrine = parseOptionalBoolean(record.visibleVitrine, defaultVisible);

  const parsedProduct: SingleProductUpsertInput = {
    productTypeId: parseRequiredPositiveInteger(record.productTypeId, "productTypeId"),
    sku: parseRequiredString(record.sku, "sku"),
    slug: parseRequiredString(record.slug, "slug"),
    name,
    displayName: parseRequiredLimitedString(record.displayName ?? name, "displayName", 255),
    description: parseOptionalString(record.description),
    titleSeo: parseOptionalLimitedString(record.titleSeo, "titleSeo", 60),
    descriptionSeo: parseOptionalDescriptionSeo(record.descriptionSeo, "descriptionSeo"),
    guaranteeMonths: parseNonNegativeInteger(record.guaranteeMonths, "guaranteeMonths"),
    brand: parseOptionalString(record.brand),
    lifecycle,
    visibleEcommerce: defaultVisible ? visibleEcommerce : false,
    visibleVitrine: defaultVisible ? visibleVitrine : false,
    isFeatured: parseOptionalBoolean(record.isFeatured),
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
    datasheets: datasheets.map((entry, index) =>
      parseMediaEntry(entry, "TECHNICAL", "Fiche technique", "DOCUMENT", index),
    ),
    certificates: certificates.map((entry, index) =>
      parseMediaEntry(entry, "CERTIFICATE", "Certificat", "DOCUMENT", index),
    ),
    certificateIds: [
      ...new Set(
        parseOptionalIntegerArray(
          Array.isArray(record.certificateIds) ? record.certificateIds : [],
          "certificateIds",
        ),
      ),
    ],
    media: media.map((entry, index) => parseMediaEntry(entry, "GALLERY", "Media", "IMAGE", index)),
    attributes: parsedAttributes,
  };

  const mediaIds = [
    ...parsedProduct.media.map((entry) => entry.id),
    ...parsedProduct.datasheets.map((entry) => entry.id),
    ...parsedProduct.certificates.map((entry) => entry.id),
  ];
  if (new Set(mediaIds).size !== mediaIds.length) {
    throw new SingleProductsValidationError(
      "Un meme media ne peut pas etre utilise plusieurs fois sur le meme produit.",
    );
  }

  return parsedProduct;
}

export const parseSingleProductUpdateInput = parseSingleProductCreateInput;
