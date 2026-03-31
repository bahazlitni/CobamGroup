import type { StaffSession } from "@/features/auth/types";
import { canAccessProducts, canManageProducts } from "@/features/products/access";
import {
  createProductAttributeMetadata,
  deleteProductAttributeMetadata,
  findProductAttributeMetadataById,
  listProductAttributeMetadata,
  listProductAttributeMetadataCandidates,
  updateProductAttributeMetadata,
} from "./repository";
import {
  normalizeProductAttributeMetadataName,
  normalizeProductAttributeMetadataUnit,
} from "./normalize";
import type {
  ProductAttributeMetadataDto,
  ProductAttributeMetadataInput,
  ProductAttributeMetadataSuggestionDto,
} from "./types";

const PROTECTED_PRODUCT_ATTRIBUTE_NAMES = new Set(["couleur", "finition"]);

export class ProductAttributeMetadataServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function mapProductAttributeMetadataDto(record: {
  id: bigint;
  name: string;
  dataType: ProductAttributeMetadataDto["dataType"];
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}): ProductAttributeMetadataDto {
  return {
    id: Number(record.id),
    name: record.name,
    dataType: record.dataType,
    unit: record.unit || null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapProductAttributeMetadataSuggestionDto(record: {
  id: bigint;
  name: string;
  dataType: ProductAttributeMetadataSuggestionDto["dataType"];
  unit: string;
}): ProductAttributeMetadataSuggestionDto {
  return {
    id: Number(record.id),
    name: record.name,
    dataType: record.dataType,
    unit: record.unit || null,
  };
}

function normalizeMetadataInput(input: ProductAttributeMetadataInput) {
  return {
    name: input.name.replace(/\s+/g, " ").trim(),
    dataType: input.dataType,
    unit:
      input.dataType === "NUMBER"
        ? input.unit?.replace(/\s+/g, " ").trim() || null
        : null,
  };
}

function isProtectedProductAttributeName(name: string) {
  return PROTECTED_PRODUCT_ATTRIBUTE_NAMES.has(
    normalizeProductAttributeMetadataName(name),
  );
}

async function assertUniqueProductAttributeMetadata(
  input: ProductAttributeMetadataInput,
  options?: { excludeId?: number },
) {
  const normalizedInput = normalizeMetadataInput(input);
  const normalizedName = normalizeProductAttributeMetadataName(normalizedInput.name);
  const normalizedUnit = normalizeProductAttributeMetadataUnit(normalizedInput.unit);
  const candidates = await listProductAttributeMetadataCandidates();

  const conflict = candidates.find((candidate) => {
    if (options?.excludeId != null && Number(candidate.id) === options.excludeId) {
      return false;
    }

    return (
      candidate.dataType === normalizedInput.dataType &&
      normalizeProductAttributeMetadataName(candidate.name) === normalizedName &&
      normalizeProductAttributeMetadataUnit(candidate.unit || null) === normalizedUnit
    );
  });

  if (conflict) {
    throw new ProductAttributeMetadataServiceError(
      "Une métadonnée d’attribut identique existe déjà.",
      409,
    );
  }
}

function sortSuggestions<T extends { name: string; dataType: string; unit: string | null }>(
  items: readonly T[],
  query: string,
) {
  const normalizedQuery = normalizeProductAttributeMetadataName(query);

  return [...items].sort((left, right) => {
    const leftName = normalizeProductAttributeMetadataName(left.name);
    const rightName = normalizeProductAttributeMetadataName(right.name);
    const leftStartsWith = leftName.startsWith(normalizedQuery);
    const rightStartsWith = rightName.startsWith(normalizedQuery);

    if (leftStartsWith !== rightStartsWith) {
      return leftStartsWith ? -1 : 1;
    }

    if (leftName !== rightName) {
      return leftName.localeCompare(rightName, "fr");
    }

    if (left.dataType !== right.dataType) {
      return left.dataType.localeCompare(right.dataType, "fr");
    }

    return (left.unit || "").localeCompare(right.unit || "", "fr");
  });
}

export async function listProductAttributeMetadataService(session: StaffSession) {
  if (!canAccessProducts(session)) {
    throw new ProductAttributeMetadataServiceError("Accès refusé.", 403);
  }

  const items = await listProductAttributeMetadata();
  return items.map(mapProductAttributeMetadataDto);
}

export async function suggestProductAttributeMetadataService(
  session: StaffSession,
  options: {
    q: string;
    limit?: number;
  },
) {
  if (!canAccessProducts(session)) {
    throw new ProductAttributeMetadataServiceError("Accès refusé.", 403);
  }

  const normalizedQuery = normalizeProductAttributeMetadataName(options.q);

  if (!normalizedQuery) {
    return [] as ProductAttributeMetadataSuggestionDto[];
  }

  const candidates = await listProductAttributeMetadataCandidates();
  const items = sortSuggestions(
    candidates.filter((candidate) =>
      normalizeProductAttributeMetadataName(candidate.name).includes(
        normalizedQuery,
      ),
    ),
    normalizedQuery,
  ).slice(0, options.limit ?? 8);

  return items.map(mapProductAttributeMetadataSuggestionDto);
}

export async function createProductAttributeMetadataService(
  session: StaffSession,
  input: ProductAttributeMetadataInput,
) {
  if (!canManageProducts(session)) {
    throw new ProductAttributeMetadataServiceError("Accès refusé.", 403);
  }

  const normalizedInput = normalizeMetadataInput(input);

  if (!normalizedInput.name) {
    throw new ProductAttributeMetadataServiceError("Le nom est requis.", 400);
  }

  await assertUniqueProductAttributeMetadata(normalizedInput);
  const created = await createProductAttributeMetadata(normalizedInput);
  return mapProductAttributeMetadataDto(created);
}

export async function updateProductAttributeMetadataService(
  session: StaffSession,
  metadataId: number,
  input: ProductAttributeMetadataInput,
) {
  if (!canManageProducts(session)) {
    throw new ProductAttributeMetadataServiceError("Accès refusé.", 403);
  }

  const existing = await findProductAttributeMetadataById(metadataId);

  if (!existing) {
    throw new ProductAttributeMetadataServiceError(
      "Métadonnée d’attribut introuvable.",
      404,
    );
  }

  const normalizedInput = normalizeMetadataInput(input);

  if (!normalizedInput.name) {
    throw new ProductAttributeMetadataServiceError("Le nom est requis.", 400);
  }

  await assertUniqueProductAttributeMetadata(normalizedInput, {
    excludeId: metadataId,
  });
  const updated = await updateProductAttributeMetadata(metadataId, normalizedInput);
  return mapProductAttributeMetadataDto(updated);
}

export async function deleteProductAttributeMetadataService(
  session: StaffSession,
  metadataId: number,
) {
  if (!canManageProducts(session)) {
    throw new ProductAttributeMetadataServiceError("Accès refusé.", 403);
  }

  const existing = await findProductAttributeMetadataById(metadataId);

  if (!existing) {
    throw new ProductAttributeMetadataServiceError(
      "Métadonnée d’attribut introuvable.",
      404,
    );
  }

  if (isProtectedProductAttributeName(existing.name)) {
    throw new ProductAttributeMetadataServiceError(
      `L'attribut « ${existing.name} » ne peut pas être supprimé.`,
      409,
    );
  }

  await deleteProductAttributeMetadata(metadataId);
}
