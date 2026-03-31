import type { StaffSession } from "@/features/auth/types";
import { canAccessProducts, canManageProducts } from "@/features/products/access";
import {
  createProductColor,
  deleteProductColor,
  findProductColorById,
  listProductColorCandidates,
  listProductColors,
  updateProductColor,
} from "./repository";
import { toNormalizedProductColorHex } from "./schemas";
import type {
  ProductColorDto,
  ProductColorInput,
  ProductColorSuggestionDto,
} from "./types";

export class ProductColorServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function mapProductColorDto(record: {
  id: bigint;
  name: string;
  hexValue: string;
  createdAt: Date;
  updatedAt: Date;
}): ProductColorDto {
  return {
    id: Number(record.id),
    name: record.name,
    hexValue: record.hexValue,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function normalizeColorName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fr-FR");
}

async function assertUniqueColor(
  input: ProductColorInput,
  options?: { excludeId?: number },
) {
  const candidates = await listProductColorCandidates();
  const normalizedName = normalizeColorName(input.name);

  const conflict = candidates.find((candidate) => {
    if (options?.excludeId != null && Number(candidate.id) === options.excludeId) {
      return false;
    }

    return (
      normalizeColorName(candidate.name) === normalizedName ||
      candidate.hexValue === input.hexValue
    );
  });

  if (conflict) {
    throw new ProductColorServiceError(
      "Une couleur identique existe déjà.",
      409,
    );
  }
}

export async function listProductColorsService(session: StaffSession) {
  if (!canAccessProducts(session)) {
    throw new ProductColorServiceError("Accès refusé.", 403);
  }

  const items = await listProductColors();
  return items.map(mapProductColorDto);
}

export async function createProductColorService(
  session: StaffSession,
  input: ProductColorInput,
) {
  if (!canManageProducts(session)) {
    throw new ProductColorServiceError("Accès refusé.", 403);
  }

  const normalizedInput = {
    name: input.name.replace(/\s+/g, " ").trim(),
    hexValue: toNormalizedProductColorHex(input.hexValue),
  };

  await assertUniqueColor(normalizedInput);
  const created = await createProductColor(normalizedInput);
  return mapProductColorDto(created);
}

export async function updateProductColorService(
  session: StaffSession,
  colorId: number,
  input: ProductColorInput,
) {
  if (!canManageProducts(session)) {
    throw new ProductColorServiceError("Accès refusé.", 403);
  }

  const existing = await findProductColorById(colorId);

  if (!existing) {
    throw new ProductColorServiceError("Couleur introuvable.", 404);
  }

  const normalizedInput = {
    name: input.name.replace(/\s+/g, " ").trim(),
    hexValue: toNormalizedProductColorHex(input.hexValue),
  };

  await assertUniqueColor(normalizedInput, { excludeId: colorId });
  const updated = await updateProductColor(colorId, normalizedInput);
  return mapProductColorDto(updated);
}

export async function deleteProductColorService(
  session: StaffSession,
  colorId: number,
) {
  if (!canManageProducts(session)) {
    throw new ProductColorServiceError("Accès refusé.", 403);
  }

  const existing = await findProductColorById(colorId);

  if (!existing) {
    throw new ProductColorServiceError("Couleur introuvable.", 404);
  }

  await deleteProductColor(colorId);
}

export async function suggestProductColorsService(
  session: StaffSession,
  options: {
    q: string;
    limit?: number;
  },
) {
  if (!canAccessProducts(session)) {
    throw new ProductColorServiceError("Accès refusé.", 403);
  }

  const normalizedQuery = options.q.trim().toLocaleLowerCase("fr-FR");

  if (!normalizedQuery) {
    return [] as ProductColorSuggestionDto[];
  }

  const items = (await listProductColorCandidates())
    .filter((color) => {
      return (
        normalizeColorName(color.name).startsWith(normalizedQuery) ||
        color.hexValue.toLocaleLowerCase("fr-FR").includes(normalizedQuery)
      );
    })
    .sort((left, right) => left.name.localeCompare(right.name, "fr"))
    .slice(0, options.limit ?? 8)
    .map((color) => ({
      id: Number(color.id),
      value: color.name,
      label: color.name,
      hexValue: color.hexValue,
    }));

  return items;
}
