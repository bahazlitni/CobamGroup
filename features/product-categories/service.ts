import type { StaffSession } from "@/features/auth/types";
import { findImageMediaById } from "@/features/media/repository";
import {
  canAccessProductCategories,
  canCreateProductCategories,
  canManageProductCategories,
} from "./access";
import {
  countProductCategories,
  countProductModelsForCategory,
  createProductCategory,
  createProductCategoryAuditLog,
  deleteProductCategory,
  findProductCategoryById,
  findProductCategoryBySlug,
  listProductCategories,
  listProductCategoryParentOptions,
  updateProductCategory,
} from "./repository";
import {
  mapProductCategoryToDetailDto,
  mapProductCategoryToListItemDto,
  mapProductCategoryToParentOptionDto,
  toProductCategoryAuditSnapshot,
} from "./mappers";
import type {
  ProductCategoryCreateInput,
  ProductCategoryListQuery,
  ProductCategoryListResult,
  ProductCategoryUpdateInput,
} from "./types";

export class ProductCategoryServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

async function assertUniqueProductCategorySlug(
  slug: string,
  options?: { excludeCategoryId?: number },
) {
  const sameSlug = await findProductCategoryBySlug(slug);

  if (sameSlug && Number(sameSlug.id) !== (options?.excludeCategoryId ?? -1)) {
    throw new ProductCategoryServiceError(
      "Une categorie de produit avec ce slug existe deja.",
      400,
    );
  }
}

async function assertValidProductCategoryImage(imageMediaId: number | null) {
  if (imageMediaId == null) {
    return;
  }

  const media = await findImageMediaById(imageMediaId);
  if (!media) {
    throw new ProductCategoryServiceError(
      "L'image selectionnee est introuvable ou invalide.",
      400,
    );
  }
}

async function assertValidParentCategory(
  parentId: number | null,
  options?: { categoryId?: number },
) {
  if (parentId == null) return;

  if (options?.categoryId != null && parentId === options.categoryId) {
    throw new ProductCategoryServiceError(
      "Une categorie ne peut pas etre sa propre parente.",
      400,
    );
  }

  let cursorId: number | null = parentId;

  while (cursorId != null) {
    const current = await findProductCategoryById(cursorId);

    if (!current) {
      throw new ProductCategoryServiceError(
        "Categorie parente introuvable.",
        400,
      );
    }

    if (options?.categoryId != null && Number(current.id) === options.categoryId) {
      throw new ProductCategoryServiceError(
        "Une categorie ne peut pas devenir l'enfant de l'une de ses sous-categories.",
        400,
      );
    }

    cursorId = current.parentId == null ? null : Number(current.parentId);
  }
}

export async function listProductCategoriesService(
  session: StaffSession,
  query: ProductCategoryListQuery,
): Promise<ProductCategoryListResult> {
  if (!canAccessProductCategories(session)) {
    throw new ProductCategoryServiceError("Acces refuse.", 403);
  }

  const [items, total] = await Promise.all([
    listProductCategories(query),
    countProductCategories(query),
  ]);

  return {
    items: items.map(mapProductCategoryToListItemDto),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function listProductCategoryParentOptionsService(
  session: StaffSession,
) {
  if (!canAccessProductCategories(session)) {
    throw new ProductCategoryServiceError("Acces refuse.", 403);
  }

  const items = await listProductCategoryParentOptions();
  return items.map(mapProductCategoryToParentOptionDto);
}

export async function getProductCategoryByIdService(
  session: StaffSession,
  categoryId: number,
) {
  if (!canAccessProductCategories(session)) {
    throw new ProductCategoryServiceError("Acces refuse.", 403);
  }

  const category = await findProductCategoryById(categoryId);
  if (!category) {
    throw new ProductCategoryServiceError(
      "Categorie de produit introuvable.",
      404,
    );
  }

  return mapProductCategoryToDetailDto(category);
}

export async function createProductCategoryService(
  session: StaffSession,
  input: ProductCategoryCreateInput,
) {
  if (!canCreateProductCategories(session)) {
    throw new ProductCategoryServiceError("Acces refuse.", 403);
  }

  await assertUniqueProductCategorySlug(input.slug);
  await assertValidParentCategory(input.parentId);
  await assertValidProductCategoryImage(input.imageMediaId);

  const category = await createProductCategory(input);

  await createProductCategoryAuditLog({
    actorUserId: session.id,
    actionType: "CREATE",
    entityId: String(category.id),
    targetLabel: category.name,
    summary: "Creation d'une nouvelle categorie de produit",
    afterSnapshotJson: toProductCategoryAuditSnapshot(category),
  });

  return mapProductCategoryToDetailDto(category);
}

export async function updateProductCategoryService(
  session: StaffSession,
  categoryId: number,
  input: ProductCategoryUpdateInput,
) {
  if (!canManageProductCategories(session)) {
    throw new ProductCategoryServiceError("Acces refuse.", 403);
  }

  const before = await findProductCategoryById(categoryId);
  if (!before) {
    throw new ProductCategoryServiceError(
      "Categorie de produit introuvable.",
      404,
    );
  }

  await assertUniqueProductCategorySlug(input.slug, {
    excludeCategoryId: categoryId,
  });
  await assertValidParentCategory(input.parentId, { categoryId });
  await assertValidProductCategoryImage(input.imageMediaId);

  const category = await updateProductCategory(categoryId, input);

  await createProductCategoryAuditLog({
    actorUserId: session.id,
    actionType: "UPDATE",
    entityId: String(category.id),
    targetLabel: category.name,
    summary: "Mise a jour d'une categorie de produit",
    beforeSnapshotJson: toProductCategoryAuditSnapshot(before),
    afterSnapshotJson: toProductCategoryAuditSnapshot(category),
  });

  return mapProductCategoryToDetailDto(category);
}

export async function deleteProductCategoryService(
  session: StaffSession,
  categoryId: number,
) {
  if (!canManageProductCategories(session)) {
    throw new ProductCategoryServiceError("Acces refuse.", 403);
  }

  const before = await findProductCategoryById(categoryId);
  if (!before) {
    throw new ProductCategoryServiceError(
      "Categorie de produit introuvable.",
      404,
    );
  }

  const productModelCount = await countProductModelsForCategory(categoryId);
  if (productModelCount > 0) {
    throw new ProductCategoryServiceError(
      "Impossible de supprimer une categorie encore liee a des produits.",
      400,
    );
  }

  await deleteProductCategory(categoryId);

  await createProductCategoryAuditLog({
    actorUserId: session.id,
    actionType: "DELETE",
    entityId: String(before.id),
    targetLabel: before.name,
    summary: "Suppression d'une categorie de produit",
    beforeSnapshotJson: toProductCategoryAuditSnapshot(before),
  });
}

