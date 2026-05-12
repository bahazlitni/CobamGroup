"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  ProductColorDto,
  ProductColorInput,
  ProductFinishDto,
  ProductFinishInput,
  ProductTaxonomyAttributeGroupInput,
  ProductTaxonomyAttributeInput,
  ProductTaxonomyEntity,
  ProductTaxonomyGroupInput,
  ProductTaxonomyTypeInput,
  ProductTypesAdminDto,
} from "./types";

type ApiFail = { ok: false; message?: string };
type ApiOk<T> = { ok: true } & T;

export class ProductTaxonomyClientError extends Error {
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

function getErrorMessage(data: ApiFail | ApiOk<unknown> | null | undefined) {
  return data && "message" in data ? data.message : undefined;
}

async function unwrapResponse<T>(res: Response, fallback: string): Promise<T> {
  const data = await parseJsonSafe<ApiOk<T> | ApiFail>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductTaxonomyClientError(getErrorMessage(data) || fallback, res.status);
  }

  return data;
}

export async function getProductTypesAdminClient(): Promise<ProductTypesAdminDto> {
  const res = await staffApiFetch("/api/staff/product-types", {
    method: "GET",
    auth: true,
  });

  return unwrapResponse<ProductTypesAdminDto>(res, "Impossible de charger les types produit.");
}

type TaxonomyMutationInput =
  | ProductTaxonomyGroupInput
  | ProductTaxonomyTypeInput
  | ProductTaxonomyAttributeGroupInput
  | ProductTaxonomyAttributeInput;

export async function createProductTaxonomyEntityClient(
  entity: ProductTaxonomyEntity,
  data: TaxonomyMutationInput,
) {
  const res = await staffApiFetch("/api/staff/product-types", {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity, data }),
  });

  await unwrapResponse<{ item: unknown }>(res, "Impossible de créer cette ressource.");
}

export async function updateProductTaxonomyEntityClient(
  entity: ProductTaxonomyEntity,
  id: number,
  data: TaxonomyMutationInput,
) {
  const res = await staffApiFetch("/api/staff/product-types", {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity, id, data }),
  });

  await unwrapResponse<{ item: unknown }>(res, "Impossible de mettre à jour cette ressource.");
}

export async function deleteProductTaxonomyEntityClient(entity: ProductTaxonomyEntity, id: number) {
  const search = new URLSearchParams({
    entity,
    id: String(id),
  });
  const res = await staffApiFetch(`/api/staff/product-types?${search.toString()}`, {
    method: "DELETE",
    auth: true,
  });

  await unwrapResponse<Record<string, never>>(res, "Impossible de supprimer cette ressource.");
}

export async function reorderProductTypeGroupsClient(
  order: number[],
): Promise<ProductTypesAdminDto> {
  const res = await staffApiFetch("/api/staff/product-types", {
    method: "PATCH",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reorderGroups", order }),
  });

  return unwrapResponse<ProductTypesAdminDto>(res, "Impossible de reordonner les groupes.");
}

export async function reorderProductTypesClient(order: number[]): Promise<ProductTypesAdminDto> {
  const res = await staffApiFetch("/api/staff/product-types", {
    method: "PATCH",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reorderProductTypes", order }),
  });

  return unwrapResponse<ProductTypesAdminDto>(res, "Impossible de reordonner les types produit.");
}

export async function listProductColorsClient(): Promise<ProductColorDto[]> {
  const res = await staffApiFetch("/api/staff/product-colors", {
    method: "GET",
    auth: true,
  });
  const data = await unwrapResponse<{ items: ProductColorDto[] }>(
    res,
    "Impossible de charger les couleurs.",
  );

  return data.items;
}

export async function createProductColorClient(input: ProductColorInput) {
  const res = await staffApiFetch("/api/staff/product-colors", {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  await unwrapResponse<{ item: ProductColorDto }>(res, "Impossible de créer la couleur.");
}

export async function updateProductColorClient(id: number, input: ProductColorInput) {
  const res = await staffApiFetch("/api/staff/product-colors", {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data: input }),
  });

  await unwrapResponse<{ item: ProductColorDto }>(res, "Impossible de mettre à jour la couleur.");
}

export async function deleteProductColorClient(id: number) {
  const res = await staffApiFetch(`/api/staff/product-colors?id=${id}`, {
    method: "DELETE",
    auth: true,
  });

  await unwrapResponse<Record<string, never>>(res, "Impossible de supprimer la couleur.");
}

export async function listProductFinishesClient(): Promise<ProductFinishDto[]> {
  const res = await staffApiFetch("/api/staff/product-finishes", {
    method: "GET",
    auth: true,
  });
  const data = await unwrapResponse<{ items: ProductFinishDto[] }>(
    res,
    "Impossible de charger les finitions.",
  );

  return data.items;
}

export async function createProductFinishClient(input: ProductFinishInput) {
  const res = await staffApiFetch("/api/staff/product-finishes", {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  await unwrapResponse<{ item: ProductFinishDto }>(res, "Impossible de créer la finition.");
}

export async function updateProductFinishClient(id: number, input: ProductFinishInput) {
  const res = await staffApiFetch("/api/staff/product-finishes", {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data: input }),
  });

  await unwrapResponse<{ item: ProductFinishDto }>(res, "Impossible de mettre à jour la finition.");
}

export async function deleteProductFinishClient(id: number) {
  const res = await staffApiFetch(`/api/staff/product-finishes?id=${id}`, {
    method: "DELETE",
    auth: true,
  });

  await unwrapResponse<Record<string, never>>(res, "Impossible de supprimer la finition.");
}
