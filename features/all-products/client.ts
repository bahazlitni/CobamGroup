"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type { AllProductsListItemDto, AllProductsListResult } from "./types";

type ApiOk<T> = { ok: true } & T;
type ApiFail = { ok: false; message?: string };

export class AllProductsClientError extends Error {
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

async function unwrapResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const payload = await parseJsonSafe<ApiOk<T> | ApiFail>(res);

  if (!res.ok || !payload || !("ok" in payload) || !payload.ok) {
    throw new AllProductsClientError(
      payload && "message" in payload && payload.message
        ? payload.message
        : fallbackMessage,
      res.status,
    );
  }

  return payload;
}

export async function listAllProductsClient(input: {
  page: number;
  pageSize: number;
  q?: string;
}): Promise<AllProductsListResult> {
  const search = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
  });

  if (input.q?.trim()) {
    search.set("q", input.q.trim());
  }

  const res = await staffApiFetch(`/api/staff/all-products?${search.toString()}`, {
    method: "GET",
    auth: true,
  });

  return unwrapResponse<AllProductsListResult>(
    res,
    "Impossible de charger les produits.",
  );
}

export async function updateAllProductLifecycleClient(
  productId: number,
  lifecycle: "ACTIVE" | "DRAFT",
): Promise<AllProductsListItemDto> {
  const res = await staffApiFetch(`/api/staff/all-products/${productId}/lifecycle`, {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lifecycle }),
  });

  const payload = await unwrapResponse<{ product: AllProductsListItemDto }>(
    res,
    "Impossible de mettre à jour le cycle de vie du produit.",
  );

  return payload.product;
}
