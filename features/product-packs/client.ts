"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  ProductPackCreateInput,
  ProductPackDetailDto,
  ProductPackListResult,
  ProductPackUpdateInput,
  ProductPackVariantOptionDto,
} from "./types";

type ApiOk<T> = { ok: true } & T;
type ApiFail = { ok: false; message?: string };

type ProductPackListResponse = ApiOk<ProductPackListResult> | ApiFail;
type ProductPackDetailResponse = ApiOk<{ pack: ProductPackDetailDto }> | ApiFail;
type ProductPackVariantSearchResponse =
  | ApiOk<{ items: ProductPackVariantOptionDto[] }>
  | ApiFail;
type ProductPackDeleteResponse = ApiOk<Record<string, never>> | ApiFail;

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

function buildListParams(params: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const search = new URLSearchParams();

  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q?.trim()) search.set("q", params.q.trim());

  return search.toString();
}

export async function listProductPacksClient(params: {
  page?: number;
  pageSize?: number;
  q?: string;
}): Promise<ProductPackListResult> {
  const query = buildListParams(params);
  const res = await staffApiFetch(`/api/staff/product-packs${query ? `?${query}` : ""}`, {
    method: "GET",
    auth: true,
  });

  const data = await parseJsonSafe<ProductPackListResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductPacksClientError(
      getApiErrorMessage(data) || "Erreur lors du chargement des packs",
      res.status,
    );
  }

  return {
    items: data.items,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
  };
}

export async function searchProductPackVariantsClient(params: {
  q?: string;
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params.q?.trim()) {
    search.set("q", params.q.trim());
  }
  if (params.limit != null) {
    search.set("limit", String(params.limit));
  }

  const res = await staffApiFetch(
    `/api/staff/product-packs/variants${search.toString() ? `?${search.toString()}` : ""}`,
    {
      method: "GET",
      auth: true,
    },
  );

  const data = await parseJsonSafe<ProductPackVariantSearchResponse>(res);

  if (!res.ok || !data?.ok || !data.items) {
    throw new ProductPacksClientError(
      getApiErrorMessage(data) || "Erreur lors du chargement des variantes produit",
      res.status,
    );
  }

  return data.items;
}

export async function getProductPackByIdClient(packId: number): Promise<ProductPackDetailDto> {
  const res = await staffApiFetch(`/api/staff/product-packs/${packId}`, {
    method: "GET",
    auth: true,
  });

  const data = await parseJsonSafe<ProductPackDetailResponse>(res);

  if (!res.ok || !data?.ok || !data.pack) {
    throw new ProductPacksClientError(
      getApiErrorMessage(data) || "Erreur lors du chargement du pack",
      res.status,
    );
  }

  return data.pack;
}

export async function createProductPackClient(
  input: ProductPackCreateInput,
): Promise<ProductPackDetailDto> {
  const res = await staffApiFetch("/api/staff/product-packs", {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await parseJsonSafe<ProductPackDetailResponse>(res);

  if (!res.ok || !data?.ok || !data.pack) {
    throw new ProductPacksClientError(
      getApiErrorMessage(data) || "Erreur lors de la création du pack",
      res.status,
    );
  }

  return data.pack;
}

export async function updateProductPackClient(
  packId: number,
  input: ProductPackUpdateInput,
): Promise<ProductPackDetailDto> {
  const res = await staffApiFetch(`/api/staff/product-packs/${packId}`, {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await parseJsonSafe<ProductPackDetailResponse>(res);

  if (!res.ok || !data?.ok || !data.pack) {
    throw new ProductPacksClientError(
      getApiErrorMessage(data) || "Erreur lors de la mise à jour du pack",
      res.status,
    );
  }

  return data.pack;
}

export async function deleteProductPackClient(packId: number): Promise<void> {
  const res = await staffApiFetch(`/api/staff/product-packs/${packId}`, {
    method: "DELETE",
    auth: true,
  });

  const data = await parseJsonSafe<ProductPackDeleteResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductPacksClientError(
      getApiErrorMessage(data) || "Erreur lors de la suppression du pack",
      res.status,
    );
  }
}
