"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type { OrganizationDto, OrganizationInput } from "./types";

type ApiFail = { ok: false; message?: string };
type ApiOk<T> = { ok: true } & T;

export class OrganizationClientError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return await res.json() as T;
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
    throw new OrganizationClientError(
      getErrorMessage(data) || fallback,
      res.status,
    );
  }

  return data;
}

export async function listOrganizationsClient(): Promise<OrganizationDto[]> {
  const res = await staffApiFetch("/api/staff/organizations", {
    method: "GET",
    auth: true,
  });
  const data = await unwrapResponse<{ items: OrganizationDto[] }>(
    res,
    "Impossible de charger les marques.",
  );

  return data.items;
}

export async function createOrganizationClient(input: OrganizationInput) {
  const res = await staffApiFetch("/api/staff/organizations", {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  await unwrapResponse<{ item: OrganizationDto }>(
    res,
    "Impossible de creer la marque.",
  );
}

export async function updateOrganizationClient(
  id: number,
  input: OrganizationInput,
) {
  const res = await staffApiFetch("/api/staff/organizations", {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data: input }),
  });

  await unwrapResponse<{ item: OrganizationDto }>(
    res,
    "Impossible de mettre a jour la marque.",
  );
}

export async function deleteOrganizationClient(id: number) {
  const res = await staffApiFetch(`/api/staff/organizations?id=${id}`, {
    method: "DELETE",
    auth: true,
  });

  await unwrapResponse<Record<string, never>>(
    res,
    "Impossible de supprimer la marque.",
  );
}
