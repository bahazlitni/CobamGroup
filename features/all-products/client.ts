"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type { AllProductListQuery, AllProductListResult } from "./types";

type ApiOk<T> = { ok: true } & T;
type ApiFail = { ok: false; message?: string };
type AllProductListResponse = ApiOk<AllProductListResult> | ApiFail;

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

function buildListParams(query: Partial<AllProductListQuery>) {
  const search = new URLSearchParams();

  if (query.page != null) search.set("page", String(query.page));
  if (query.pageSize != null) search.set("pageSize", String(query.pageSize));
  if (query.q?.trim()) search.set("q", query.q.trim());
  if (query.sourceType) search.set("sourceType", query.sourceType);

  return search.toString();
}

export async function listAllProductsClient(
  query: Partial<AllProductListQuery>,
): Promise<AllProductListResult> {
  const params = buildListParams(query);
  const res = await staffApiFetch(
    `/api/staff/all-products${params ? `?${params}` : ""}`,
    { method: "GET", auth: true },
  );
  const data = await parseJsonSafe<AllProductListResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new AllProductsClientError(
      getApiErrorMessage(data) || "Erreur lors du chargement des produits.",
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
