import type { AnnuaireListQuery, AnnuairePersonInput } from "./types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

export class AnnuaireValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeText(value: unknown, maxLength: number, fieldLabel: string) {
  if (value == null) return undefined;
  if (typeof value !== "string") {
    throw new AnnuaireValidationError(`${fieldLabel} invalide.`);
  }

  return value.trim().slice(0, maxLength);
}

function parseOptionalEmail(value: unknown) {
  const email = normalizeText(value, 255, "Adresse email");
  if (!email) return email;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AnnuaireValidationError("Adresse email invalide.");
  }

  return email;
}

export function parseAnnuaireIdParam(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AnnuaireValidationError("Identifiant annuaire invalide.");
  }

  return parsed;
}

export function parseAnnuaireListQuery(params: URLSearchParams): AnnuaireListQuery {
  const page = parsePositiveInteger(params.get("page"), DEFAULT_PAGE);
  const rawPageSize = parsePositiveInteger(
    params.get("pageSize"),
    DEFAULT_PAGE_SIZE,
  );

  return {
    q: params.get("q")?.trim() ?? "",
    page,
    pageSize: Math.min(rawPageSize, MAX_PAGE_SIZE),
  };
}

export function parseAnnuairePersonInput(raw: unknown): AnnuairePersonInput {
  if (!raw || typeof raw !== "object") {
    throw new AnnuaireValidationError("Donnees annuaire invalides.");
  }

  const record = raw as Record<string, unknown>;
  const input: AnnuairePersonInput = {};

  if ("lastName" in record) {
    input.lastName = normalizeText(record.lastName, 150, "Nom");
  }
  if ("firstName" in record) {
    input.firstName = normalizeText(record.firstName, 150, "Prenom");
  }
  if ("jobTitle" in record) {
    input.jobTitle = normalizeText(record.jobTitle, 200, "Poste");
  }
  if ("email" in record) {
    input.email = parseOptionalEmail(record.email);
  }
  if ("site" in record) {
    input.site = normalizeText(record.site, 200, "Site");
  }
  if ("extension" in record) {
    input.extension = normalizeText(record.extension, 80, "Extension");
  }
  if ("whatsapp" in record) {
    input.whatsapp = normalizeText(record.whatsapp, 80, "WhatsApp");
  }
  if ("sortOrder" in record) {
    const parsed = Number(record.sortOrder);
    if (!Number.isInteger(parsed) || parsed < 0) {
      throw new AnnuaireValidationError("Ordre invalide.");
    }
    input.sortOrder = parsed;
  }

  return input;
}
