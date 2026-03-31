"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  ProductAttributeMetadataDto,
  ProductAttributeMetadataInput,
  ProductAttributeMetadataSuggestionDto,
} from "./types";

type ApiOk<T> = { ok: true } & T;
type ApiFail = { ok: false; message?: string };

type MetadataListResponse =
  | ApiOk<{ items: ProductAttributeMetadataDto[] }>
  | ApiFail;
type MetadataDetailResponse =
  | ApiOk<{ item: ProductAttributeMetadataDto }>
  | ApiFail;
type MetadataSuggestionsResponse =
  | ApiOk<{ items: ProductAttributeMetadataSuggestionDto[] }>
  | ApiFail;
type MetadataDeleteResponse = ApiOk<Record<string, never>> | ApiFail;

export class ProductAttributeMetadataClientError extends Error {
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

export async function listProductAttributeMetadataClient() {
  const res = await staffApiFetch("/api/staff/product-attribute-metadata", {
    method: "GET",
    auth: true,
  });
  const data = await parseJsonSafe<MetadataListResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductAttributeMetadataClientError(
      getApiErrorMessage(data) ||
        "Erreur lors du chargement des attributs produit",
      res.status,
    );
  }

  return data.items;
}

export async function suggestProductAttributeMetadataClient(params: {
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
    `/api/staff/product-attribute-metadata/suggest?${searchParams.toString()}`,
    {
      method: "GET",
      auth: true,
    },
  );
  const data = await parseJsonSafe<MetadataSuggestionsResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductAttributeMetadataClientError(
      getApiErrorMessage(data) ||
        "Erreur lors de la suggestion des attributs produit",
      res.status,
    );
  }

  return data.items;
}

export async function createProductAttributeMetadataClient(
  input: ProductAttributeMetadataInput,
) {
  const res = await staffApiFetch("/api/staff/product-attribute-metadata", {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonSafe<MetadataDetailResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductAttributeMetadataClientError(
      getApiErrorMessage(data) ||
        "Erreur lors de la création de l’attribut produit",
      res.status,
    );
  }

  return data.item;
}

export async function updateProductAttributeMetadataClient(
  metadataId: number,
  input: ProductAttributeMetadataInput,
) {
  const res = await staffApiFetch(
    `/api/staff/product-attribute-metadata/${metadataId}`,
    {
      method: "PUT",
      auth: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const data = await parseJsonSafe<MetadataDetailResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductAttributeMetadataClientError(
      getApiErrorMessage(data) ||
        "Erreur lors de la mise à jour de l’attribut produit",
      res.status,
    );
  }

  return data.item;
}

export async function deleteProductAttributeMetadataClient(metadataId: number) {
  const res = await staffApiFetch(
    `/api/staff/product-attribute-metadata/${metadataId}`,
    {
      method: "DELETE",
      auth: true,
    },
  );
  const data = await parseJsonSafe<MetadataDeleteResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ProductAttributeMetadataClientError(
      getApiErrorMessage(data) ||
        "Erreur lors de la suppression de l’attribut produit",
      res.status,
    );
  }
}
