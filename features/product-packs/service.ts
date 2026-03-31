import type { StaffSession } from "@/features/auth/types";
import { findActiveMediaByIds, findImageMediaById } from "@/features/media/repository";
import { canAccessProducts, canCreateProducts, canManageProducts } from "@/features/products/access";
import { slugifyProductName } from "@/features/products/slug";
import { mapProductPackToDetailDto, mapProductPackToListItemDto, mapProductPackVariantOptionDto, toProductPackAuditSnapshot } from "./mappers";
import {
  countProductPacks,
  createProductPack,
  createProductPackAuditLog,
  deleteProductPack,
  findProductPackById,
  findProductPackBySlug,
  findProductPackVariantsByIds,
  listProductPacks,
  searchProductPackVariants,
  updateProductPack,
} from "./repository";
import type {
  ProductPackCreateInput,
  ProductPackListQuery,
  ProductPackListResult,
  ProductPackUpdateInput,
  ProductPackVariantSearchQuery,
} from "./types";

export class ProductPackServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

async function writeProductPackAuditLogSafely(
  data: Parameters<typeof createProductPackAuditLog>[0],
) {
  try {
    await createProductPackAuditLog(data);
  } catch (error) {
    console.error("PRODUCT_PACK_AUDIT_LOG_ERROR:", error);
  }
}

function buildPackSlug(name: string) {
  const slug = slugifyProductName(name);

  if (!slug) {
    throw new ProductPackServiceError("Le nom du pack ne permet pas de générer un slug.", 400);
  }

  return slug;
}

function normalizePackLines(input: Pick<ProductPackCreateInput, "lines">) {
  return input.lines.map((line, index) => ({
    productVariantId: line.productVariantId,
    quantity: line.quantity,
    sortOrder: index,
  }));
}

function normalizePackMediaIds(input: Pick<ProductPackCreateInput, "mediaIds">) {
  return Array.from(new Set(input.mediaIds));
}

function assertPackHasLines(input: Pick<ProductPackCreateInput, "lines">) {
  if (input.lines.length === 0) {
    throw new ProductPackServiceError("Un pack doit contenir au moins une variante produit.", 400);
  }
}

async function assertUniquePackInput(
  input: Pick<ProductPackCreateInput, "name">,
  options?: { excludePackId?: number },
) {
  const packSlug = buildPackSlug(input.name);
  const existingPack = await findProductPackBySlug(packSlug);

  if (existingPack && Number(existingPack.id) !== (options?.excludePackId ?? -1)) {
    throw new ProductPackServiceError("Un pack avec ce slug existe déjà.", 400);
  }
}

async function assertValidPackLines(
  input: Pick<ProductPackCreateInput, "lines">,
) {
  assertPackHasLines(input);

  const seenVariantIds = new Set<number>();

  for (const line of input.lines) {
    if (seenVariantIds.has(line.productVariantId)) {
      throw new ProductPackServiceError(
        "Une variante produit ne peut apparaître qu'une seule fois dans un pack.",
        400,
      );
    }

    seenVariantIds.add(line.productVariantId);
  }

  const variants = await findProductPackVariantsByIds(input.lines.map((line) => line.productVariantId));

  if (variants.length !== input.lines.length) {
    throw new ProductPackServiceError("Au moins une variante du pack est introuvable.", 400);
  }
}

async function assertValidPackMedia(
  input: Pick<ProductPackCreateInput, "mainImageMediaId" | "mediaIds">,
) {
  if (input.mainImageMediaId != null) {
    const mainImage = await findImageMediaById(input.mainImageMediaId);

    if (!mainImage) {
      throw new ProductPackServiceError(
        "L'image principale sélectionnée est introuvable ou invalide.",
        400,
      );
    }
  }

  const mediaIds = normalizePackMediaIds(input);
  if (mediaIds.length === 0) {
    return;
  }

  const media = await findActiveMediaByIds(mediaIds);

  if (media.length !== mediaIds.length) {
    throw new ProductPackServiceError("Au moins un média du pack est introuvable ou inactif.", 400);
  }
}

export async function listProductPacksService(
  session: StaffSession,
  query: ProductPackListQuery,
): Promise<ProductPackListResult> {
  if (!canAccessProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  const [items, total] = await Promise.all([listProductPacks(query), countProductPacks(query)]);

  return {
    items: items.map(mapProductPackToListItemDto),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function searchProductPackVariantsService(
  session: StaffSession,
  query: ProductPackVariantSearchQuery,
) {
  if (!canAccessProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  const variants = await searchProductPackVariants(query);
  return variants.map(mapProductPackVariantOptionDto);
}

export async function getProductPackByIdService(session: StaffSession, packId: number) {
  if (!canAccessProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  const pack = await findProductPackById(packId);
  if (!pack) {
    throw new ProductPackServiceError("Pack introuvable.", 404);
  }

  return mapProductPackToDetailDto(pack);
}

export async function createProductPackService(
  session: StaffSession,
  input: ProductPackCreateInput,
) {
  if (!canCreateProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  await assertUniquePackInput(input);
  await assertValidPackLines(input);
  await assertValidPackMedia(input);

  const pack = await createProductPack({
    ...input,
    slug: buildPackSlug(input.name),
    mediaIds: normalizePackMediaIds(input),
    lines: normalizePackLines(input),
  });

  await writeProductPackAuditLogSafely({
    actorUserId: session.id,
    actionType: "CREATE",
    entityId: String(pack.id),
    targetLabel: pack.name,
    summary: "Création d'un nouveau pack produit",
    afterSnapshotJson: toProductPackAuditSnapshot(pack),
  });

  return mapProductPackToDetailDto(pack);
}

export async function updateProductPackService(
  session: StaffSession,
  packId: number,
  input: ProductPackUpdateInput,
) {
  if (!canManageProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  const before = await findProductPackById(packId);
  if (!before) {
    throw new ProductPackServiceError("Pack introuvable.", 404);
  }

  await assertUniquePackInput(input, { excludePackId: packId });
  await assertValidPackLines(input);
  await assertValidPackMedia(input);

  const pack = await updateProductPack(packId, {
    ...input,
    slug: buildPackSlug(input.name),
    mediaIds: normalizePackMediaIds(input),
    lines: normalizePackLines(input),
  });

  await writeProductPackAuditLogSafely({
    actorUserId: session.id,
    actionType: "UPDATE",
    entityId: String(pack.id),
    targetLabel: pack.name,
    summary: "Mise à jour d'un pack produit",
    beforeSnapshotJson: toProductPackAuditSnapshot(before),
    afterSnapshotJson: toProductPackAuditSnapshot(pack),
  });

  return mapProductPackToDetailDto(pack);
}

export async function deleteProductPackService(session: StaffSession, packId: number) {
  if (!canManageProducts(session)) {
    throw new ProductPackServiceError("Accès refusé.", 403);
  }

  const before = await findProductPackById(packId);
  if (!before) {
    throw new ProductPackServiceError("Pack introuvable.", 404);
  }

  const deleted = await deleteProductPack(packId);

  await writeProductPackAuditLogSafely({
    actorUserId: session.id,
    actionType: "DELETE",
    entityId: String(deleted.id),
    targetLabel: deleted.name,
    summary: "Suppression d'un pack produit",
    beforeSnapshotJson: toProductPackAuditSnapshot(before),
  });
}
