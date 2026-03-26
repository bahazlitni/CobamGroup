"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  MediaDeleteOptions,
  MediaFileVariant,
  MediaListItemDto,
  MediaListResult,
  MediaUpdateInput,
  MediaUploadRequest,
  MediaSortBy,
  MediaSortDirection,
} from "./types";

type ApiOk<T> = { ok: true } & T;
type ApiFail = { ok: false; message?: string };

type MediaListResponse = ApiOk<MediaListResult> | ApiFail;
type MediaDetailResponse = ApiOk<{ media: MediaListItemDto }> | ApiFail;
type MediaUploadResponse = ApiOk<{ media: MediaListItemDto }> | ApiFail;
type MediaUpdateResponse = ApiOk<{ media: MediaListItemDto }> | ApiFail;
type MediaDeleteResponse = ApiOk<Record<string, never>> | ApiFail;

export class MediaClientError extends Error {
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

function buildListParams(params: {
  page?: number;
  pageSize?: number;
  q?: string;
  kind?: string;
  status?: string;
  sortBy?: MediaSortBy;
  sortDirection?: MediaSortDirection;
}) {
  const search = new URLSearchParams();

  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.kind && params.kind !== "ALL") search.set("kind", params.kind);
  if (params.status && params.status !== "all") search.set("status", params.status);
  if (params.sortBy && params.sortBy !== "date") search.set("sortBy", params.sortBy);
  if (params.sortDirection && params.sortDirection !== "desc") {
    search.set("sortDirection", params.sortDirection);
  }

  return search.toString();
}

export async function listMediaClient(params: {
  page?: number;
  pageSize?: number;
  q?: string;
  kind?: string;
  status?: string;
  sortBy?: MediaSortBy;
  sortDirection?: MediaSortDirection;
}): Promise<MediaListResult> {
  const query = buildListParams(params);
  const res = await staffApiFetch(`/api/staff/medias${query ? `?${query}` : ""}`, {
    method: "GET",
    auth: true,
  });
  const data = await parseJsonSafe<MediaListResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new MediaClientError(
      getErrorMessage(data) || "Erreur lors du chargement de la mediatheque",
      res.status,
    );
  }

  return data;
}

export async function uploadMediaClient(
  input: MediaUploadRequest,
): Promise<MediaListItemDto> {
  const formData = new FormData();
  formData.set("file", input.file);
  if (input.title?.trim()) formData.set("title", input.title.trim());
  if (input.altText?.trim()) formData.set("altText", input.altText.trim());
  if (input.description?.trim()) formData.set("description", input.description.trim());
  if (input.visibility) formData.set("visibility", input.visibility);

  const res = await staffApiFetch("/api/staff/medias", {
    method: "POST",
    auth: true,
    body: formData,
  });
  const data = await parseJsonSafe<MediaUploadResponse>(res);

  if (!res.ok || !data?.ok || !data.media) {
    throw new MediaClientError(
      getErrorMessage(data) || "Erreur lors de l'import du media",
      res.status,
    );
  }

  return data.media;
}

export async function getMediaByIdClient(mediaId: number): Promise<MediaListItemDto> {
  const res = await staffApiFetch(`/api/staff/medias/${mediaId}`, {
    method: "GET",
    auth: true,
  });
  const data = await parseJsonSafe<MediaDetailResponse>(res);

  if (!res.ok || !data?.ok || !data.media) {
    throw new MediaClientError(
      getErrorMessage(data) || "Erreur lors du chargement du media",
      res.status,
    );
  }

  return data.media;
}

export async function updateMediaClient(
  mediaId: number,
  input: MediaUpdateInput,
): Promise<MediaListItemDto> {
  const res = await staffApiFetch(`/api/staff/medias/${mediaId}`, {
    method: "PATCH",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const data = await parseJsonSafe<MediaUpdateResponse>(res);

  if (!res.ok || !data?.ok || !data.media) {
    throw new MediaClientError(
      getErrorMessage(data) || "Erreur lors de la mise a jour du media",
      res.status,
    );
  }

  return data.media;
}

export async function deleteMediaClient(
  mediaId: number,
  options: MediaDeleteOptions = {},
): Promise<void> {
  const params = new URLSearchParams();

  if (options.force) {
    params.set("force", "true");
  }

  const res = await staffApiFetch(
    `/api/staff/medias/${mediaId}${params.size > 0 ? `?${params.toString()}` : ""}`,
    {
    method: "DELETE",
    auth: true,
    },
  );
  const data = await parseJsonSafe<MediaDeleteResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new MediaClientError(
      getErrorMessage(data) || "Erreur lors de la suppression du media",
      res.status,
    );
  }
}

export async function fetchMediaBlobClient(
  mediaId: number,
  options: {
    variant?: MediaFileVariant;
  } = {},
): Promise<Blob> {
  const params = new URLSearchParams();

  if (options.variant && options.variant !== "original") {
    params.set("variant", options.variant);
  }

  const res = await staffApiFetch(
    `/api/staff/medias/${mediaId}/file${params.size > 0 ? `?${params.toString()}` : ""}`,
    {
    method: "GET",
    auth: true,
    },
  );

  if (!res.ok) {
    throw new MediaClientError(
      "Impossible de charger le fichier media.",
      res.status,
    );
  }

  return await res.blob();
}
