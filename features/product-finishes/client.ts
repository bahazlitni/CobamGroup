"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  ProductFinishDto,
  ProductFinishInput,
  ProductFinishSuggestionDto,
} from "./types";

type ApiOk<T> = { ok: true } & T;
type ApiFail = { ok: false; message?: string };

type ProductFinishListResponse = ApiOk<{ items: ProductFinishDto[] }> | ApiFail;
type ProductFinishDetailResponse = ApiOk<{ item: ProductFinishDto }> | ApiFail;
type ProductFinishDeleteResponse = ApiOk<Record<string, never>> | ApiFail;
type ProductFinishSuggestResponse =
  | ApiOk<{ items: ProductFinishSuggestionDto[] }>
  | ApiFail;

export class ProductFinishClientError extends Error {
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

function getApiErrorMessage(data: unknown): string | undefined {
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return undefined;
}

export async function listProductFinishesClient() {
  const res = await staffApiFetch("/api/staff/product-finishes", {
    method: "GET",
    auth: true,
  });
  const data = await parseJsonSafe<ProductFinishListResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductFinishClientError(
      getApiErrorMessage(data) || "Erreur lors du chargement des finitions",
      res.status,
    );
  }

  return data.items;
}

export async function createProductFinishClient(input: ProductFinishInput) {
  const res = await staffApiFetch("/api/staff/product-finishes", {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonSafe<ProductFinishDetailResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductFinishClientError(
      getApiErrorMessage(data) || "Erreur lors de la création de la finition",
      res.status,
    );
  }

  return data.item;
}

export async function updateProductFinishClient(
  finishId: number,
  input: ProductFinishInput,
) {
  const res = await staffApiFetch(`/api/staff/product-finishes/${finishId}`, {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonSafe<ProductFinishDetailResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductFinishClientError(
      getApiErrorMessage(data) || "Erreur lors de la mise à jour de la finition",
      res.status,
    );
  }

  return data.item;
}

export async function deleteProductFinishClient(finishId: number) {
  const res = await staffApiFetch(`/api/staff/product-finishes/${finishId}`, {
    method: "DELETE",
    auth: true,
  });
  const data = await parseJsonSafe<ProductFinishDeleteResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductFinishClientError(
      getApiErrorMessage(data) || "Erreur lors de la suppression de la finition",
      res.status,
    );
  }
}

export async function suggestProductFinishesClient(params: {
  q: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams({
    q: params.q,
  });

  if (params.limit != null) {
    searchParams.set("limit", String(params.limit));
  }

  const res = await staffApiFetch(
    `/api/staff/product-finishes/suggest?${searchParams.toString()}`,
    {
      method: "GET",
      auth: true,
    },
  );
  const data = await parseJsonSafe<ProductFinishSuggestResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductFinishClientError(
      getApiErrorMessage(data) || "Erreur lors de la suggestion des finitions",
      res.status,
    );
  }

  return data.items;
}
