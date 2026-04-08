"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  ProductFamilyDetailDto,
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
