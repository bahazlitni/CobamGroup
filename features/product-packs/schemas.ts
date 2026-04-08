import type { ProductPackUpsertInput } from "./types";

export class ProductPackValidationError extends Error {
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
    throw new ProductPackValidationError(`Champ requis: ${fieldName}.`);
  }
  return normalized;
}

export function parseProductPackListQuery(searchParams: URLSearchParams) {
  return {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    pageSize: parsePositiveInteger(searchParams.get("pageSize"), 20),
    q: parseOptionalString(searchParams.get("q")),
  };
}

export function parseProductPackIdParam(value: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ProductPackValidationError("Identifiant de pack invalide.");
  }
  return parsed;
}

export function parseProductPackCreateInput(input: unknown): ProductPackUpsertInput {
  if (!input || typeof input !== "object") {
    throw new ProductPackValidationError("Corps de requête invalide.");
  }

  const record = input as Record<string, unknown>;
  const lines = Array.isArray(record.lines) ? record.lines : [];

  return {
    sku: parseRequiredString(record.sku, "sku"),
    slug: parseRequiredString(record.slug, "slug"),
    name: parseRequiredString(record.name, "name"),
    description: parseOptionalString(record.description),
    descriptionSeo: parseOptionalString(record.descriptionSeo),
    subcategoryIds: (Array.isArray(record.subcategoryIds) ? record.subcategoryIds : []).map((entry) => {
      const parsed = Number(entry);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new ProductPackValidationError("Sous-catégorie de pack invalide.");
      }
      return parsed;
    }),
    media: (Array.isArray(record.media) ? record.media : []).map((entry) => {
      if (!entry || typeof entry !== "object") {
        throw new ProductPackValidationError("Média de pack invalide.");
      }
      const mediaRecord = entry as Record<string, unknown>;
      const parsedId = Number(mediaRecord.id);
      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw new ProductPackValidationError("Identifiant de média invalide.");
      }
      return {
        id: parsedId,
        kind: "kind" in mediaRecord ? String(mediaRecord.kind) as "IMAGE" | "VIDEO" | "DOCUMENT" : "IMAGE",
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
    lines: lines.map((entry) => {
      if (!entry || typeof entry !== "object") {
        throw new ProductPackValidationError("Ligne de pack invalide.");
      }
      const lineRecord = entry as Record<string, unknown>;
      const productId = Number(lineRecord.productId);
      const quantity = Number(lineRecord.quantity);
      if (!Number.isInteger(productId) || productId <= 0) {
        throw new ProductPackValidationError("Produit de pack invalide.");
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new ProductPackValidationError("Quantité de pack invalide.");
      }
      return {
        productId,
        quantity,
      };
    }),
  };
}

export const parseProductPackUpdateInput = parseProductPackCreateInput;
