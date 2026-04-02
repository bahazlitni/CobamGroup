import { Prisma } from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { findActiveMediaByIds, findImageMediaById } from "@/features/media/repository";
import { canAccessProducts, canCreateProducts, canManageProducts } from "@/features/products/access";
import { toProductAuditSnapshot } from "@/features/products/mappers";
import {
  findProductSubcategoryOptionsByIds,
  findProductVariantsByIds,
  findProductVariantsBySkus,
  findProductVariantsBySlugs,
} from "@/features/products/repository";
import { slugifyProductName } from "@/features/products/slug";
import { mapProductPackToDetailDto, mapProductPackToListItemDto } from "./mappers";
import {
  countProductPacks,
  createProductPack,
  createProductPackAuditLog,
  deleteProductPack,
  findProductPackById,
  findProductPackBySku,
  findProductPackBySlug,
  listProductPacks,
  updateProductPack,
} from "./repository";
import type {
  ProductPackCreateInput,
  ProductPackDetailDto,
  ProductPackListQuery,
  ProductPackListResult,
  ProductPackUpdateInput,
} from "./types";

export class ProductPackServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function buildPackSlug(name: string) {
  const slug = slugifyProductName(name);

  if (!slug) {
    throw new ProductPackServiceError("Le nom du pack ne permet pas de generer un slug.", 400);
  }

  return slug;
}

function assertManualModeValue<T>(
  mode: "AUTO" | "MANUAL",
  value: T | null,
  fieldLabel: string,
) {
  if (mode === "MANUAL" && value == null) {
    throw new ProductPackServiceError(
      `Le champ ${fieldLabel} est requis lorsque le mode manuel est actif.`,
      400,
    );
  }
}

function assertValidPackModes(input: ProductPackCreateInput) {
  assertManualModeValue(
    input.lifecycleStatusMode,
    input.manualLifecycleStatus,
    "manualLifecycleStatus",
  );
  assertManualModeValue(
    input.visibilityMode,
    input.manualVisibility,
    "manualVisibility",
  );
  assertManualModeValue(
    input.priceVisibilityMode,
    input.manualPriceVisibility,
    "manualPriceVisibility",
  );
}

function assertValidPackLines(input: Pick<ProductPackCreateInput, "lines">) {
  if (input.lines.length === 0) {
    throw new ProductPackServiceError("Un pack doit contenir au moins une variante.", 400);
  }

  const seenVariantIds = new Set<number>();

  for (const line of input.lines) {
    if (seenVariantIds.has(line.variantId)) {
      throw new ProductPackServiceError(
        "Une variante ne peut etre presentee qu'une seule fois dans un pack. Utilisez la quantite.",
        400,
      );
    }

    seenVariantIds.add(line.variantId);
  }
}

async function assertValidPackRelations(input: ProductPackCreateInput) {
  assertValidPackLines(input);

  const productSubcategories = await findProductSubcategoryOptionsByIds(
    input.productSubcategoryIds,
  );

  if (productSubcategories.length !== new Set(input.productSubcategoryIds).size) {
    throw new ProductPackServiceError(
      "Au moins une sous-categorie du pack est introuvable.",
      400,
    );
  }

  if (input.mainImageMediaId != null) {
    const mainImage = await findImageMediaById(input.mainImageMediaId);

    if (!mainImage) {
      throw new ProductPackServiceError(
        "L'image principale selectionnee est introuvable ou invalide.",
        400,
      );
    }
  }

  if (input.mediaIds.length > 0) {
    const media = await findActiveMediaByIds(input.mediaIds);

    if (media.length !== new Set(input.mediaIds).size) {
      throw new ProductPackServiceError(
        "Au moins un media de galerie du pack est introuvable ou inactif.",
        400,
      );
    }
  }

  const variants = await findProductVariantsByIds(input.lines.map((line) => line.variantId));

  if (variants.length !== new Set(input.lines.map((line) => line.variantId)).size) {
    throw new ProductPackServiceError(
      "Au moins une variante de pack est introuvable.",
      400,
    );
  }
}

