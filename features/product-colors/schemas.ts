import type { ProductColorInput } from "./types";

export class ProductColorValidationError extends Error {
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
    throw new ProductColorValidationError(`Champ invalide : ${fieldName}`);
  }

  return value.replace(/\s+/g, " ").trim();
}

function normalizeHexColor(value: string) {
  const normalized = value.trim().toUpperCase();
  const withHash = normalized.startsWith("#") ? normalized : `#${normalized}`;

  if (!/^#[0-9A-F]{6}$/.test(withHash)) {
    throw new ProductColorValidationError("Couleur hexadécimale invalide.");
  }

  return withHash;
}

export function parseProductColorIdParam(idParam: string) {
  const parsed = Number(idParam);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ProductColorValidationError("Identifiant invalide.");
  }

  return parsed;
}

export function parseProductColorInput(raw: unknown): ProductColorInput {
  if (!isRecord(raw)) {
    throw new ProductColorValidationError("Corps de requête invalide.");
  }

  return {
    name: parseRequiredString(raw.name, "name"),
    hexValue: normalizeHexColor(parseRequiredString(raw.hexValue, "hexValue")),
  };
}

export function parseProductColorSuggestQuery(searchParams: URLSearchParams) {
  const q = parseRequiredString(searchParams.get("q"), "q");
  const limitRaw = Number(searchParams.get("limit") ?? "8");
  const limit =
    Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 20) : 8;

  return { q, limit };
}

export function toNormalizedProductColorHex(value: string) {
  return normalizeHexColor(value);
}
