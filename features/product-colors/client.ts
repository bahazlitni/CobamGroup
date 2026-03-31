"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  ProductColorDto,
  ProductColorInput,
  ProductColorSuggestionDto,
} from "./types";

type ApiOk<T> = { ok: true } & T;
type ApiFail = { ok: false; message?: string };

type ProductColorListResponse = ApiOk<{ items: ProductColorDto[] }> | ApiFail;
type ProductColorDetailResponse = ApiOk<{ item: ProductColorDto }> | ApiFail;
type ProductColorDeleteResponse = ApiOk<Record<string, never>> | ApiFail;
type ProductColorSuggestResponse =
  | ApiOk<{ items: ProductColorSuggestionDto[] }>
  | ApiFail;

export class ProductColorClientError extends Error {
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

export async function listProductColorsClient() {
  const res = await staffApiFetch("/api/staff/product-colors", {
    method: "GET",
    auth: true,
  });
  const data = await parseJsonSafe<ProductColorListResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductColorClientError(
      getApiErrorMessage(data) || "Erreur lors du chargement des couleurs",
      res.status,
    );
  }

  return data.items;
}

export async function createProductColorClient(input: ProductColorInput) {
  const res = await staffApiFetch("/api/staff/product-colors", {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonSafe<ProductColorDetailResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductColorClientError(
      getApiErrorMessage(data) || "Erreur lors de la création de la couleur",
      res.status,
    );
  }

  return data.item;
}

export async function updateProductColorClient(
  colorId: number,
  input: ProductColorInput,
) {
  const res = await staffApiFetch(`/api/staff/product-colors/${colorId}`, {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonSafe<ProductColorDetailResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductColorClientError(
      getApiErrorMessage(data) || "Erreur lors de la mise à jour de la couleur",
      res.status,
    );
  }

  return data.item;
}

export async function deleteProductColorClient(colorId: number) {
  const res = await staffApiFetch(`/api/staff/product-colors/${colorId}`, {
    method: "DELETE",
    auth: true,
  });
  const data = await parseJsonSafe<ProductColorDeleteResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductColorClientError(
      getApiErrorMessage(data) || "Erreur lors de la suppression de la couleur",
      res.status,
    );
  }
}

export async function suggestProductColorsClient(params: {
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
    `/api/staff/product-colors/suggest?${searchParams.toString()}`,
    {
      method: "GET",
      auth: true,
    },
  );
  const data = await parseJsonSafe<ProductColorSuggestResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductColorClientError(
      getApiErrorMessage(data) || "Erreur lors de la suggestion des couleurs",
      res.status,
    );
  }

  return data.items;
}
