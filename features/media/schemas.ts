import { MediaKind, MediaVisibility } from "@prisma/client";
import {
  DEFAULT_MEDIA_PAGE_SIZE,
  MAX_MEDIA_PAGE_SIZE,
  type MediaFileVariant,
  type MediaFilterKind,
  type MediaFilterStatus,
  type MediaListQuery,
  type MediaSortBy,
  type MediaSortDirection,
  type MediaUpdateInput,
  type MediaUploadInput,
} from "./types";

export class MediaValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function parseOptionalString(value: FormDataEntryValue | string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseMediaVisibility(
  value: string | null | undefined,
): MediaVisibility | null {
  if (value == null) {
    return null;
  }

  return value === MediaVisibility.PUBLIC
    ? MediaVisibility.PUBLIC
    : value === MediaVisibility.PRIVATE
      ? MediaVisibility.PRIVATE
      : null;
}

export function parseMediaIdParam(idParam: string) {
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    throw new MediaValidationError("Identifiant media invalide.");
  }

  return id;
}

function parseSortBy(value: string | null): MediaSortBy {
  if (value === "name" || value === "size") {
    return value;
  }

  return "date";
}

function parseSortDirection(value: string | null): MediaSortDirection {
  return value === "asc" ? "asc" : "desc";
}

export function parseMediaListQuery(
  searchParams: URLSearchParams,
): MediaListQuery {
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const pageSizeRaw = Number(searchParams.get("pageSize") ?? String(DEFAULT_MEDIA_PAGE_SIZE));
  const pageSize =
    Number.isInteger(pageSizeRaw) && pageSizeRaw >= 12 && pageSizeRaw <= MAX_MEDIA_PAGE_SIZE
      ? pageSizeRaw
      : DEFAULT_MEDIA_PAGE_SIZE;

  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() ? qRaw.trim() : undefined;

  const kindRaw = searchParams.get("kind");
  const kind: MediaFilterKind =
    kindRaw && Object.values(MediaKind).includes(kindRaw as MediaKind)
      ? (kindRaw as MediaKind)
      : "ALL";

  const statusRaw = searchParams.get("status");
  const status: MediaFilterStatus =
    statusRaw === "active" || statusRaw === "inactive" ? statusRaw : "all";

  return {
    page,
    pageSize,
    q,
    kind,
    status,
    sortBy: parseSortBy(searchParams.get("sortBy")),
    sortDirection: parseSortDirection(searchParams.get("sortDirection")),
  };
}

export function parseMediaUploadFormData(formData: FormData): MediaUploadInput {
  const fileEntry = formData.get("file");

  if (!(fileEntry instanceof File) || fileEntry.size <= 0) {
    throw new MediaValidationError("Aucun fichier valide n'a ete fourni.");
  }

  return {
    file: fileEntry,
    title: parseOptionalString(formData.get("title")),
    altText: parseOptionalString(formData.get("altText")),
    description: parseOptionalString(formData.get("description")),
    visibility:
      parseMediaVisibility(
        typeof formData.get("visibility") === "string"
          ? (formData.get("visibility") as string)
          : null,
      ) ?? MediaVisibility.PRIVATE,
  };
}

export function parseMediaUpdateInput(raw: unknown): MediaUpdateInput {
  if (typeof raw !== "object" || raw === null) {
    throw new MediaValidationError("Requete invalide.");
  }

  const visibility =
    "visibility" in raw && typeof raw.visibility === "string"
      ? parseMediaVisibility(raw.visibility)
      : null;

  if (!visibility) {
    throw new MediaValidationError("Visibilite invalide.");
  }

  return {
    visibility,
  };
}

export function parseMediaFileVariant(
  searchParams: URLSearchParams,
): MediaFileVariant {
  return searchParams.get("variant") === "thumbnail"
    ? "thumbnail"
    : "original";
}
