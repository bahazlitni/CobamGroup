"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  AnnuaireListResult,
  AnnuairePersonDto,
  AnnuairePersonInput,
} from "./types";

type ApiOk<T> = { ok: true } & T;
type ApiFail = { ok: false; message?: string };

type AnnuaireListResponse = ApiOk<AnnuaireListResult> | ApiFail;
type AnnuairePersonResponse =
  | ApiOk<{ person: AnnuairePersonDto }>
  | ApiFail;
type AnnuaireDeleteResponse = ApiOk<Record<string, never>> | ApiFail;

export class AnnuaireClientError extends Error {
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
}) {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q?.trim()) search.set("q", params.q.trim());
  return search.toString();
}

export async function listAnnuaireClient(params: {
  page?: number;
  pageSize?: number;
  q?: string;
}): Promise<AnnuaireListResult> {
  const query = buildListParams(params);
  const res = await staffApiFetch(
    `/api/staff/annuaire${query ? `?${query}` : ""}`,
    { method: "GET", auth: true },
  );
  const data = await parseJsonSafe<AnnuaireListResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new AnnuaireClientError(
      getErrorMessage(data) || "Erreur lors du chargement de l'annuaire.",
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

export async function createAnnuaireClient(
  input: AnnuairePersonInput,
): Promise<AnnuairePersonDto> {
  const res = await staffApiFetch("/api/staff/annuaire", {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonSafe<AnnuairePersonResponse>(res);

  if (!res.ok || !data?.ok || !data.person) {
    throw new AnnuaireClientError(
      getErrorMessage(data) || "Erreur lors de la creation du contact.",
      res.status,
    );
  }

  return data.person;
}

export async function updateAnnuaireClient(
  personId: number,
  input: AnnuairePersonInput,
): Promise<AnnuairePersonDto> {
  const res = await staffApiFetch(`/api/staff/annuaire/${personId}`, {
    method: "PATCH",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonSafe<AnnuairePersonResponse>(res);

  if (!res.ok || !data?.ok || !data.person) {
    throw new AnnuaireClientError(
      getErrorMessage(data) || "Erreur lors de la mise a jour du contact.",
      res.status,
    );
  }

  return data.person;
}

export async function deleteAnnuaireClient(personId: number): Promise<void> {
  const res = await staffApiFetch(`/api/staff/annuaire/${personId}`, {
    method: "DELETE",
    auth: true,
  });
  const data = await parseJsonSafe<AnnuaireDeleteResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new AnnuaireClientError(
      getErrorMessage(data) || "Erreur lors de la suppression du contact.",
      res.status,
    );
  }
}
