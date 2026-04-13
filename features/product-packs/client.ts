"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  ProductPackDetailDto,
  ProductPackFormOptionsDto,
  ProductPackListResult,
  ProductPackUpsertInput,
} from "./types";

type ApiOk<T> = { ok: true } & T;
type ApiFail = { ok: false; message?: string };

export class ProductPacksClientError extends Error {
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
    throw new ProductPacksClientError(
      payload && "message" in payload && payload.message ? payload.message : fallbackMessage,
      res.status,
    );
  }

  return payload;
}

export async function getProductPackFormOptionsClient(): Promise<ProductPackFormOptionsDto> {
  const res = await staffApiFetch("/api/staff/product-packs/options", {
    method: "GET",
    auth: true,
  });
  const payload = await unwrapResponse<{ options: ProductPackFormOptionsDto }>(
    res,
    "Impossible de charger les options du pack.",
  );

  return payload.options;
}

export async function listProductPacksClient(input: {
  page: number;
  pageSize: number;
  q?: string;
}): Promise<ProductPackListResult> {
  const search = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
  });

  if (input.q?.trim()) {
    search.set("q", input.q.trim());
  }

  const res = await staffApiFetch(`/api/staff/product-packs?${search.toString()}`, {
    method: "GET",
    auth: true,
  });

  return unwrapResponse<ProductPackListResult>(res, "Impossible de charger les packs.");
}

export async function getProductPackClient(id: number): Promise<ProductPackDetailDto> {
  const res = await staffApiFetch(`/api/staff/product-packs/${id}`, {
    method: "GET",
    auth: true,
  });
  const payload = await unwrapResponse<{ pack: ProductPackDetailDto }>(
    res,
    "Impossible de charger le pack.",
  );

  return payload.pack;
}

export async function createProductPackClient(
  input: ProductPackUpsertInput,
): Promise<ProductPackDetailDto> {
  const res = await staffApiFetch("/api/staff/product-packs", {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await unwrapResponse<{ pack: ProductPackDetailDto }>(
    res,
    "Impossible de creer le pack.",
  );

  return payload.pack;
}

export async function updateProductPackClient(
  id: number,
  input: ProductPackUpsertInput,
): Promise<ProductPackDetailDto> {
  const res = await staffApiFetch(`/api/staff/product-packs/${id}`, {
    method: "PUT",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await unwrapResponse<{ pack: ProductPackDetailDto }>(
    res,
    "Impossible de mettre a jour le pack.",
  );

  return payload.pack;
}

export async function deleteProductPackClient(id: number) {
  const res = await staffApiFetch(`/api/staff/product-packs/${id}`, {
    method: "DELETE",
    auth: true,
  });

  await unwrapResponse<Record<string, never>>(res, "Impossible de supprimer le pack.");
}

export async function updateProductPacksBulkClient(input: {
  ids: number[];
  data: Record<string, unknown>;
}) {
  const res = await staffApiFetch("/api/staff/product-packs/bulk", {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return unwrapResponse(res, "Impossible de mettre a jour les packs.");
}

export async function deleteProductPacksBulkClient(ids: number[]) {
  const res = await staffApiFetch("/api/staff/product-packs/bulk", {
    method: "DELETE",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });

  return unwrapResponse(res, "Impossible de supprimer les packs.");
}
