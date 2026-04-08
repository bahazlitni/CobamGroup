"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  SingleProductDetailDto,
  SingleProductFormOptionsDto,
  SingleProductUpsertInput,
} from "./types";

type ApiOk<T> = { ok: true } & T;
type ApiFail = { ok: false; message?: string };

export class SingleProductsClientError extends Error {
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
    throw new SingleProductsClientError(
      payload && "message" in payload && payload.message
        ? payload.message
        : fallbackMessage,
      res.status,
    );
  }

  return payload;
}

export async function getSingleProductFormOptionsClient(): Promise<SingleProductFormOptionsDto> {
  const res = await staffApiFetch("/api/staff/single-products/options", {
    method: "GET",
    auth: true,
  });
  const payload = await unwrapResponse<{ options: SingleProductFormOptionsDto }>(
    res,
    "Impossible de charger les options du produit.",
  );

  return payload.options;
}

export async function getSingleProductClient(id: number): Promise<SingleProductDetailDto> {
  const res = await staffApiFetch(`/api/staff/single-products/${id}`, {
    method: "GET",
    auth: true,
  });
  const payload = await unwrapResponse<{ product: SingleProductDetailDto }>(
    res,
    "Impossible de charger le produit simple.",
  );

  return payload.product;
}

export async function createSingleProductClient(
  input: SingleProductUpsertInput,
): Promise<SingleProductDetailDto> {
  const res = await staffApiFetch("/api/staff/single-products", {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await unwrapResponse<{ product: SingleProductDetailDto }>(
    res,
    "Impossible de créer le produit simple.",
  );

  return payload.product;
}

export async function updateSingleProductClient(
  id: number,
  input: SingleProductUpsertInput,
): Promise<SingleProductDetailDto> {
  const res = await staffApiFetch(`/api/staff/single-products/${id}`, {
    method: "PUT",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await unwrapResponse<{ product: SingleProductDetailDto }>(
    res,
    "Impossible de mettre à jour le produit simple.",
  );

  return payload.product;
}

export async function deleteSingleProductClient(id: number) {
  const res = await staffApiFetch(`/api/staff/single-products/${id}`, {
    method: "DELETE",
    auth: true,
  });

  await unwrapResponse<Record<string, never>>(
    res,
    "Impossible de supprimer le produit simple.",
  );
}
