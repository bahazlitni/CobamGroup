import type { StaffSession } from "@/features/auth/types";
import { findImageMediaById } from "@/features/media/repository";
import { canAccessProducts, canManageProducts } from "@/features/products/access";
import {
  createProductFinish,
  deleteProductFinish,
  findProductFinishById,
  listProductFinishCandidates,
  listProductFinishes,
  updateProductFinish,
} from "./repository";
import { toNormalizedProductFinishHex } from "./schemas";
import type {
  ProductFinishDto,
  ProductFinishInput,
  ProductFinishSuggestionDto,
} from "./types";

export class ProductFinishServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function mapProductFinishDto(record: {
  id: bigint;
  name: string;
  colorHex: string;
  mediaId: bigint | null;
  media: {
    id: bigint;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}): ProductFinishDto {
  const mediaId = record.mediaId != null ? Number(record.mediaId) : null;

  return {
    id: Number(record.id),
    name: record.name,
    colorHex: record.colorHex,
    mediaId,
    mediaThumbnailEndpoint:
      mediaId != null ? `/api/staff/medias/${mediaId}/file?variant=thumbnail` : null,
    mediaFileEndpoint:
      mediaId != null ? `/api/staff/medias/${mediaId}/file` : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function normalizeFinishName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fr-FR");
}

async function assertUniqueFinish(
  input: ProductFinishInput,
  options?: { excludeId?: number },
) {
  const candidates = await listProductFinishCandidates();
  const normalizedName = normalizeFinishName(input.name);

  const conflict = candidates.find((candidate) => {
    if (options?.excludeId != null && Number(candidate.id) === options.excludeId) {
      return false;
    }

    return normalizeFinishName(candidate.name) === normalizedName;
  });

  if (conflict) {
    throw new ProductFinishServiceError("Une finition identique existe déjà.", 409);
  }
}

async function assertFinishMedia(mediaId: number | null) {
  if (mediaId == null) {
    throw new ProductFinishServiceError("L'image de la finition est requise.", 400);
  }

  const media = await findImageMediaById(mediaId);

  if (!media) {
    throw new ProductFinishServiceError("Image de finition introuvable.", 404);
  }

  if (
    media.widthPx == null ||
    media.heightPx == null ||
    media.widthPx !== media.heightPx
  ) {
    throw new ProductFinishServiceError(
      "L'image d'une finition doit être carrée.",
      400,
    );
  }

  if (media.widthPx < 256 || media.heightPx < 256) {
    throw new ProductFinishServiceError(
      "L'image d'une finition doit faire au moins 256×256.",
      400,
    );
  }
}

export async function listProductFinishesService(session: StaffSession) {
  if (!canAccessProducts(session)) {
    throw new ProductFinishServiceError("Accès refusé.", 403);
  }

  const items = await listProductFinishes();
  return items.map(mapProductFinishDto);
}

export async function createProductFinishService(
  session: StaffSession,
  input: ProductFinishInput,
) {
  if (!canManageProducts(session)) {
    throw new ProductFinishServiceError("Accès refusé.", 403);
  }

  const normalizedInput = {
    name: input.name.replace(/\s+/g, " ").trim(),
    colorHex: toNormalizedProductFinishHex(input.colorHex),
    mediaId: input.mediaId,
  };

  await assertFinishMedia(normalizedInput.mediaId);
  await assertUniqueFinish(normalizedInput);
  const created = await createProductFinish(normalizedInput);
  return mapProductFinishDto(created);
}

export async function updateProductFinishService(
  session: StaffSession,
  finishId: number,
  input: ProductFinishInput,
) {
  if (!canManageProducts(session)) {
    throw new ProductFinishServiceError("Accès refusé.", 403);
  }

  const existing = await findProductFinishById(finishId);

  if (!existing) {
    throw new ProductFinishServiceError("Finition introuvable.", 404);
  }

  const normalizedInput = {
    name: input.name.replace(/\s+/g, " ").trim(),
    colorHex: toNormalizedProductFinishHex(input.colorHex),
    mediaId: input.mediaId,
  };

  await assertFinishMedia(normalizedInput.mediaId);
  await assertUniqueFinish(normalizedInput, { excludeId: finishId });
  const updated = await updateProductFinish(finishId, normalizedInput);
  return mapProductFinishDto(updated);
}

export async function deleteProductFinishService(
  session: StaffSession,
  finishId: number,
) {
  if (!canManageProducts(session)) {
    throw new ProductFinishServiceError("Accès refusé.", 403);
  }

  const existing = await findProductFinishById(finishId);

  if (!existing) {
    throw new ProductFinishServiceError("Finition introuvable.", 404);
  }

  await deleteProductFinish(finishId);
}

export async function suggestProductFinishesService(
  session: StaffSession,
  options: {
    q: string;
    limit?: number;
  },
) {
  if (!canAccessProducts(session)) {
    throw new ProductFinishServiceError("Accès refusé.", 403);
  }

  const normalizedQuery = options.q.trim().toLocaleLowerCase("fr-FR");

  if (!normalizedQuery) {
    return [] as ProductFinishSuggestionDto[];
  }

  const items = (await listProductFinishCandidates())
    .filter((finish) => {
      return (
        normalizeFinishName(finish.name).includes(normalizedQuery) ||
        finish.colorHex.toLocaleLowerCase("fr-FR").includes(normalizedQuery)
      );
    })
    .sort((left, right) => left.name.localeCompare(right.name, "fr"))
    .slice(0, options.limit ?? 8)
    .map((finish) => ({
      id: Number(finish.id),
      value: finish.name,
      label: finish.name,
      colorHex: finish.colorHex,
      mediaId: finish.mediaId != null ? Number(finish.mediaId) : null,
    }));

  return items;
}
