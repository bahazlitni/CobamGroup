import { ProductLifecycle } from "@prisma/client";

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
  return {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    pageSize: parsePositiveInteger(searchParams.get("pageSize"), 20),
    q: parseOptionalString(searchParams.get("q")),
  };
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
