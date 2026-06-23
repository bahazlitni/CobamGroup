"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  ProductFamilyDissolveResultDto,
  ProductFamilyDetailDto,
  ProductFamilyGroupingCandidatesResult,
  ProductFamilyGroupingInput,
  ProductFamilyListResult,
  ProductFamilyUpsertInput,
  ProductFormOptionsDto,
} from "./types";

type ApiOk<T> = { ok: true } & T;
type ApiFail = { ok: false; message?: string };

export class ProductsClientError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function unwrapResponse<T>(
  res: Response,
  fallbackMessage: string,
): Promise<T> {
  const payload = await parseJsonSafe<(ApiOk<T> | ApiFail)>(res);

  if (!res.ok || !payload || !("ok" in payload) || !payload.ok) {
    throw new ProductsClientError(
      payload && "message" in payload && payload.message
        ? payload.message
        : fallbackMessage,
      res.status,
    );
  }

  return payload;
}

export async function getProductFormOptionsClient(): Promise<ProductFormOptionsDto> {
  const res = await staffApiFetch("/api/staff/products/options", {
    method: "GET",
    auth: true,
  });
  const payload = await unwrapResponse<{ options: ProductFormOptionsDto }>(
    res,
    "Impossible de charger les options produit.",
  );

  return payload.options;
}

export async function listProductsClient(input: {
  page: number;
  pageSize: number;
  q?: string;
}): Promise<ProductFamilyListResult> {
  const search = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
  });
  if (input.q?.trim()) {
    search.set("q", input.q.trim());
  }

  const res = await staffApiFetch(`/api/staff/products?${search.toString()}`, {
    method: "GET",
    auth: true,
  });
  return unwrapResponse<ProductFamilyListResult>(
    res,
    "Impossible de charger les familles produit.",
  );
}

export async function getProductClient(id: number): Promise<ProductFamilyDetailDto> {
  const res = await staffApiFetch(`/api/staff/products/${id}`, {
    method: "GET",
    auth: true,
  });
  const payload = await unwrapResponse<{ product: ProductFamilyDetailDto }>(
    res,
    "Impossible de charger la famille produit.",
  );

  return payload.product;
}

export async function createProductClient(
  input: ProductFamilyUpsertInput,
): Promise<ProductFamilyDetailDto> {
  const res = await staffApiFetch("/api/staff/products", {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await unwrapResponse<{ product: ProductFamilyDetailDto }>(
    res,
    "Impossible de créer la famille produit.",
  );

  return payload.product;
}

export async function updateProductClient(
  id: number,
  input: ProductFamilyUpsertInput,
): Promise<ProductFamilyDetailDto> {
  const res = await staffApiFetch(`/api/staff/products/${id}`, {
    method: "PUT",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await unwrapResponse<{ product: ProductFamilyDetailDto }>(
    res,
    "Impossible de mettre à jour la famille produit.",
  );

  return payload.product;
}

export async function deleteProductClient(id: number) {
  const res = await staffApiFetch(`/api/staff/products/${id}`, {
    method: "DELETE",
    auth: true,
  });
  await unwrapResponse<Record<string, never>>(
    res,
    "Impossible de supprimer la famille produit.",
  );
}

export async function dissolveProductFamilyClient(
  id: number,
): Promise<ProductFamilyDissolveResultDto> {
  const res = await staffApiFetch(`/api/staff/products/${id}/dissolve`, {
    method: "POST",
    auth: true,
  });
  const payload = await unwrapResponse<{ result: ProductFamilyDissolveResultDto }>(
    res,
    "Impossible de dissoudre la famille produit.",
  );

  return payload.result;
}

export async function listProductFamilyGroupingCandidatesClient(input: {
  page: number;
  pageSize: number;
  q?: string;
  excludeVariants?: boolean;
  ungroupedOnly?: boolean;
  excludedProductIds?: number[];
}): Promise<ProductFamilyGroupingCandidatesResult> {
  const search = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
  });
  if (input.q?.trim()) {
    search.set("q", input.q.trim());
  }
  if (input.excludeVariants != null) {
    search.set("excludeVariants", String(input.excludeVariants));
  }
  if (input.ungroupedOnly != null) {
    search.set("ungroupedOnly", String(input.ungroupedOnly));
  }
  if (input.excludedProductIds && input.excludedProductIds.length > 0) {
    search.set("excludeIds", input.excludedProductIds.join(","));
  }

  const res = await staffApiFetch(`/api/staff/products/grouping?${search.toString()}`, {
    method: "GET",
    auth: true,
  });

  return unwrapResponse<ProductFamilyGroupingCandidatesResult>(
    res,
    "Impossible de charger les produits simples.",
  );
}

export async function groupExistingProductsIntoFamilyClient(
  input: ProductFamilyGroupingInput,
): Promise<ProductFamilyDetailDto> {
  const res = await staffApiFetch("/api/staff/products/grouping", {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await unwrapResponse<{ product: ProductFamilyDetailDto }>(
    res,
    "Impossible de creer la famille depuis des produits existants.",
  );

  return payload.product;
}

export async function updateProductFamiliesBulkClient(input: {
  ids: number[];
  data: Record<string, unknown>;
}) {
  const res = await staffApiFetch("/api/staff/products/bulk", {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return unwrapResponse(res, "Impossible de mettre a jour les familles.");
}

export async function deleteProductFamiliesBulkClient(ids: number[]) {
  const res = await staffApiFetch("/api/staff/products/bulk", {
    method: "DELETE",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });

  return unwrapResponse(res, "Impossible de supprimer les familles.");
}

export async function dissolveProductFamiliesBulkClient(
  ids: number[],
): Promise<ProductFamilyDissolveResultDto[]> {
  const res = await staffApiFetch("/api/staff/products/bulk", {
    method: "PATCH",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });
  const payload = await unwrapResponse<{ results: ProductFamilyDissolveResultDto[] }>(
    res,
    "Impossible de dissoudre les familles.",
  );

  return payload.results;
}