async function assertUniqueProductPackInput(
  input: Pick<ProductPackCreateInput, "name" | "sku">,
  options?: { excludePackId?: number },
) {
  const slug = buildPackSlug(input.name);
  const [samePackSlug, samePackSku, sameVariantSlug, sameVariantSku] = await Promise.all([
    findProductPackBySlug(slug),
    findProductPackBySku(input.sku),
    findProductVariantsBySlugs([slug]),
    findProductVariantsBySkus([input.sku]),
  ]);

  if (samePackSlug && Number(samePackSlug.id) !== (options?.excludePackId ?? -1)) {
    throw new ProductPackServiceError("Un pack avec ce slug existe deja.", 400);
  }

  if (samePackSku && Number(samePackSku.id) !== (options?.excludePackId ?? -1)) {
    throw new ProductPackServiceError("Un pack avec ce SKU existe deja.", 400);
  }

  if (sameVariantSlug.length > 0) {
    throw new ProductPackServiceError("Ce slug est deja utilise par une variante.", 400);
  }

  if (sameVariantSku.length > 0) {
    throw new ProductPackServiceError("Ce SKU est deja utilise par une variante.", 400);
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

function isProjectionUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function normalizePackInput(input: ProductPackCreateInput) {
  return {
    ...input,
    name: input.name.trim(),
    sku: input.sku.trim(),
    description: input.description?.trim() || null,
    descriptionSeo: input.descriptionSeo?.trim() || null,
    productSubcategoryIds: Array.from(new Set(input.productSubcategoryIds)),
    mediaIds: Array.from(
      new Set(
        input.mediaIds.filter((mediaId) => mediaId !== input.mainImageMediaId),
      ),
    ),
    lines: [...input.lines]
      .map((line, index) => ({
        variantId: line.variantId,
        quantity: line.quantity,
        sortOrder: Number.isInteger(line.sortOrder) ? line.sortOrder : index,
      }))
      .sort((left, right) => left.sortOrder - right.sortOrder || left.variantId - right.variantId),
  };
}

export async function listProductPacksService(
  session: StaffSession,
  query: ProductPackListQuery,
): Promise<ProductPackListResult> {
  if (!canAccessProducts(session)) {
    throw new ProductPackServiceError("Acces refuse.", 403);
  }

  const [{ packs, projected }, total] = await Promise.all([
    listProductPacks(query),
    countProductPacks(query),
  ]);
  const projectedById = new Map(projected.map((item) => [item.sourceId.toString(), item]));

  return {
    items: packs
      .map((pack) => {
        const projection = projectedById.get(pack.id.toString());

        if (!projection) {
          return null;
        }

        return mapProductPackToListItemDto({
          pack,
          projected: projection,
        });
      })
      .filter((item): item is ProductPackListResult["items"][number] => item != null),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getProductPackByIdService(
  session: StaffSession,
  packId: number,
): Promise<ProductPackDetailDto> {
  if (!canAccessProducts(session)) {
    throw new ProductPackServiceError("Acces refuse.", 403);
  }

  const result = await findProductPackById(packId);

  if (!result) {
    throw new ProductPackServiceError("Pack introuvable.", 404);
  }

  return mapProductPackToDetailDto(result);
}

export async function createProductPackService(
  session: StaffSession,
  input: ProductPackCreateInput,
) {
  if (!canCreateProducts(session)) {
    throw new ProductPackServiceError("Acces refuse.", 403);
  }

  const normalizedInput = normalizePackInput(input);
  assertValidPackModes(normalizedInput);
  await assertUniqueProductPackInput(normalizedInput);
  await assertValidPackRelations(normalizedInput);

  try {
    const pack = await createProductPack({
      ...normalizedInput,
      slug: buildPackSlug(normalizedInput.name),
    });

    await writeProductPackAuditLogSafely({
      actorUserId: session.id,
      actionType: "CREATE",
      entityId: String(pack.pack.id),
      targetLabel: pack.pack.name,
      summary: "Creation d'un nouveau pack produit",
      afterSnapshotJson: toProductAuditSnapshot(pack),
    });

    return mapProductPackToDetailDto(pack);
  } catch (error) {
    if (isProjectionUniqueError(error)) {
      throw new ProductPackServiceError(
        "Le slug ou le SKU du pack entre en conflit avec un autre produit.",
        400,
      );
    }

    throw error;
  }
}

export async function updateProductPackService(
  session: StaffSession,
  packId: number,
  input: ProductPackUpdateInput,
) {
  if (!canManageProducts(session)) {
    throw new ProductPackServiceError("Acces refuse.", 403);
  }

  const before = await findProductPackById(packId);

  if (!before) {
    throw new ProductPackServiceError("Pack introuvable.", 404);
  }

  const normalizedInput = normalizePackInput(input);
  assertValidPackModes(normalizedInput);
  await assertUniqueProductPackInput(normalizedInput, { excludePackId: packId });
  await assertValidPackRelations(normalizedInput);

  try {
    const pack = await updateProductPack(packId, {
      ...normalizedInput,
      slug: buildPackSlug(normalizedInput.name),
    });

    await writeProductPackAuditLogSafely({
      actorUserId: session.id,
      actionType: "UPDATE",
      entityId: String(pack.pack.id),
      targetLabel: pack.pack.name,
      summary: "Mise a jour d'un pack produit",
      beforeSnapshotJson: toProductAuditSnapshot(before),
      afterSnapshotJson: toProductAuditSnapshot(pack),
    });

    return mapProductPackToDetailDto(pack);
  } catch (error) {
    if (isProjectionUniqueError(error)) {
      throw new ProductPackServiceError(
        "Le slug ou le SKU du pack entre en conflit avec un autre produit.",
        400,
      );
    }

    throw error;
  }
}

export async function deleteProductPackService(
  session: StaffSession,
  packId: number,
) {
  if (!canManageProducts(session)) {
    throw new ProductPackServiceError("Acces refuse.", 403);
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
    beforeSnapshotJson: toProductAuditSnapshot(before),
  });
}
