import { ProductLifecycle } from "@prisma/client";
import {
  ALL_PRODUCTS_EXPORT_FORMATS,
  ALL_PRODUCTS_EXPORT_MODES,
  type AllProductsExportFormat,
  type AllProductsExportMode,
} from "./types";

export class AllProductsValidationError extends Error {
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

function parseOptionalString(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function parseAllProductsListQuery(searchParams: URLSearchParams) {
  const kindRaw = parseOptionalString(searchParams.get("kind"));
  const kind = kindRaw === "ALL" ? null : kindRaw;

  return {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    pageSize: parsePositiveInteger(searchParams.get("pageSize"), 20),
    q: parseOptionalString(searchParams.get("q")),
    kind: kind ?? null,
  };
}

export function parseAllProductsExportMode(
  value: string | null | undefined,
): AllProductsExportMode {
  const mode = value?.trim().toLowerCase();

  if (
    !mode ||
    !ALL_PRODUCTS_EXPORT_MODES.includes(mode as AllProductsExportMode)
  ) {
    throw new AllProductsValidationError("Mode d'export invalide.", 400);
  }

  return mode as AllProductsExportMode;
}

function parseAllProductsExportFormat(
  value: string | null | undefined,
  mode: AllProductsExportMode,
): AllProductsExportFormat {
  const format = value?.trim().toLowerCase();

  if (!format) {
    return mode === "super" ? "csv" : "pdf";
  }

  if (!ALL_PRODUCTS_EXPORT_FORMATS.includes(format as AllProductsExportFormat)) {
    throw new AllProductsValidationError("Format d'export invalide.", 400);
  }

  if (mode === "super" && format === "pdf") {
    throw new AllProductsValidationError(
      "L'export Super est disponible uniquement en CSV.",
      400,
    );
  }

  return format as AllProductsExportFormat;
}

export function parseAllProductsExportQuery(searchParams: URLSearchParams) {
  const mode = parseAllProductsExportMode(searchParams.get("mode"));
  const format = parseAllProductsExportFormat(searchParams.get("format"), mode);

  return { mode, format };
}

export function parseAllProductIdParam(value: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AllProductsValidationError("Identifiant produit invalide.", 400);
  }

  return parsed;
}

export function parseAllProductLifecycleInput(input: unknown): ProductLifecycle {
  if (
    !input ||
    typeof input !== "object" ||
    !("lifecycle" in input) ||
    (input as { lifecycle?: unknown }).lifecycle == null
  ) {
    throw new AllProductsValidationError("Cycle de vie invalide.", 400);
  }

  const lifecycle = String((input as { lifecycle: unknown }).lifecycle);

  if (lifecycle !== ProductLifecycle.ACTIVE && lifecycle !== ProductLifecycle.DRAFT) {
    throw new AllProductsValidationError("Cycle de vie invalide.", 400);
  }

  return lifecycle;
}
