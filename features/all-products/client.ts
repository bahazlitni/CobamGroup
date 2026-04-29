"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  AllProductsExportAction,
  AllProductsListItemDto,
  AllProductsListResult,
} from "./types";
import { ALL_PRODUCTS_EXPORT_ACTIONS } from "./types";

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

function getDownloadFilename(res: Response, fallback: string) {
  const disposition = res.headers.get("Content-Disposition");

  if (!disposition) {
    return fallback;
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1] ?? fallback;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function listAllProductsClient(input: {
  page: number;
  pageSize: number;
  q?: string;
  kind?: string | null;
}): Promise<AllProductsListResult> {
  const search = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
  });

  if (input.q?.trim()) {
    search.set("q", input.q.trim());
  }
  if (input.kind) {
    search.set("kind", input.kind);
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

export async function exportAllProductsClient(
  action: AllProductsExportAction,
): Promise<void> {
  const option = ALL_PRODUCTS_EXPORT_ACTIONS.find((item) => item.value === action);

  if (!option) {
    throw new AllProductsClientError("Mode d'export invalide.", 400);
  }

  const search = new URLSearchParams({
    mode: option.mode,
    format: option.format,
  });
  const res = await staffApiFetch(
    `/api/staff/all-products/export?${search.toString()}`,
    {
      method: "GET",
      auth: true,
    },
  );

  if (!res.ok) {
    const payload = await parseJsonSafe<ApiFail>(res);
    throw new AllProductsClientError(
      payload?.message ?? "Impossible de générer l'export.",
      res.status,
    );
  }

  const blob = await res.blob();
  downloadBlob(
    blob,
    getDownloadFilename(
      res,
      `all-products-${option.mode}-datasheet.${option.format}`,
    ),
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

export async function updateAllProductsBulkClient(input: {
  ids: number[];
  data: Record<string, unknown>;
}) {
  const res = await staffApiFetch(`/api/staff/all-products/bulk`, {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return unwrapResponse(res, "Impossible de mettre a jour les produits.");
}

export async function deleteAllProductsBulkClient(ids: number[]) {
  const res = await staffApiFetch(`/api/staff/all-products/bulk`, {
    method: "DELETE",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });

  return unwrapResponse(res, "Impossible de supprimer les produits.");
}
