"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type { ProductCertificateDto, ProductCertificateInput } from "./types";

type ApiFail = { ok: false; message?: string };
type ApiOk<T> = { ok: true } & T;

export class ProductCertificatesClientError extends Error {
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

async function unwrapResponse<T>(res: Response, fallback: string): Promise<T> {
  const data = await parseJsonSafe<ApiOk<T> | ApiFail>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductCertificatesClientError(
      data && "message" in data && data.message ? data.message : fallback,
      res.status,
    );
  }

  return data;
}

export async function listProductCertificatesClient(): Promise<ProductCertificateDto[]> {
  const res = await staffApiFetch("/api/staff/product-certificates", {
    method: "GET",
    auth: true,
  });
  const data = await unwrapResponse<{ items: ProductCertificateDto[] }>(
    res,
    "Impossible de charger les certificats.",
  );

  return data.items;
}

export async function createProductCertificateClient(input: ProductCertificateInput) {
  const res = await staffApiFetch("/api/staff/product-certificates", {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await unwrapResponse<{ item: ProductCertificateDto }>(
    res,
    "Impossible de creer le certificat.",
  );

  return data.item;
}

export async function updateProductCertificateClient(id: number, input: ProductCertificateInput) {
  const res = await staffApiFetch("/api/staff/product-certificates", {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data: input }),
  });

  const data = await unwrapResponse<{ item: ProductCertificateDto }>(
    res,
    "Impossible de mettre a jour le certificat.",
  );

  return data.item;
}

export async function deleteProductCertificateClient(id: number) {
  const res = await staffApiFetch(`/api/staff/product-certificates?id=${id}`, {
    method: "DELETE",
    auth: true,
  });

  await unwrapResponse<Record<string, never>>(res, "Impossible de supprimer le certificat.");
}
