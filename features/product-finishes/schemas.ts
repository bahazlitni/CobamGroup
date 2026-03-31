import type { ProductFinishInput } from "./types";

export class ProductFinishValidationError extends Error {
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
    throw new ProductFinishValidationError(`Champ invalide : ${fieldName}`);
  }

  return value.replace(/\s+/g, " ").trim();
}

function parseMediaId(value: unknown) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ProductFinishValidationError("Champ invalide : mediaId");
  }

  return parsed;
}

function normalizeHexColor(value: string) {
  const normalized = value.trim().toUpperCase();
  const withHash = normalized.startsWith("#") ? normalized : `#${normalized}`;

  if (!/^#[0-9A-F]{6}$/.test(withHash)) {
    throw new ProductFinishValidationError("Couleur hexadécimale invalide.");
  }

  return withHash;
}

export function parseProductFinishIdParam(idParam: string) {
  const parsed = Number(idParam);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ProductFinishValidationError("Identifiant invalide.");
  }

  return parsed;
}

export function parseProductFinishInput(raw: unknown): ProductFinishInput {
  if (!isRecord(raw)) {
    throw new ProductFinishValidationError("Corps de requête invalide.");
  }

  return {
    name: parseRequiredString(raw.name, "name"),
    colorHex: normalizeHexColor(parseRequiredString(raw.colorHex, "colorHex")),
    mediaId: parseMediaId(raw.mediaId),
  };
}

export function parseProductFinishSuggestQuery(searchParams: URLSearchParams) {
  const q = parseRequiredString(searchParams.get("q"), "q");
  const limitRaw = Number(searchParams.get("limit") ?? "8");
  const limit =
    Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 20) : 8;

  return { q, limit };
}

export function toNormalizedProductFinishHex(value: string) {
  return normalizeHexColor(value);
}
